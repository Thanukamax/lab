/* ============================================================================
   LiquidFluid — framework-agnostic GPU fluid (Navier–Stokes velocity + dye).
   The dye field is used as a DENSITY / HEIGHT field; the display shader paints
   it as glossy black "ink" (dark) or colourful clear water (light).

   Usage:
     import { LiquidFluid } from './fluid.js';
     const fluid = new LiquidFluid(canvasEl, { theme: 'dark' });
     fluid.setTheme('light');
     fluid.splatAt(clientX, clientY);   // click ripple
     fluid.blow(0.8);                   // mic gust
     fluid.destroy();

   Every tunable lives in DEFAULTS below; pass overrides to the constructor.
   ============================================================================ */

export const LIQUID_DEFAULTS = {
  /* performance / resolution */
  CAP_DPR: 1.75,
  CAPTURABLE: true,            // preserveDrawingBuffer (keeps the canvas screenshot-able)
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  PAUSE_WHEN_HIDDEN: true,

  /* fluid dynamics */
  VISCOSITY: 0.0,
  VISCOSITY_ITERATIONS: 12,
  VELOCITY_DISSIPATION: 0.25,
  DENSITY_DISSIPATION: 1.5,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,

  /* pointer / splats */
  SPLAT_RADIUS: 0.22,
  SPLAT_FORCE: 6200,
  CLICK_FORCE: 3200,           // outward impulse for a click "drop"
  INTRO_SPLATS: 6,
  AUTO_SPLAT: true,
  AUTO_SPLAT_INTERVAL: 4.5,
  POINTER_TRACK: true,         // cursor movement injects trailing splats

  DEFAULT_THEME: 'dark',

  /* DARK — glossy black ink / liquid mercury */
  DARK: {
    background:[0,0,0], ink:[0.085,0.10,0.125], specular:[0.80,0.90,1.0],
    iridescence:[0.18,0.85,0.78], glossiness:180, specStrength:0.95,
    iridStrength:0.70, glow:0.06, exposure:1.5,
  },
  /* LIGHT — colourful clear water */
  LIGHT: {
    background:[0.84,0.95,0.98], backgroundDeep:[0.55,0.84,0.90], water:[0.20,0.66,0.78],
    foam:[1,1,1], caustic:[0.70,1.0,0.95], causticStrength:0.42, foamStrength:0.60,
    iridStrength:0.50, refraction:0.032, glossiness:90, exposure:1.0,
  },
};

function mergeConfig(base, over) {
  const out = Object.assign({}, base, over);
  if (over && over.DARK)  out.DARK  = Object.assign({}, base.DARK,  over.DARK);
  if (over && over.LIGHT) out.LIGHT = Object.assign({}, base.LIGHT, over.LIGHT);
  return out;
}

/* ----------------------------------- shaders (GLSL ES 1.00) ---------------- */
const VERT = `
  precision highp float; attribute vec2 aPosition;
  varying vec2 vUv, vL, vR, vT, vB; uniform vec2 texelSize;
  void main(){ vUv=aPosition*0.5+0.5;
    vL=vUv-vec2(texelSize.x,0.); vR=vUv+vec2(texelSize.x,0.);
    vT=vUv+vec2(0.,texelSize.y); vB=vUv-vec2(0.,texelSize.y);
    gl_Position=vec4(aPosition,0.,1.); }`;

const COPY = `precision mediump float; precision mediump sampler2D;
  varying vec2 vUv; uniform sampler2D uTexture; void main(){ gl_FragColor=texture2D(uTexture,vUv); }`;

const CLEAR = `precision mediump float; precision mediump sampler2D;
  varying vec2 vUv; uniform sampler2D uTexture; uniform float value;
  void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }`;

const SPLAT = `precision highp float; precision highp sampler2D;
  varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio;
  uniform vec3 color; uniform vec2 point; uniform float radius;
  void main(){ vec2 p=vUv-point.xy; p.x*=aspectRatio;
    vec3 splat=exp(-dot(p,p)/radius)*color;
    gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+splat,1.); }`;

