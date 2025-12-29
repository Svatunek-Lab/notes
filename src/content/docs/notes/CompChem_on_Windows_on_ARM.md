---
title: "(Comp)Chem on Windows on ARM"
date: 2025-12-27
author: Dennis Svatunek
abstract: "Notes on using Windows on ARM for (Computational) Chemistry. What works and what doesn't."
head: []
tags: windows-on-arm, compchem, chemistry, snapdragon-x-elite
image: /images/Windows_on_arm.png
---

This is a **living document** based on my day-to-day use of a **Zenbook A14 (Snapdragon X Elite)** running **Windows on ARM**. I will document which commonly used software packages work or do not work. Overall I love this laptop. It's snappy, incredibly light, and the battery life is amazing.

## Software overview

| Software | Category | Platform | Status |
|---------|----------|----------|--------|
| [MobaXterm](#mobaxterm) | General | Windows (x86 emulation) | ✅ |
| [WinSCP](#winscp) | General | Windows (x86 emulation) | ✅ |
| [ChemDraw 25](#chemdraw-25) | Chemistry (general) | Windows (x64 emulation) | ✅ |
| [xTB 6.7.1](#xTB-671) | Computational chemistry | WSL2 (ARM, conda) | 🔴 |
| [ORCA 6.1.1](#orca-611-linux) | Computational chemistry | WSL2 (ARM) | ✅ |
| [Avogadro 2](#avogadro-2) | Computational chemistry | Windows (x64 emulation) | ✅ |
| [Chemcraft](#chemcraft) | Computational chemistry | Windows (x64 emulation) | ✅ |

## Hardware and environment

- **Laptop:** ASUS Zenbook A14  
- **SoC:** Snapdragon X Elite (X1E-78-100 32GB LPX RAM)
- **OS:** Windows on ARM  
- **Environment:** WSL2 (Ubunt 22.04 ARM build) or native Windows ARM with x86/x64 emulation 

## Status legend

| Status | Meaning |
|------|---------|
| ✅ Works | Runs reliably in my setup |
| 🟡 Works with issues | Usable, but problematic or fragile |
| 🔴 Not working | Produces incorrect results or fails |
| ⚪ Not tested | Not evaluated yet |

---

## Software list

### General

#### Endnote

<div class="swcard" id="endnote">
  <div class="swcard-title">Endnote ⚪</div>
  <div class="swcard-meta"><b>Platform:</b> Windows</div>
  <hr class="swcard-divider">
  <p>To-Do</p>
</div>

<div class="swcard" id="mobaxterm">
  <div class="swcard-title">MobaXterm ✅</div>
  <div class="swcard-meta"><b>Platform:</b> Windows  (x86 via ARM emulation)</div>
  <div class="swcard-meta"><b>Version:</b> 25.4</div>
  <hr class="swcard-divider">
  <p>Works flawless so far.</p>
</div>

<div class="swcard" id="winscp">
  <div class="swcard-title">WinSCP ✅</div>
  <div class="swcard-meta"><b>Platform:</b> Windows  (x86 via ARM emulation)</div>
  <div class="swcard-meta"><b>Version:</b> 6.5.5</div>
  <hr class="swcard-divider">
  <p>Works flawless so far.</p>
</div>

---

### Chemistry (general)

<div class="swcard" id="chemdraw-25">
  <div class="swcard-title">ChemDraw 25 ✅</div>
  <div class="swcard-meta"><b>Platform:</b> Windows (x64 via ARM emulation)</div>
  <hr class="swcard-divider">
  <p>The x86 Windows version of ChemDraw 25 runs without noticeable issues via Windows’ built-in x86 emulation. Drawing and pasting as embedded object to Office works.</p>
</div>

---

### Computational chemistry

<div class="swcard" id="xTB-671">
  <div class="swcard-title">xTB 6.7.1 (Linux) 🔴</div>
  <div class="swcard-meta"><b>Platform:</b> WSL2 (Conda; ARM native)</div>
  <hr class="swcard-divider">
  <p>The conda-distributed xTB binary currently does **not behave correctly** in my setup under WSL2 on Windows on ARM. Geometry optimizations may converge but can yield **clearly unphysical structures and energies**.

This appears to be a known issue; see  
https://github.com/grimme-lab/xtb/issues/1151

I have **not yet tried compiling xTB from source** on ARM, which should resolve the issue when using newer versions of XTB.</p>
</div>

<div class="swcard" id="orca-611-linux">
  <div class="swcard-title">ORCA 6.1.1 (Linux) ✅</div>
  <div class="swcard-meta"><b>Platform:</b> WSL2 (ARM native; OpenMPI 4.1.8)</div>
  <hr class="swcard-divider">
  <p>ARM compiled Linux version from the ORCA Forum. Seems to work flawless. Benchmarks are following.</p>
</div>

<div class="swcard" id="avogadro-2">
  <div class="swcard-title">Avogadro 2 ✅</div>
  <div class="swcard-meta"><b>Platform:</b> Windows (x64 via ARM emulation)</div>
  <div class="swcard-meta"><b>Version:</b> 1.102.1 (The Avogadro 2 from two.avogadro.cc, not the other one)</div>
  <hr class="swcard-divider">
  <p>Drawing/hanlding molecules and optimization works.</p>
</div>

<div class="swcard" id="chemcraft">
  <div class="swcard-title">Chemcraft ✅</div>
  <div class="swcard-meta"><b>Platform:</b> Windows (x64 via ARM emulation)</div>
  <div class="swcard-meta"><b>Version:</b> 1.8</div>
  <hr class="swcard-divider">
  <p>Seems to work so far. Pink atoms and everything.</p>
</div>

---

## Notes

This page is updated as I encounter new tools or revisit existing ones. The intent is to provide a realistic snapshot of what currently works (and what does not) on Windows on ARM for chemistry and computational chemistry workflows, rather than a complete list. If you have any software I should try, let me know.
