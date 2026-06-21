---
title: Local AI in 4 GB of VRAM — what actually fits
description: A field report on running a useful on-device AI stack on a laptop dGPU that everyone says is too small.
topic: Machine Learning
date: 2026-06-12
readTime: 6 min
featured: true
---

The internet will tell you that you need 24 GB of VRAM to do anything interesting with local AI. I've been running a genuinely useful voice assistant on an **RTX 3050 Ti with 4 GB** for months. Here's what actually fits, and what the size budget really buys you.

## The trap: putting the model where the contention is

My first instinct was the obvious one — put the LLM on the GPU. It half-fit, thrashed, and then the NVIDIA driver OOM-faulted and took my whole session down with it. The lesson: on a 4 GB card, **the GPU is a scarce, fragile resource, and you don't want two things fighting over it.**

So I inverted the layout. The chat and routing models run on **CPU/RAM** (slower, but I have 15 GB of RAM and the GPU otherwise idle). The GPU does exactly one job, or none at all.

## Speech-to-text was the real win

The thing I *did* put effort into fitting was transcription, and the answer turned out to be: don't use the GPU for it either. **Parakeet-TDT 0.6B, INT8, on CPU via ONNX** transcribes in ~245 ms average — faster than the GPU path I replaced — and uses **zero VRAM**. That single change deleted my crash vector and freed the card entirely.

## What "fits" really means

The size budget isn't about cramming the biggest model in. It's about **deciding what the GPU is for** and refusing to let anything else touch it. On 4 GB the right answer is often "nothing" — and once you accept that, a lot more becomes possible than the spec sheet suggests.

The constraint made the system better. It almost always does.