const ADVECT = `precision highp float; precision highp sampler2D;
  varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource;
  uniform vec2 texelSize; uniform vec2 dyeTexelSize; uniform float dt; uniform float dissipation;
  vec4 bilerp(sampler2D s, vec2 uv, vec2 ts){ vec2 st=uv/ts-0.5; vec2 iuv=floor(st); vec2 f=fract(st);
    vec4 a=texture2D(s,(iuv+vec2(0.5,0.5))*ts), b=texture2D(s,(iuv+vec2(1.5,0.5))*ts),
         c=texture2D(s,(iuv+vec2(0.5,1.5))*ts), d=texture2D(s,(iuv+vec2(1.5,1.5))*ts);
    return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
  void main(){
  #ifdef MANUAL_FILTERING
    vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;
    vec4 result=bilerp(uSource,coord,dyeTexelSize);
  #else
    vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;
    vec4 result=texture2D(uSource,coord);
  #endif
    gl_FragColor=result/(1.0+dissipation*dt); }`;

const DIVERGENCE = `precision mediump float; precision mediump sampler2D;
  varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity;
  void main(){ float L=texture2D(uVelocity,vL).x, R=texture2D(uVelocity,vR).x,
    T=texture2D(uVelocity,vT).y, B=texture2D(uVelocity,vB).y; vec2 C=texture2D(uVelocity,vUv).xy;
    if(vL.x<0.)L=-C.x; if(vR.x>1.)R=-C.x; if(vT.y>1.)T=-C.y; if(vB.y<0.)B=-C.y;
    gl_FragColor=vec4(0.5*(R-L+T-B),0.,0.,1.); }`;

const CURL = `precision mediump float; precision mediump sampler2D;
  varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity;
  void main(){ float L=texture2D(uVelocity,vL).y, R=texture2D(uVelocity,vR).y,
    T=texture2D(uVelocity,vT).x, B=texture2D(uVelocity,vB).x;
    gl_FragColor=vec4(0.5*(R-L-T+B),0.,0.,1.); }`;

const VORTICITY = `precision highp float; precision highp sampler2D;
  varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity; uniform sampler2D uCurl;
  uniform float curl; uniform float dt;
  void main(){ float L=texture2D(uCurl,vL).x, R=texture2D(uCurl,vR).x,
    T=texture2D(uCurl,vT).x, B=texture2D(uCurl,vB).x, C=texture2D(uCurl,vUv).x;
    vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L)); force/=length(force)+0.0001;
    force*=curl*C; force.y*=-1.; vec2 v=texture2D(uVelocity,vUv).xy; v+=force*dt;
    v=min(max(v,-1000.),1000.); gl_FragColor=vec4(v,0.,1.); }`;

const PRESSURE = `precision mediump float; precision mediump sampler2D;
  varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure; uniform sampler2D uDivergence;
  void main(){ float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x,
    T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x, d=texture2D(uDivergence,vUv).x;
    gl_FragColor=vec4((L+R+B+T-d)*0.25,0.,0.,1.); }`;

const GRADIENT = `precision mediump float; precision mediump sampler2D;
  varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure; uniform sampler2D uVelocity;
  void main(){ float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x,
    T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x; vec2 v=texture2D(uVelocity,vUv).xy;
    v-=vec2(R-L,T-B); gl_FragColor=vec4(v,0.,1.); }`;

const VISCOSITY_S = `precision highp float; precision highp sampler2D;
  varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity; uniform float alpha; uniform float rBeta;
  void main(){ vec2 L=texture2D(uVelocity,vL).xy, R=texture2D(uVelocity,vR).xy,
    T=texture2D(uVelocity,vT).xy, B=texture2D(uVelocity,vB).xy, C=texture2D(uVelocity,vUv).xy;
    gl_FragColor=vec4((L+R+T+B+alpha*C)*rBeta,0.,1.); }`;

