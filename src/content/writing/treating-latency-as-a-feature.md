---
title: Treating latency as a feature
description: Why I spend as much time on time-to-result as on the result itself — lessons from shipping CLI tools.
topic: Performance
date: 2026-05-21
readTime: 5 min
---

Most of my tools have a number attached to them that has nothing to do with correctness: **time-to-result**. donghua-cli has to be playing a video in under 15 seconds. Diana has to answer before you'd give up and use your hands. shrinkray has to feel instant even though it's rewriting binary game files.

None of these are about whether the thing *works*. They're about whether it feels worth using. And I've come to treat that feeling as a hard requirement, not a nice-to-have.

## Latency is a UX surface you can't fake

You can polish a UI forever, but if pressing Enter is followed by three seconds of nothing, it feels broken. The fixes are almost never "make the slow thing fast" — they're structural:

- **Don't wait for the slowest source.** donghua-cli searches many sites in parallel with per-source timeout budgets, so one dead site can't stall the result.
- **Do the work before it's asked for.** Preload the next episode while the user is still reading the list. Cache the route the moment a phrase repeats.
- **Stream, don't batch.** Diana speaks each sentence as it generates instead of waiting for the whole reply — first word in ~1 s instead of ~4.

## The discipline it forces

Optimising for time-to-result changes how you architect things. You stop thinking in "do A, then B, then C" and start thinking about what can happen speculatively, in parallel, or ahead of time. That's a more interesting way to build — and the user never sees the machinery, only that it felt fast.

Treat latency as a feature and you end up with better systems, not just snappier ones.
