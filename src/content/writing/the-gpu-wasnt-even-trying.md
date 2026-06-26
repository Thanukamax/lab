---
title: "I am Crashing out (a WinEmulation Story)"
description: A day of trying to make Android run PC games faster, watching every idea I had die on contact with reality, and the one number that made it all worth it. Sort of.
topic: Performance
date: 2026-06-26
readTime: 6 min
draft: false
---

This is a crash-out. I'm writing it while I'm still annoyed, on purpose, because by tomorrow I'll have sanded it into a neat little lessons-learned post and the neat version is a lie. The real version is: I spent a day chasing a performance idea, it died, I pivoted, that died too, and the only thing I have to show for it is a number that says *don't.*

"Negative results are deliverables." Yeah. Let me try to mean it.

![Two-buttons sweating-guy meme, the buttons labelled "admit the idea is dead" and "pivot and cope"](/lab/memes/two-buttons.jpg)

## The idea was beautiful and the idea was stupid

![Expanding-brain meme escalating from "run x86 games on a phone" to "pin a neural net in L2 so it's free"](/lab/memes/expanding-brain.jpg)

You can run x86 Windows games on a phone. Winlator stacks Box64 (x86→ARM translation) on Wine on DXVK and somehow it works. It's also slow, because turning one instruction set into another in real time costs something.

My idea: make it cost nothing. Train a tiny model — 256 KB, small enough to **live in L2/L3 cache** — that predicts native code so the translator barely thinks. A neural brain for binary translation, resident, basically free.

Two problems, and I hate both of them:

1. **You can't pin anything into L2/L3 from userspace.** Cache is least-recently-used, not a thing you lock. The game's own data evicts your "resident" model the instant it runs. You don't own residency. You lose it.
2. **Inference is compute-bound, not memory-bound.** Even if the model *were* magically resident, you're capped by multiply-accumulate throughput, not by reach. Cache residency fixes a wall that isn't the wall.

I didn't want this to be true so I measured it instead of arguing with it. Wrote a dependency-free benchmark, ran it on an x86 laptop with real counters and on the phone's Cortex-X4. Both said the same thing: as the working set leaves cache, latency climbs 100×, but throughput stays *flat.* The model tops out around 16,000 inferences a second per core. A dynarec does a hundred million to a billion opcodes a second. My beautiful idea is four orders of magnitude too slow to stand in the hot path.

Dead. On hardware. Twice. Fine. *Fine.*

## The phone that refused to sweat

![This-is-fine dog sitting calmly in a burning room — the GPU idling while the frame budget burns](/lab/memes/this-is-fine.jpg)

The salvage: don't run the model live, **bake it offline into a static table** and use it to translate the right code blocks early so first-run stutter dies. Plus a GPU-side version for shaders and textures.

But I have a rule, beaten into me by every time I shipped a "win" that turned out to be measurement noise: **don't build the optimizer until you've proven there's something to optimize.** So first I built a capture harness — adb, no root, reading frametimes and GPU load and per-core clocks and temps off a live game on my S24U. Loaded NieR:Automata. Ran the one test that settles it: hold the scene still, cut the render resolution by 3×, watch if frames get faster.

GPU-bound game? One-third the pixels and it screams.

Nothing moved. Same frametime at 640×480 as at 720p. And then I looked at *why,* and found the thing I can't let go of:

**The GPU was sitting at 24% of its clock. The fast CPU core at a third of its.** The game was choking — dropping to 30 fps — and not one piece of the chip was working hard. A GPU-bound game floors its clocks clawing for headroom. This thing *shrugged.* The bottleneck was the CPU translation layer, and the silicon that could've helped sat there at idle, picking its nails, while the frame budget burned.

Nobody was driving the car. That's the whole problem and I didn't have a name for it yet.

## Every room I walked into was already full

![Always-has-been astronaut meme: "wait, Box64 already caches this?" / "always has been"](/lab/memes/always-has-been.png)

Okay. It's CPU-bound. That's literally where my CPU idea lives. Go attack translation.

- **Cross-run translation cache** — the exact thing my offline table was supposed to win? Box64 already ships it. On by default. Shipped last year. My prize was claimed before I'd finished naming it.
- **Faster dispatch** — the real CPU lever? The maintainer's already in there; one recent fix doubled a game's frame rate.
- **The GPU driver** — the biggest mobile win going? That's Turnip, a whole Mesa subproject with people far better than me on it.

Every. Single. Layer. Someone competent already living in it. This is where I crashed out for real. You grind a full day proving your idea is *sound* and the prize is finding out that sound and *needed* are different words. The map was already colored in. I was standing in the one spot with a flag going "guys? guys I have a flag?"

## The part I'm keeping, through gritted teeth

![Drake meme: rejecting "building the optimizer", approving "shipping the tool that proved I shouldn't"](/lab/memes/drake.jpg)

Here's the turn, and it's the only reason this isn't just me whining into a markdown file.

The same measuring that murdered every idea also showed me where the map is *blank.* Box64, Wine, DXVK — all of them were born on the desktop, where a core is a core. A phone is the opposite: one fast core, some middle ones, some tiny efficient ones, vicious power management, all of it fighting over a single thermal budget. **The tools assume the CPU is symmetric. The phone is violently asymmetric. And nobody owns the gap.**

*That's* what "the GPU idled while the game choked" actually means. It's not a Box64 bug. It's that no one is in charge of **placement** — which thread runs on which core, how hard each unit clocks, who gets the thermal budget this frame. The OS schedules the emulator blind. The emulator hands the OS its threads blind. There is no layer that knows "this exact thread is the one that matters, pin it to the fast core and clock it up."

And one floor below that: there's no instrument that can even *tell you* where a frame went. Translation stall? Pipeline compile? Thermal throttle? Memory stall? That per-frame, whole-stack blame **does not exist publicly.** I looked. The ugly prototype of it is the capture harness I built to assassinate my own idea.

So the deliverable was never the optimizer. It was the thing I built to decide whether the optimizer was worth building. The tool that talked me off the ledge is the tool worth shipping. Cool. Great. Love that for me.

## What I'm actually taking from this

![Gru's Plan meme: "measure before I build" → "prove the idea is sound" → "it already shipped upstream" → the horror](/lab/memes/gru-plan.jpg)

- Measure before you build. Not as a virtue — as *self-defense.* The discipline is the only reason I didn't ship a neural cache miss with a pitch deck.
- An honest, specific negative beats a positive that's noise. "F2 is dead for this game, here's the GPU clock proving it" is a real finding even if it feels like a loss.
- The instrument you build to test an idea outlives the idea. So build it like it matters.
- Sometimes the opening is the empty room you only find because you stood in every full one first and felt stupid in each.

I'm still mad about the GPU though. It really, genuinely, was not even trying.