/* display — density(dye) -> normal -> two liquids: dark glossy ink / light colourful water */
const DISPLAY = `precision highp float; precision highp sampler2D;
  varying vec2 vUv,vL,vR,vT,vB;
  uniform sampler2D uTexture; uniform sampler2D uVelocity; uniform float uTime; uniform int uTheme;
  uniform vec3 uBg,uInk,uSpecular,uIrid; uniform float uGloss,uSpecStr,uIridStr,uGlow;
  uniform vec3 uBgL,uBgDeep,uWater,uFoam,uCaustic;
  uniform float uCausticStr,uFoamStr,uRefraction,uGlossL,uExposure,uIridStrL;
  float lum(vec3 c){ return dot(c,vec3(0.299,0.587,0.114)); }
  vec3 tonemap(vec3 c){ return vec3(1.0)-exp(-max(c,0.0)*uExposure); }
  void main(){
    float hC=lum(texture2D(uTexture,vUv).rgb), hL=lum(texture2D(uTexture,vL).rgb),
          hR=lum(texture2D(uTexture,vR).rgb), hT=lum(texture2D(uTexture,vT).rgb), hB=lum(texture2D(uTexture,vB).rgb);
    float thickness=clamp(hC,0.0,1.0);
    float mask=smoothstep(0.0,0.30,hC);
    float grad=length(vec2(hR-hL,hT-hB));
    vec3 V=vec3(0.,0.,1.); vec3 Ldir=normalize(vec3(0.5,0.7,0.78)); vec3 H=normalize(Ldir+V);
    float speed=length(texture2D(uVelocity,vUv).xy);
    vec3 outColor;
    if(uTheme==0){
      vec3 N=normalize(vec3((hL-hR)*3.2,(hB-hT)*3.2,0.10));
      vec3 body=mix(uBg,uInk,mask);
      float diff=max(dot(N,Ldir),0.0); body+=uInk*diff*0.9*mask;
      float spec=pow(max(dot(N,H),0.0),uGloss)*uSpecStr;
      float fres=pow(1.0-max(dot(N,V),0.0),2.5);
      float phase=fres*6.0+thickness*3.0+uTime*0.25;
      vec3 rainbow=0.5+0.5*cos(phase+vec3(0.0,2.094,4.188));
      vec3 irid=mix(uIrid,rainbow,0.4);
      body+=irid*fres*uIridStr*mask; body+=uSpecular*spec; body+=uInk*uGlow*mask;
      outColor=tonemap(body);
    } else {
      vec3 N=normalize(vec3((hL-hR)*2.6,(hB-hT)*2.6,0.085));
      vec3 base=mix(uBgDeep,uBgL,vUv.y);
      vec2 ruv=clamp(vUv+N.xy*uRefraction*mask,0.0,1.0);
      vec3 body=mix(uBgDeep,uBgL,ruv.y);
      body=mix(body,body*uWater+uWater*0.10,mask*0.85);
      float lens=dot(N,Ldir)-0.72; body*=clamp(1.0+lens*1.25*mask,0.6,1.5);
      vec2 cu=vUv*7.5+N.xy*2.6+uTime*0.05;
      float ca=sin(cu.x*3.0)*sin(cu.y*3.0)+sin((cu.x+cu.y)*2.1+uTime*0.45);
      ca=pow(max(ca*0.5+0.5,0.0),3.2);
      vec3 causticCol=mix(uCaustic,vec3(1.0),0.4+0.4*sin(uTime*0.4+cu.x));
      body+=causticCol*ca*uCausticStr*mask;
      float fres=pow(1.0-max(dot(N,V),0.0),2.2);
      float phase=fres*5.0+thickness*3.5+grad*8.0+uTime*0.3;
      vec3 sheen=0.5+0.5*cos(phase+vec3(0.0,2.094,4.188));
      body+=sheen*fres*uIridStrL*mask;
      float foam=clamp(smoothstep(0.02,0.3,grad*6.0)+smoothstep(3.0,22.0,speed)*0.5,0.0,1.0);
      float spark=pow(max(dot(N,H),0.0),uGlossL);
      body+=uFoam*(foam*uFoamStr*0.5+spark*0.45)*mask;
      outColor=clamp(body,0.0,1.0);
    }
    gl_FragColor=vec4(outColor,1.0);
  }`;

