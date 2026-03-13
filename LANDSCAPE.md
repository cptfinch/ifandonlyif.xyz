# Proof Learning Landscape — Tools to Try

A curated list of sites and tools for understanding how others teach and visualise proofs.
Try each one. Note what works, what doesn't, and where ifandonlyif.xyz fits in.

Last updated: 2026-03-13

---

## 1. Interactive Theorem Provers (online editors)

### Lean 4 Web
- **URL:** https://live.lean-lang.org/
- **What it is:** Monaco editor connected to server-side Lean 4 LSP
- **Try:** Paste one of our exercise proofs, step through with cursor
- **Note:** Watch the InfoView panel on the right — that's what our stepper recreates statically
- **Strengths:** Real Lean, full Mathlib access
- **Weaknesses:** Blank canvas, no guidance, server-dependent

### Agdapad
- **URL:** https://agdapad.quasicoherent.io/
- **What it is:** Online Agda with remote Emacs — includes stdlib, cubical
- **Try:** Write a simple proof like `data ⊤ : Set where tt : ⊤` and check it
- **Note:** Agda's approach is very different from Lean (no tactics, term-mode proofs)
- **Strengths:** Full Agda + libraries, persistent sessions
- **Weaknesses:** Emacs UI in browser, steep learning curve

### jsCoq
- **URL:** https://coq.vercel.app/
- **Also:** https://jscoq.github.io/scratchpad.html
- **What it is:** Full Coq running in browser via js_of_ocaml (~30MB download)
- **Try:** Load the scratchpad, type `Theorem foo : True. Proof. exact I. Qed.`
- **Note:** Watch load time. This is what "prover in browser" actually feels like
- **Strengths:** No server needed, includes Coq stdlib
- **Weaknesses:** ~30MB download, slow startup, basic UI

---

## 2. Games and Guided Learning

### Natural Number Game (NNG4)
- **URL:** https://adam.math.hhu.de/~mhofer/NNG4/
- **What it is:** Gamified Lean 4 levels — prove properties of natural numbers
- **Try:** Play through World 1 (Tutorial) and World 2 (Addition)
- **Note:** Watch the goal panel — it updates live but doesn't animate transitions
- **Strengths:** Gamification works, tactic panel shows only unlocked tactics
- **Weaknesses:** One topic only, server-dependent (~20 concurrent users)

### Lean Game Server (other games)
- **URL:** https://adam.math.hhu.de/
- **What it is:** Hosts multiple Lean 4 games (NNG4, SetGame, Robo, logic games)
- **Try:** Try SetGame or the logic games to see different approaches
- **Note:** All server-side, same infrastructure as NNG4

### The Incredible Proof Machine
- **URL:** https://incredible.pm/
- **What it is:** Drag-and-drop natural deduction — visual port/wire metaphor
- **Try:** Work through the first few levels
- **Note:** This is closest to Gentzen-style proof trees but as a game. Compare with our stepper approach
- **Strengths:** Genuinely visual, intuitive drag-and-drop
- **Weaknesses:** Only propositional/predicate logic, no real prover behind it

### Carnap.io
- **URL:** https://carnap.io/
- **What it is:** Educational logic platform with Fitch-style and Gentzen-style proof rendering
- **Try:** Find the public exercises, try a Fitch-style natural deduction proof
- **Note:** This is the academic gold standard for teaching logic with formal notation
- **Strengths:** Multiple proof systems (Fitch, Gentzen, sequent calculus), auto-grading
- **Weaknesses:** Academic UI, Haskell/GHCJS (slow), logic only (no mathematics)

---

## 3. Proof Visualisation Tools

### Alectryon
- **URL:** https://github.com/cpitclaudel/alectryon
- **Demo:** https://plv.csail.mit.edu/blog/alectryon.html
- **What it is:** Literate proving — generates static HTML with toggleable proof states
- **Try:** Read the demo page. Click on proof steps to show/hide the proof state
- **Note:** This is the closest existing tool to our stepper concept, but it's toggle-based (show/hide) not stepping (animated transitions). Works with Coq and Lean 4.
- **Strengths:** Beautiful output, works as documentation, no server needed
- **Weaknesses:** Read-only (no exercises), no animation, no strategy annotations

### Logitext
- **URL:** http://logitext.mit.edu/
- **What it is:** Interactive sequent calculus with graphical tree rendering
- **Try:** Build a proof by clicking on formulas to apply rules
- **Note:** This IS Gentzen-style proof on the web. See how the tree grows.
- **Strengths:** Interactive tree building, clean UI
- **Weaknesses:** Only sequent calculus, no connection to real provers

