---
title: "I am no longer Crashing Out (another WinEmulation Story)"
description: The sequel to the crash-out. I didn't fix the framerate. I found something better — the actual path, and the discipline to know it's real before I've earned the win.
topic: Performance
date: 2026-06-27
readTime: 6 min
draft: false
---

[Last time](/lab/writing/the-gpu-wasnt-even-trying/) I crashed out. A flagship GPU running a 2017 game at a third of its clock, every idea I had already someone else's job, and a negative result for my trouble. I ended that post mad at a GPU that wouldn't try.

I did not walk away. I want that on the record, because the version of me that wrote the last post would've assumed I would.

## I measured everything, and everything was dead

The whole next stretch was knobs. Every setting the stack exposes, A/B'd on real hardware with a frametime harness I built to stop myself from lying:

- Samsung's game throttle, GOS, off → **worse** (it overheated and hard-throttled lower than the throttle I removed)
- Turnip driver, a year newer → **flat**
- Render resolution, cut by 3× → **flat**
- Box64's aggressive dynarec flags → **wouldn't even launch**
- Newer DXVK → **wouldn't launch either**

Five swings. Nothing moved. And somewhere around the fifth flat result, the thing I was angry about stopped being a setback and started being **the answer.**

## The wall has a shape

You can't configure your way out of this because it isn't a misconfiguration. A flagship 2024 GPU pegged at 99.8% busy, rendering a 2017 game at 38fps, means the software stack is making the hardware do roughly **ten times the work** a native render would. That's not a wrong toggle. That's the cost of translation existing at all — D3D→Vulkan, x86→ARM, every layer paying a tax. No knob removes a tax.

So I was staring at two doors, and I hated both:

1. **Keep tweaking settings** — which I'd just proven, five times, does nothing.
2. **Fork the whole stack and fix it myself** — Wine, Box64, DXVK, Turnip. Millions of lines, maintained by expert teams for two decades. Forking all of it means I stop getting their improvements and spend the rest of my life just keeping up, never getting ahead. Drowning, alone, in five million lines of someone else's Wine.

That's the part where most people quit. Both doors are bad.

## The third door

Then it clicked, and it clicked *because* I'd been forced to stop flailing: **don't fork it. Inject into it.**

Let upstream update freely. Layer my fixes *on top* through the sanctioned injection points every layer already has — a Vulkan layer above the GPU driver, a wrapper before DXVK, a per-game fix database. Ship only the surgeon. Update means update *my* tool, never the dependencies. They keep improving underneath me; I keep my edge bolted on.

And the second it clicked, I realized I hadn't invented anything. **This is literally how Proton works.** Valve ships stock Wine and DXVK, patches thinly on top, keeps a per-game fix database, and you "just update Proton." It's not a gamble — it's a shipped pattern used by millions of people every day.

Except there is no Proton for Android. Nobody's built the thing that auto-updates the emulation stack and injects fixes on top. The door I found was **empty.**

## Here's the part that makes this not a crash-out — and not a victory lap either

The old me would've sprinted through that door screaming, built for three weeks, and discovered too late that it was a closet. So I didn't. I made the unknowns prove themselves *first* — the single load-bearing question being: **can you even load a custom Vulkan layer under this emulator on a locked-down, non-rooted phone?**

Yes. Two live, shipping projects already do it. The injection point is real. The architecture isn't fantasy.

And then — because I made a deal with myself this week to never let hope outrun evidence — the same investigation handed me the gut-punch, and I'm keeping it in: **proving the gun loads is not proving it fires.** The 10× bottleneck is CPU-side translation, and that's the *one* thing a GPU-side injection can't reach. I still haven't moved a single frame. The real test — does *any* injected fix actually make it faster — is still ahead of me, and it might say no.

So why am I not crashing out anymore?

Not because I won. **I haven't.** Because crashing out is *thrashing without a target* — and I have a target now. I went from "everything's broken and it's all someone else's code" to a named project, a proven architecture, an empty niche, and one clean make-or-break experiment standing between me and knowing if it's real. That's not victory. That's something I didn't have a week ago: **a direction I've actually pressure-tested.**

The win post is the third one. I haven't earned it, and I'm not going to pretend I have — that pretending is exactly what this whole saga is about not doing.

But for the first time, I can see it from here.

*To be concluded — hopefully — in part three.*