/* --------------------------------- the engine ------------------------------ */
export class LiquidFluid {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.cfg = mergeConfig(LIQUID_DEFAULTS, options);
    this.theme = options.theme || this.cfg.DEFAULT_THEME;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.ok = false; this._raf = 0; this._running = false; this._destroyed = false;
    this._autoTimer = 0; this._last = 0;
    this._pointers = [this._newPointer()];
    this._listeners = [];
    this.SPLAT_DYE = [0.55, 0.6, 0.65];
    if (this.reduced) return;                 // caller shows a static gradient instead
    if (!this._initGL()) return;              // WebGL unavailable -> caller falls back
    this._buildPrograms();
    this._initFBOs();
    if (this.cfg.POINTER_TRACK) this._bindInput();
    this._bindVisibility();
    if (this.cfg.INTRO_SPLATS > 0) this.multipleSplats(this.cfg.INTRO_SPLATS);
    this._update = this._update.bind(this);
    this.ok = true; this._running = true; this._last = performance.now();
    this._raf = requestAnimationFrame(this._update);
  }

  /* ---- GL setup ---- */
  _initGL() {
    const p = { alpha:false, depth:false, stencil:false, antialias:false, preserveDrawingBuffer: !!this.cfg.CAPTURABLE };
    let gl = this.canvas.getContext('webgl2', p); const is2 = !!gl;
    if (!is2) gl = this.canvas.getContext('webgl', p) || this.canvas.getContext('experimental-webgl', p);
    if (!gl) return false;
    this.gl = gl; this.is2 = is2;
    let halfFloat, linear;
    if (is2) { gl.getExtension('EXT_color_buffer_float'); linear = gl.getExtension('OES_texture_float_linear'); }
    else { halfFloat = gl.getExtension('OES_texture_half_float'); linear = gl.getExtension('OES_texture_half_float_linear'); }
    this.halfType = is2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE);
    this.linear = !!linear;
    const sf = (intf, f, t) => this._supportedFormat(intf, f, t);
    if (is2) { this.fRGBA = sf(gl.RGBA16F, gl.RGBA, this.halfType); this.fRG = sf(gl.RG16F, gl.RG, this.halfType); this.fR = sf(gl.R16F, gl.RED, this.halfType); }
    else { this.fRGBA = sf(gl.RGBA, gl.RGBA, this.halfType); this.fRG = this.fRGBA; this.fR = this.fRGBA; }
    if (!this.fRGBA) return false;
    // fullscreen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
    this._resizeCanvas();
    return true;
  }
  _supportedFormat(intf, f, t) {
    const gl = this.gl;
    if (!this._renderable(intf, f, t)) {
      if (intf === gl.R16F) return this._supportedFormat(gl.RG16F, gl.RG, t);
      if (intf === gl.RG16F) return this._supportedFormat(gl.RGBA16F, gl.RGBA, t);
      return null;
    }
    return { internalFormat: intf, format: f };
  }
  _renderable(intf, f, t) {
    const gl = this.gl, tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, intf, 4, 4, 0, f, t, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.deleteTexture(tex); gl.deleteFramebuffer(fbo);
    return ok;
  }
  _compile(type, src, kw) {
    const gl = this.gl; let s = src;
    if (kw) s = kw.map(k => '#define ' + k + '\n').join('') + src;
    const sh = gl.createShader(type); gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn('LiquidFluid shader:', gl.getShaderInfoLog(sh));
    return sh;
  }
  _program(vs, fs) {
    const gl = this.gl, pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) console.warn('LiquidFluid link:', gl.getProgramInfoLog(pr));
    const u = {}, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(pr, i).name; u[nm] = gl.getUniformLocation(pr, nm); }
    return { program: pr, u };
  }
  _buildPrograms() {
    const gl = this.gl, vs = this._compile(gl.VERTEX_SHADER, VERT);
    const fr = (src, kw) => this._compile(gl.FRAGMENT_SHADER, src, kw);
    this.P = {
      copy: this._program(vs, fr(COPY)),
      clear: this._program(vs, fr(CLEAR)),
      splat: this._program(vs, fr(SPLAT)),
      advect: this._program(vs, fr(ADVECT, this.linear ? null : ['MANUAL_FILTERING'])),
      divergence: this._program(vs, fr(DIVERGENCE)),
      curl: this._program(vs, fr(CURL)),
      vorticity: this._program(vs, fr(VORTICITY)),
      pressure: this._program(vs, fr(PRESSURE)),
      gradient: this._program(vs, fr(GRADIENT)),
      viscosity: this._program(vs, fr(VISCOSITY_S)),
      display: this._program(vs, fr(DISPLAY)),
    };
  }

  /* ---- framebuffers ---- */
  blit(target) {
    const gl = this.gl;
    if (!target) { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    else { gl.viewport(0, 0, target.width, target.height); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
  _createFBO(w, h, intf, f, t, filt) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, intf, w, h, 0, f, t, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture: tex, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; } };
  }
  _createDoubleFBO(w, h, intf, f, t, filt) {
    let a = this._createFBO(w, h, intf, f, t, filt), b = this._createFBO(w, h, intf, f, t, filt);
    return { width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      get read() { return a; }, set read(v) { a = v; }, get write() { return b; }, set write(v) { b = v; },
      swap() { const t2 = a; a = b; b = t2; } };
  }
  _resizeFBO(target, w, h, intf, f, t, filt) {
    const n = this._createFBO(w, h, intf, f, t, filt);
    this.gl.useProgram(this.P.copy.program);
    this.gl.uniform1i(this.P.copy.u.uTexture, target.attach(0));
    this.blit(n); return n;
  }
  _resizeDoubleFBO(target, w, h, intf, f, t, filt) {
    if (target.width === w && target.height === h) return target;
    target.read = this._resizeFBO(target.read, w, h, intf, f, t, filt);
    target.write = this._createFBO(w, h, intf, f, t, filt);
    target.width = w; target.height = h; target.texelSizeX = 1 / w; target.texelSizeY = 1 / h;
    return target;
  }
  _getResolution(res) {
    const gl = this.gl; let a = gl.drawingBufferWidth / gl.drawingBufferHeight; if (a < 1) a = 1 / a;
    const min = Math.round(res), max = Math.round(res * a);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
  }
  _initFBOs() {
    const gl = this.gl, sim = this._getResolution(this.cfg.SIM_RESOLUTION), dye = this._getResolution(this.cfg.DYE_RESOLUTION);
    const t = this.halfType, filt = this.linear ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);
    this.dye = this.dye ? this._resizeDoubleFBO(this.dye, dye.width, dye.height, this.fRGBA.internalFormat, this.fRGBA.format, t, filt)
                        : this._createDoubleFBO(dye.width, dye.height, this.fRGBA.internalFormat, this.fRGBA.format, t, filt);
    this.velocity = this.velocity ? this._resizeDoubleFBO(this.velocity, sim.width, sim.height, this.fRG.internalFormat, this.fRG.format, t, filt)
                        : this._createDoubleFBO(sim.width, sim.height, this.fRG.internalFormat, this.fRG.format, t, filt);
    this.divergence = this._createFBO(sim.width, sim.height, this.fR.internalFormat, this.fR.format, t, gl.NEAREST);
    this.curlFbo = this._createFBO(sim.width, sim.height, this.fR.internalFormat, this.fR.format, t, gl.NEAREST);
    this.pressure = this._createDoubleFBO(sim.width, sim.height, this.fR.internalFormat, this.fR.format, t, gl.NEAREST);
  }
  _scaleByPixelRatio(v) { const dpr = Math.min(window.devicePixelRatio || 1, this.cfg.CAP_DPR); return Math.floor(v * dpr); }
  _resizeCanvas() {
    const w = this._scaleByPixelRatio(this.canvas.clientWidth), h = this._scaleByPixelRatio(this.canvas.clientHeight);
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; return true; }
    return false;
  }

  /* ---- simulation step ---- */
  _step(dt) {
    const gl = this.gl, P = this.P, vel = this.velocity, cfg = this.cfg;
    gl.disable(gl.BLEND);
    gl.useProgram(P.curl.program);
    gl.uniform2f(P.curl.u.texelSize, vel.texelSizeX, vel.texelSizeY);
    gl.uniform1i(P.curl.u.uVelocity, vel.read.attach(0)); this.blit(this.curlFbo);

    gl.useProgram(P.vorticity.program);
    gl.uniform2f(P.vorticity.u.texelSize, vel.texelSizeX, vel.texelSizeY);
    gl.uniform1i(P.vorticity.u.uVelocity, vel.read.attach(0));
    gl.uniform1i(P.vorticity.u.uCurl, this.curlFbo.attach(1));
    gl.uniform1f(P.vorticity.u.curl, cfg.CURL); gl.uniform1f(P.vorticity.u.dt, dt);
    this.blit(vel.write); vel.swap();

    if (cfg.VISCOSITY > 0) {
      const alpha = 1 / (cfg.VISCOSITY * dt), rBeta = 1 / (4 + alpha);
      gl.useProgram(P.viscosity.program);
      gl.uniform2f(P.viscosity.u.texelSize, vel.texelSizeX, vel.texelSizeY);
      gl.uniform1f(P.viscosity.u.alpha, alpha); gl.uniform1f(P.viscosity.u.rBeta, rBeta);
      for (let i = 0; i < cfg.VISCOSITY_ITERATIONS; i++) { gl.uniform1i(P.viscosity.u.uVelocity, vel.read.attach(0)); this.blit(vel.write); vel.swap(); }
    }

    gl.useProgram(P.divergence.program);
    gl.uniform2f(P.divergence.u.texelSize, vel.texelSizeX, vel.texelSizeY);
    gl.uniform1i(P.divergence.u.uVelocity, vel.read.attach(0)); this.blit(this.divergence);

    gl.useProgram(P.clear.program);
    gl.uniform1i(P.clear.u.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(P.clear.u.value, cfg.PRESSURE); this.blit(this.pressure.write); this.pressure.swap();

    gl.useProgram(P.pressure.program);
    gl.uniform2f(P.pressure.u.texelSize, vel.texelSizeX, vel.texelSizeY);
    gl.uniform1i(P.pressure.u.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < cfg.PRESSURE_ITERATIONS; i++) { gl.uniform1i(P.pressure.u.uPressure, this.pressure.read.attach(1)); this.blit(this.pressure.write); this.pressure.swap(); }

    gl.useProgram(P.gradient.program);
    gl.uniform2f(P.gradient.u.texelSize, vel.texelSizeX, vel.texelSizeY);
    gl.uniform1i(P.gradient.u.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(P.gradient.u.uVelocity, vel.read.attach(1)); this.blit(vel.write); vel.swap();

    gl.useProgram(P.advect.program);
    gl.uniform2f(P.advect.u.texelSize, vel.texelSizeX, vel.texelSizeY);
    if (!this.linear) gl.uniform2f(P.advect.u.dyeTexelSize, vel.texelSizeX, vel.texelSizeY);
    gl.uniform1i(P.advect.u.uVelocity, vel.read.attach(0));
    gl.uniform1i(P.advect.u.uSource, vel.read.attach(0));
    gl.uniform1f(P.advect.u.dt, dt); gl.uniform1f(P.advect.u.dissipation, cfg.VELOCITY_DISSIPATION);
    this.blit(vel.write); vel.swap();

    if (!this.linear) gl.uniform2f(P.advect.u.dyeTexelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(P.advect.u.uVelocity, vel.read.attach(0));
    gl.uniform1i(P.advect.u.uSource, this.dye.read.attach(1));
    gl.uniform1f(P.advect.u.dissipation, cfg.DENSITY_DISSIPATION);
    this.blit(this.dye.write); this.dye.swap();
  }

  _render() {
    const gl = this.gl, P = this.P.display, u = P.u, c = this.theme === 'dark' ? this.cfg.DARK : this.cfg.LIGHT;
    gl.useProgram(P.program);
    gl.uniform2f(u.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(u.uTexture, this.dye.read.attach(0));
    gl.uniform1i(u.uVelocity, this.velocity.read.attach(1));
    gl.uniform1f(u.uTime, performance.now() / 1000);
    gl.uniform1i(u.uTheme, this.theme === 'dark' ? 0 : 1);
    if (this.theme === 'dark') {
      gl.uniform3fv(u.uBg, c.background); gl.uniform3fv(u.uInk, c.ink);
      gl.uniform3fv(u.uSpecular, c.specular); gl.uniform3fv(u.uIrid, c.iridescence);
      gl.uniform1f(u.uGloss, c.glossiness); gl.uniform1f(u.uSpecStr, c.specStrength);
      gl.uniform1f(u.uIridStr, c.iridStrength); gl.uniform1f(u.uGlow, c.glow); gl.uniform1f(u.uExposure, c.exposure);
    } else {
      gl.uniform3fv(u.uBgL, c.background); gl.uniform3fv(u.uBgDeep, c.backgroundDeep);
      gl.uniform3fv(u.uWater, c.water); gl.uniform3fv(u.uFoam, c.foam); gl.uniform3fv(u.uCaustic, c.caustic);
      gl.uniform1f(u.uCausticStr, c.causticStrength); gl.uniform1f(u.uFoamStr, c.foamStrength);
      gl.uniform1f(u.uRefraction, c.refraction); gl.uniform1f(u.uGlossL, c.glossiness);
      gl.uniform1f(u.uExposure, c.exposure); gl.uniform1f(u.uIridStrL, c.iridStrength);
    }
    this.blit(null);
  }

  /* ---- splats / public API ---- */
  _correctRadius(r) { const a = this.canvas.width / this.canvas.height; return a > 1 ? r * a : r; }
  splat(texX, texY, dx, dy) {
    if (!this.ok) return;
    const gl = this.gl, P = this.P.splat;
    gl.useProgram(P.program);
    gl.uniform1i(P.u.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(P.u.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(P.u.point, texX, texY);
    gl.uniform3f(P.u.color, dx, dy, 0);
    gl.uniform1f(P.u.radius, this._correctRadius(this.cfg.SPLAT_RADIUS / 100));
    this.blit(this.velocity.write); this.velocity.swap();
    gl.uniform1i(P.u.uTarget, this.dye.read.attach(0));
    gl.uniform3f(P.u.color, this.SPLAT_DYE[0], this.SPLAT_DYE[1], this.SPLAT_DYE[2]);
    this.blit(this.dye.write); this.dye.swap();
  }
  /** inject a "drop" at screen (client) coordinates — used by RippleFX on click */
  splatAt(clientX, clientY, opts = {}) {
    if (!this.ok) return;
    const x = this._scaleByPixelRatio(clientX) / this.canvas.width;
    const y = 1 - this._scaleByPixelRatio(clientY) / this.canvas.height;
    const force = opts.force != null ? opts.force : this.cfg.CLICK_FORCE;
    const dx = (Math.random() - 0.5) * force * 0.02;
    const dy = (Math.random() - 0.5) * force * 0.02;
    this.splat(x, y, dx, dy);
  }
  multipleSplats(n) {
    for (let i = 0; i < n; i++) {
      this.splat(Math.random(), Math.random(), 1000 * (Math.random() - 0.5), 1000 * (Math.random() - 0.5));
    }
  }
  /** microphone gust — scatter rising splats; strength ~0..2 */
  blow(strength) {
    if (!this.ok) return;
    const s = Math.min(2, strength), n = Math.max(1, Math.round(5 * Math.min(1.4, s))), f = this.cfg.SPLAT_FORCE * s;
    for (let i = 0; i < n; i++) {
      const x = Math.random(), y = 0.02 + Math.random() * 0.12;
      this.splat(x, y, (Math.random() - 0.5) * f * 0.012, f * (0.012 + Math.random() * 0.012));
    }
  }

  /* ---- input ---- */
  _newPointer() { return { down: false, moved: false, texcoordX: 0, texcoordY: 0, prevX: 0, prevY: 0, deltaX: 0, deltaY: 0, id: -1 }; }
  _on(t, ty, fn, o) { t.addEventListener(ty, fn, o); this._listeners.push([t, ty, fn, o]); }
  _bindInput() {
    const corrX = d => { const a = this.canvas.width / this.canvas.height; return a < 1 ? d * a : d; };
    const corrY = d => { const a = this.canvas.width / this.canvas.height; return a > 1 ? d / a : d; };
    const moveP = (p, x, y) => { p.prevX = p.texcoordX; p.prevY = p.texcoordY;
      p.texcoordX = x / this.canvas.width; p.texcoordY = 1 - y / this.canvas.height;
      p.deltaX = corrX(p.texcoordX - p.prevX); p.deltaY = corrY(p.texcoordY - p.prevY);
      p.moved = Math.abs(p.deltaX) > 0 || Math.abs(p.deltaY) > 0; };
    this._on(window, 'mousemove', e => {
      const p = this._pointers[0], x = this._scaleByPixelRatio(e.clientX), y = this._scaleByPixelRatio(e.clientY);
      if (!p.down) { p.down = true; p.texcoordX = x / this.canvas.width; p.texcoordY = 1 - y / this.canvas.height; p.prevX = p.texcoordX; p.prevY = p.texcoordY; }
      moveP(p, x, y);
    });
    this._on(window, 'touchmove', e => {
      const t = e.targetTouches;
      for (let i = 0; i < t.length; i++) {
        let p = this._pointers[i + 1]; if (!p) { p = this._newPointer(); this._pointers[i + 1] = p; }
        const x = this._scaleByPixelRatio(t[i].clientX), y = this._scaleByPixelRatio(t[i].clientY);
        if (!p.down) { p.down = true; p.texcoordX = x / this.canvas.width; p.texcoordY = 1 - y / this.canvas.height; p.prevX = p.texcoordX; p.prevY = p.texcoordY; }
        moveP(p, x, y);
      }
    }, { passive: true });
  }
  _bindVisibility() {
    this._on(document, 'visibilitychange', () => {
      if (!this.cfg.PAUSE_WHEN_HIDDEN) return;
      if (document.hidden) this.pause(); else this.resume();
    });
  }
  _splatForce() { return this.cfg.SPLAT_FORCE; }
  _applyInputs() {
    for (const p of this._pointers) {
      if (p.moved) { p.moved = false; this.splat(p.texcoordX, p.texcoordY, p.deltaX * this.cfg.SPLAT_FORCE, p.deltaY * this.cfg.SPLAT_FORCE); }
    }
  }
  _update() {
    if (this._destroyed) return;
    const now = performance.now(); let dt = (now - this._last) / 1000; dt = Math.min(dt, 0.016666); this._last = now;
    if (this._resizeCanvas()) this._initFBOs();
    if (this.cfg.AUTO_SPLAT) {
      this._autoTimer += dt;
      if (this._autoTimer >= this.cfg.AUTO_SPLAT_INTERVAL) {
        this._autoTimer = 0;
        this.splat(Math.random(), 0.35 + Math.random() * 0.5, 700 * (Math.random() - 0.5), 700 * (Math.random() - 0.5));
      }
    }
    this._applyInputs(); this._step(dt); this._render();
    this._raf = requestAnimationFrame(this._update);
  }

  /* ---- public controls ---- */
  setTheme(t) { this.theme = t === 'light' ? 'light' : 'dark'; }
  setColors(theme, obj) { const k = theme === 'light' ? 'LIGHT' : 'DARK'; this.cfg[k] = Object.assign({}, this.cfg[k], obj); }
  set(key, value) { this.cfg[key] = value; }
  pause() { if (this._running) { cancelAnimationFrame(this._raf); this._running = false; } }
  resume() { if (!this._running && this.ok && !this._destroyed) { this._running = true; this._last = performance.now(); this._raf = requestAnimationFrame(this._update); } }
  destroy() {
    this._destroyed = true; cancelAnimationFrame(this._raf);
    for (const [t, ty, fn, o] of this._listeners) t.removeEventListener(ty, fn, o);
    this._listeners = [];
    const lose = this.gl && this.gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
  }
}

if (typeof window !== 'undefined') window.LiquidFluid = LiquidFluid;