### ProofWidgets4 (Lean 4, VS Code only)
- **URL:** https://github.com/leanprover-community/ProofWidgets4
- **What it is:** Embeds React components in Lean's InfoView — cutting edge
- **Try:** Install Lean 4 + VS Code, clone the repo, open examples
- **Note:** This is the state of the art but locked inside VS Code
- **Strengths:** Fully interactive, commutative diagrams, custom widgets
- **Weaknesses:** VS Code only, requires local Lean installation

---

## 4. Textbooks and Courses (online)

### PLFA (Programming Language Foundations in Agda)
- **URL:** https://plfa.github.io/
- **What it is:** The definitive Agda textbook — teaches PL theory through proofs
- **Try:** Read Part 1: Logical Foundations (especially the Naturals and Relations chapters)
- **Note:** Beautiful literate Agda, but very academic (grad level). No interactivity.

### Mathematics in Lean (MIL)
- **URL:** https://leanprover-community.github.io/mathematics_in_lean/
- **What it is:** Comprehensive Lean 4 textbook covering real mathematics
- **Try:** Chapter 2 (Basics) and Chapter 3 (Logic)
- **Note:** The standard "serious" Lean learning resource. No visualisation.

### Mechanics of Proof
- **URL:** https://hrmacbeth.github.io/math2001/
- **What it is:** Gentler Lean 4 intro aimed at undergrads
- **Try:** Read the first few chapters
- **Note:** Good pedagogical model — compare how they explain tactics vs how we do it

### Theorem Proving in Lean 4 (TPIL)
- **URL:** https://lean-lang.org/theorem_proving_in_lean4/
- **What it is:** Official Lean 4 reference/manual
- **Try:** Chapter 5 (Tactics) is most relevant
- **Note:** Reference, not learning resource

---

## 5. Exercise Platforms

### Codewars (Lean kata)
- **URL:** https://www.codewars.com/kata/search/lean
- **What it is:** ~111 Lean kata including theorem proving collections
- **Try:** Filter by "theorem proving" tag, try a few 7-kyu ones
- **Note:** No teaching, just puzzles. But the ranking/solve-count system is addictive.

### Exercism
- **URL:** https://exercism.org/
- **What it is:** Best learning UX for programming tracks (no Lean track exists)
- **Try:** Do a few exercises in any track (e.g., Haskell)
- **Note:** Study the UX — track structure, mentoring, progression. This is the gold standard for learning platform design. We should aspire to this quality.

---

## 6. Proof Theory / Natural Deduction Specific

### Kevin Klement's Fitch-style proof editor
- **URL:** https://proofs.openlogicproject.org/
- **What it is:** Web-based Fitch-style natural deduction proof builder
- **Try:** Build a proof of P → P using Fitch rules
- **Note:** Clean implementation of Fitch notation. Our stepper could render in this style.

### Tree Proof Generator (propositional logic)
- **URL:** https://www.umsu.de/trees/
- **What it is:** Generates semantic tableaux (truth trees) for propositional logic
- **Try:** Enter a formula and see the proof tree
- **Note:** Different proof system (tableaux vs natural deduction) but same visual tree concept

### Proof Assistant for Natural Deduction (PANDA)
- **URL:** https://papanda.fun/
- **What it is:** Interactive natural deduction in the browser
- **Try:** Work through basic propositional logic proofs
- **Note:** Gentzen-style rules rendered visually

---

## What to look for when trying these

As you explore each tool, consider:

1. **First 30 seconds** — How long before you're doing something? (Our stepper: instant)
2. **Visualisation** — Do you SEE the proof state? How? (Panel? Tree? Animation?)
3. **Teaching** — Does it explain WHY, or just show WHAT? (Our strategy annotations)
4. **Server dependency** — Does it need a backend? (Our stepper: zero server)
5. **Proof notation** — Tactic mode? Term mode? Fitch? Gentzen? Multiple?
6. **Mobile** — Does it work on a phone/tablet? (Our stepper: yes)
7. **Curriculum** — Is there a progression, or just isolated exercises?
8. **What's missing** — What would make this tool better?

---

## Where ifandonlyif.xyz fits

Our unique combination that nobody else has:
- **Animated proof state stepping** (not just show/hide like Alectryon)
- **Strategy annotations** (the "why" layer, like Velleman's book)
- **Zero infrastructure** (pure static site, instant load, works offline)
- **Multi-track curriculum** (logic + numbers + strategies, not just one topic)
- **Cross-prover potential** (same JSON format could work for Lean, Agda, Coq)

The gap we can additionally fill:
- **Gentzen-style proof tree rendering** alongside the tactic-based stepper
- **Proof theory track** teaching natural deduction rules as a universal language
