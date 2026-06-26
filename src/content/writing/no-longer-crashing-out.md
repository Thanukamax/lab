---
title: "I am no longer Crashing Out (another WinEmulation Story)"
description: Sequel to the crash-out. I didn't fix the framerate — I found the actual path and the discipline to not lie about it yet. Still mad. Less doomed.
topic: Performance
date: 2026-06-27
readTime: 6 min
draft: false
---

[Last time](/lab/writing/the-gpu-wasnt-even-trying/) I crashed out. Flagship GPU running a 2017 game at a third of its clock, every idea I had already somebody else's job, and a negative result for my trouble. I ended that one mad at a GPU that wouldn't try.

I didn't walk away though. The version of me that wrote that post would've bet money I would. Joke's on him.

## I measured everything and every single thing was dead

![Surprised Pikachu meme captioned "every setting I swept did exactly nothing"](/lab/memes/pikachu.jpg)

The next stretch was just... knobs. Every setting the stack has, A/B'd on real hardware with a frametime harness I built specifically so I couldn't lie to myself about the numbers.

- Samsung's game throttle, off → **worse.** It overheated and throttled *harder* than the throttle I removed. Incredible. Thanks Samsung.
- Turnip driver, a year newer → flat.
- Render resolution, cut by 3× → flat.
- Box64's spicy dynarec flags → wouldn't even launch.
- Newer DXVK → also wouldn't launch. Cool. Cool cool cool cool.

Five swings. Nothing. And somewhere around flat result number five, the thing I'd been raging about stopped being a setback and started being the actual answer.

## The wall has a shape and the shape is stupid

You can't config your way out because it's not a config problem. A flagship 2024 GPU, pegged at 99.8% busy, pushing a *2017* game at 38fps — that means the stack is making the hardware do like **ten times** the work a native render would. That's not a wrong toggle. That's the tax for translation existing *at all* — x86→ARM, D3D→Vulkan, every layer skimming off the top. No knob refunds a tax.

So I'm standing there staring at two doors and I hate both of them:

![Disaster Girl meme: "my two ways to fix it — tweak forever, or fork 5M lines of Wine"](/lab/memes/disaster.jpg)

Door one: keep tweaking settings — which I just proved, *five times*, does jack. Door two: fork the entire stack and fix it myself. Wine, Box64, DXVK, Turnip. Millions of lines, built by expert teams over twenty years. Fork all that and I stop getting their updates and spend the rest of my life just running to stand still. Drowning, solo, in five million lines of somebody else's Wine.

That's the spot where most people quit. Both doors suck.

## The third door

![Left Exit 12 meme: swerving off "tweak settings forever" onto the "inject, don't fork" exit — me, finding Proton](/lab/memes/leftexit.jpg)

Then it clicked — and it only clicked *because* I'd been forced to stop flailing: don't fork it. **Inject** into it.

Let upstream update however it wants. Bolt my fixes on top through the injection points every layer already has — a Vulkan layer above the GPU driver, a wrapper in front of DXVK, a per-game fix database. Ship only the surgeon. "Update" means update *my* thing, never the deps. They get faster underneath me; I keep my edge stapled on.

And the second it clicked, I realized I hadn't invented shit. **This is just Proton.** Valve ships stock Wine + DXVK, patches thin on top, keeps a per-game fix DB, and you "just update Proton." It's not a moonshot — it's a shipped pattern millions of people use every single day.

Except there's no Proton for Android. Nobody built the thing that auto-updates the emulation stack and injects fixes on top. The door I found was *empty.*

## Why this isn't a crash-out — and isn't a victory lap either

![Roll Safe (tapping temple) meme: "can't waste 3 weeks building the wrong thing if you make the unknowns prove it first"](/lab/memes/rollsafe.jpg)

Old me sprints through that door screaming, builds for three weeks, finds out too late it's a broom closet. New me made a deal this week: hope never outruns evidence. So I didn't build — I made the unknowns prove themselves *first.* The big one: can you even load a custom Vulkan layer under this emulator, on a locked-down, non-rooted phone?

Yes. Two shipping projects already do it. The injection point is real. The whole thing isn't a fantasy.

And then — because I actually keep my own deals now — the same dig handed me the gut-punch, and I'm leaving it in: **the gun loading is not the gun firing.** That 10× bottleneck? It's CPU-side translation, and that's the *one* thing a GPU-side injection can't touch. I haven't moved a single frame. The real test — does any injected fix actually make it faster — is still sitting in front of me, and it might say no.

So why am I not crashing out anymore?

Not because I won. I **didn't.** Because crashing out is thrashing with no target — and I've got a target now. I went from "everything's broken and it's all someone else's code" to a named project, a proven architecture, an empty lane, and *one* clean make-or-break experiment between me and knowing if it's real. That's not a win. It's the thing I didn't have a week ago: a direction I actually stress-tested instead of just vibed into.

The win post is number three. I haven't earned it, and I'm not gonna fake it — faking it is the *entire* thing this saga exists to not do.

But for the first time, I can see it from here.

*To be concluded — hopefully — in part three.*
