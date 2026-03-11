# ifandonlyif.xyz — Project Plan

**Learn mathematics by proving it. A progressive Lean 4 proof gym.**

Last updated: 2026-03-11

---

## Vision

The only platform where you can SEE what a proof does — not just read tactic text,
but watch the logical structure transform step by step. Learn mathematics through
formal proof, with visual feedback that makes the invisible visible.

---

## What exists today (competitors)

| Platform | Strengths | Weaknesses |
|----------|-----------|------------|
| Natural Number Game (adam.math.hhu.de) | Gamified, live tactic panel, guided levels | One topic only (Nat), academic UI, no curriculum |
| Mathematics in Lean (MIL) | Comprehensive, covers real mathematics | Textbook — no interactivity, intimidating |
| Lean 4 Web (live.lean-lang.org) | Real editor in browser | Blank canvas, no guidance, no exercises |
| Codewars (111 Lean kata) | Ranking system, community | Isolated puzzles, no teaching, no progression |
| Exercism | Best learning UX (tracks, mentoring) | No Lean track |
| Project Euler | Addictive (numbering, solve counts) | Math/programming, not proofs |
| ProofWidgets4 | Animated widgets in VS Code | Only works inside VS Code + Lean LSP |
| treehehe | D3.js proof tree visualization | Unmaintained (2018), not Lean-specific |

### Gaps nobody has filled

1. No one visualizes what a proof IS (goal state transformations)
2. No "explain this error" for beginners
3. No spaced repetition for proof skills
4. No solve-count / difficulty data
5. No connected multi-topic curriculum (logic → sets → algebra → analysis)
6. No Exercism-quality UX for theorem proving

---

## Our unique angle

**Interactive proof state visualization** — a stepper that shows, at each tactic,
how the goal state transforms. Hypotheses appear, goals narrow, subgoals split.
Animated, scrubable, visual. This is the thing nobody else has on the web.

Combined with a progressive curriculum that teaches the mathematics alongside
the Lean, in an Exercism-style track system.

---

## Architecture Overview

```
Phase 1 (Static + JS stepper):

  Cloudflare Pages
  ├── index.html, style.css
  ├── roadmap.html, plan.html
  ├── tracks/{logic,numbers,sets,...}/
  │   ├── index.html (track landing)
  │   └── NN-exercise.html (lesson + exercise + stepper)
  └── js/
      ├── stepper.js         ← NEW: proof state visualization engine
      ├── proof-data.js      ← NEW: static proof state data per exercise
      └── renderer.js        ← NEW: D3.js or SVG rendering of goal states

  User workflow:
  1. Read the mathematics explanation
  2. Step through the solved proof visually (see goal state at each tactic)
  3. Try it yourself: copy skeleton to Lean 4 Web or local VS Code
  4. Compare with solution


Phase 2 (Embedded editor):

  Cloudflare Pages (frontend)
        |
        | iframe / WebSocket
        v
  Hetzner node (lean4web)
  ├── Docker: Lean 4 + Mathlib
  ├── Nginx reverse proxy
  ├── pm2 process manager
  └── WebSocket relay

  User workflow:
  1. Read the mathematics
  2. Step through the solved proof visually
  3. Type your proof in the embedded editor
  4. See goal state update LIVE as you type (fed into our visualizer)
  5. Lean checks your proof server-side


Phase 3 (Game engine):

  Cloudflare Pages (frontend)
        |
        | WebSocket
        v
  Hetzner node (lean4game)
  ├── Node.js relay server
  ├── Lean 4 gameserver binary
  ├── Bubblewrap sandbox per session
  └── ~20 concurrent users per node

  User workflow:
  1. Select a level in a track
  2. Read the tactic introduction for this level
  3. Available tactics shown in a panel (only unlocked ones)
  4. Type proof, see animated goal state, get immediate feedback
  5. Complete level, unlock next


Phase 4 (Community):

  Cloudflare Pages + Supabase (or D1)
  ├── User accounts (GitHub OAuth)
  ├── Progress tracking per user
  ├── Solve counts per exercise
  ├── Community exercise submissions
  ├── Solution discussions (unlocked after you solve)
  └── Track completion badges
```

---

## Ecosystem Analysis (researched 2026-03-11)

### Lean 4 learning ecosystem

| Resource | Type | Notes |
|----------|------|-------|
| Natural Number Game (NNG4) | Game | Server-side Lean, ~20 concurrent users, gamified levels |
| Lean Game Server (adam.math.hhu.de) | Platform | Hosts NNG4 + SetGame + Robo + logic games |
| Mathematics in Lean (MIL) | Textbook | Comprehensive, covers real analysis, topology |
| Mechanics of Proof | Textbook | Gentler intro, good for undergrads |
| Theorem Proving in Lean 4 (TPIL) | Reference | Official manual, not a learning resource |
| Lean 4 Web (live.lean-lang.org) | Editor | Monaco + WebSocket to server-side Lean LSP |
| Codewars | Exercises | 111 Lean kata, theorem proving collections |
| ProofWidgets4 | Visualization | Animated widgets — VS Code only, not web |
| treehehe | Visualization | D3.js proof trees, unmaintained since 2018 |

### Agda learning ecosystem

| Resource | Type | Notes |
|----------|------|-------|
| PLFA (Programming Language Foundations in Agda) | Textbook | Gold standard, by Philip Wadler & Wen Kokke. Teaches PL theory through Agda. Very academic (grad level) |
| Agdapad | Editor | Online Agda editor, server-side |
| Codewars | Exercises | Small set of Agda kata |
| agda-wasm-dist | WASM build | **Agda v2.6.4.3 compiled to WASM (Dec 2025). Runs in browser!** |

### Browser-side proof checking — the key gap

| Prover | Browser WASM? | Status |
|--------|---------------|--------|
| **Agda** | **YES** | agda-wasm-dist works today (Dec 2025). Client-side proof checking possible NOW |
| **Lean 4** | **NO** | lean2wasm exists but only under Node.js. Browser build still WIP |
| Coq | Partial | jsCoq exists but heavy (~30MB download), slow startup |
| Isabelle | No | PIDE is JVM-based, no browser path |

**This is a major gap.** No one has built a learning platform that uses Agda's browser WASM
for client-side proof checking. We could be first — zero server infrastructure, works offline,
scales infinitely.

### Other lightweight approaches found

| Tool | What it does |
|------|-------------|
| lili | Minimalist JS proof checker (simply typed lambda calculus only) |
| lambda-tree | Web visualization of type derivation trees |
| lean-client-js-browser | WebWorker transport for Lean Emscripten build (experimental) |

### Strategic implications

1. **Our stepper is genuinely novel** — nobody else visualizes proof state transformations
   on the web. NNG4 shows the goal panel but doesn't animate transitions between steps.

2. **Zero-infrastructure advantage** — every competitor requires a server (Lean 4 Web,
   Agdapad, NNG4). Our stepper is pure static HTML/JS. Works offline, loads instantly.

3. **Agda WASM is the unlock** — client-side Agda proof checking means we can offer a
   "try it yourself" editor with zero backend. Something even the Agda community doesn't
   have in a learning context.

4. **Multi-language opportunity** — teach the same mathematical concepts (conjunction,
   implication, induction) in both Lean and Agda side-by-side. Nobody does this.

5. **Lean server when needed** — for Lean interactivity, use lean4web server-side
   (Phase 2). Or wait for lean2wasm to mature for browsers.

---

## Multi-Language Strategy

### Phase 1.5: Add Agda track (after current Lean tracks complete)

The same mathematical content, expressed in Agda syntax alongside Lean.
Each exercise page could show both languages or have a language toggle.

**Why Agda too?**
- Different audience: PLFA readers, Haskell programmers, PL researchers
- WASM advantage: client-side checking possible today (Lean can't do this yet)
- Educational value: seeing the same proof in two systems deepens understanding
- Market: Agda community is underserved (very few learning resources beyond PLFA)

### Phase 2 revised: Embedded editor with Agda WASM

Instead of starting with a Lean server (expensive, limited concurrency):
1. **Agda WASM editor first** — runs entirely in browser, zero cost, infinite scale
2. **Lean server editor second** — add when ready, for Lean-specific exercises

This reverses our original Phase 2 plan but is more practical.

### Agda WASM Feasibility Report (researched 2026-03-11)

**agda-wasm-dist** (github.com/agda-web/agda-wasm-dist):
- Agda compiled to WASM via GHC's Emscripten/WASI backend
- Versions available: 2.6.4.3, 2.7.0.1, 2.8.0
- **WASM binary size: ~29 MB** (agda-opt.wasm)
- Includes builtins only (Agda.Primitive, Agda.Primitive.Cubical) — **no stdlib**
- Runs via WASI runtime (Runno in browser, Wasmer on CLI)
- **Not on npm** as a standalone package (distributed via GitHub artifacts/Docker)
- Working demo: observablehq.com/@qbane/agda-web (Agda v2.6.4.3-r1)

**Key technical details:**
- 29 MB download is large but comparable to jsCoq (~30 MB)
- No stdlib means limited utility — you get dependent types and builtins only
- Interaction mode (for LSP-like behaviour) requires nonblocking stdin support
- The demo uses Runno (a browser WASI runtime) for filesystem virtualisation

**Lean WASM status:**
- lean2wasm exists (github.com/T-Brick/lean2wasm) — compiles Lean to WASM
- Emscripten build works under Node.js but **browser build still WIP**
- lean-client-js-browser exists for Lean 3 but is unmaintained
- Lean Playground (live.lean-lang.org) uses server-side LSP, not client-side WASM
- **No working Lean-in-browser demo exists as of March 2026**

**jsCoq comparison:**
- Coq compiled to JS via js_of_ocaml (not WASM)
- ~30 MB bundle, runs entirely in browser
- Includes Coq stdlib — more functional out of the box
- Mature project (since 2016), actively maintained
- Available on npm: @corwin.amber/jscoq

**Feasibility assessment for ifandonlyif.xyz:**

| Factor | Agda WASM | Lean WASM | jsCoq |
|--------|-----------|-----------|-------|
| Works in browser today? | Yes (demo exists) | No | Yes |
| Bundle size | ~29 MB | N/A | ~30 MB |
| Stdlib included? | No (builtins only) | N/A | Yes |
| npm package? | No | No | Yes |
| Maturity | Experimental | WIP | Mature |
| Startup time | Unknown (likely slow) | N/A | Several seconds |

**Recommendation:** The 29 MB download and lack of stdlib make Agda WASM a tough sell
for a learning platform right now. Our static stepper approach (zero download, instant load)
is actually a BETTER user experience for teaching. Consider Agda WASM as a Phase 3 feature
when the binary shrinks and stdlib support is added. For now, our stepper + "Open in
Agdapad" links is the pragmatic path.

### Content structure

```
tracks/
├── logic/           # Lean 4 (current)
├── numbers/         # Lean 4 (current)
├── sets/            # Lean 4 (planned)
├── functions/       # Lean 4 (planned)
├── agda-logic/      # Agda (new — same math, different syntax)
├── agda-numbers/    # Agda (new)
└── algebra/         # Lean 4 (planned)
```

Or alternatively, each exercise page has a Lean/Agda toggle — same stepper,
different proof data JSON. This would be more elegant.

---

## Proof Visualization State of the Art (researched 2026-03-11)

### No standard proof state interchange format exists

Each ITP has its own bespoke serialization:
- **Coq SerAPI**: S-expressions of OCaml internal types
- **coq-lsp**: JSON via `$/coq/getGoals` — closest to a "standard JSON proof state"
- **Lean 4 InfoView RPC**: `InteractiveGoal` / `InteractiveHypothesis` — richer than Coq
- **Isabelle PIDE**: Custom YXML markup, no JSON
- **Agda**: Custom Haskell-serialized Emacs protocol, no JSON

Cross-system efforts (MMT/OMDoc, Dedukti/Lambdapi) operate at library/theory level, not tactic proof states.

### Best-in-class visualization tools

| Tool | What | Status |
|------|------|--------|
| **ProofWidgets4** (CMU) | React components in VS Code InfoView | Cutting edge, VS Code only |
| **Alectryon** (MIT) | Static HTML with toggleable proof states | Best for literate proofs. Coq + Lean 4 |
| **jsCoq** | Full Coq in browser via js_of_ocaml | Works but heavy (~30MB), slow startup |
| **Incredible Proof Machine** | Drag-and-drop natural deduction (port/wire metaphor) | Web-based, educational |
| **Carnap.io** | Educational logic platform, Fitch/Gentzen rendering | Academic, Haskell/GHCJS |
| **Logitext** | Interactive sequent calculus with graphical trees | Web-based |

### AI proof trace formats (closest to ours)

| Format | Shape | Context |
|--------|-------|---------|
| **CoqGym** (ICML 2019) | `{ env, goals: [{ hypotheses, conclusion }], tactic }` | AI theorem proving research |
| **LeanDojo** (NeurIPS 2023) | `{ state: string, nextTactic: string }` | Pretty-printed, not structured |

### Our JSON format is novel and well-positioned

Our format independently converged on the same shape as coq-lsp and Lean 4's InteractiveGoal.
Future enhancements to consider:
- **Rich/tagged text** with semantic markup (like Lean's `TaggedText`)
- **Proof tree structure** linking parent tactics to child subgoals (genuinely novel)
- **Tactic metadata** (name, timing, source location)

### Key papers

- Nawrocki, Ayers, Ebner. "An Extensible User Interface for Lean 4." ITP 2023 (ProofWidgets4)
- Pit-Claudel, Courtieu. "Untangling Mechanized Proofs." SLE 2020 (Alectryon)
- Gallego Arias. "SerAPI: Machine-Friendly Serialization for Coq." 2016
- Yang, Deng. "Learning to Prove Theorems via Interacting with Proof Assistants." ICML 2019
- Yang et al. "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models." NeurIPS 2023

---

## "How to Prove It" — Proof Strategy Curriculum

### The idea

Daniel Velleman's *How to Prove It* (Cambridge, 3rd ed.) teaches the **strategies** of
mathematical proof: how to approach a goal, what to do when stuck, how to choose tactics.
Rather than teaching individual tactics in isolation, it teaches **proof architecture**.

We can build the same thing — but interactive, with our stepper showing not just WHAT
the tactic does but WHY you would choose it. Each exercise teaches a **proof strategy**,
not just a tactic.

### Velleman's structure (adapted for our stepper)

| Velleman Chapter | Proof Strategy | Our Exercise |
|-----------------|----------------|--------------|
| Ch 3: Proofs involving connectives | "To prove P ∧ Q, prove P and Q separately" | Show constructor splitting the goal |
| Ch 3: Proofs involving connectives | "To prove P → Q, assume P and derive Q" | Show intro adding hypothesis |
| Ch 3: Proofs involving negation | "To prove ¬P, assume P and derive contradiction" | Show intro + contradiction pattern |
| Ch 3: Proofs involving disjunction | "To use P ∨ Q, consider both cases" | Show rcases creating subgoals |
| Ch 4: Proofs involving quantifiers | "To prove ∀x, P(x), let x be arbitrary" | Show intro for universal |
| Ch 4: Proofs involving quantifiers | "To use ∃x, P(x), name the witness" | Show obtain destructuring |
| Ch 5: Proofs involving sets | "To prove x ∈ A ∩ B, prove x ∈ A and x ∈ B" | Reduces to conjunction strategy |
| Ch 6: Mathematical induction | "Prove base case, then prove step" | Show induction splitting goals |

### What makes this different from just teaching tactics

The key insight: Velleman teaches you to look at the **shape of the goal** and choose
a strategy based on the **outermost connective**. This is exactly what our stepper shows!

A "strategy card" for each step could say:
- "The goal has shape `P ∧ Q` → **Strategy: prove both halves** → Use `constructor`"
- "The goal has shape `P → Q` → **Strategy: assume the antecedent** → Use `intro`"
- "You have `h : P ∨ Q` → **Strategy: case split** → Use `rcases h`"

This transforms the stepper from "watch what happens" into "learn WHY this was the
right move." It's the difference between watching chess and learning chess strategy.

### Implementation

Add a `strategy` field to our JSON proof data:

```json
{
  "tactic": "constructor",
  "label": "Split the conjunction",
  "explanation": "We need to prove both Q and P separately.",
  "strategy": {
    "rule": "To prove A ∧ B, prove A and prove B separately",
    "trigger": "Goal has shape _ ∧ _",
    "velleman_ref": "§3.4 Conjunctions"
  },
  "hypotheses": [...],
  "goals": [...]
}
```

### A "Proof Strategies" track

Instead of organising by mathematical topic (logic, numbers, sets), this track
organises by **proof technique**:

```
tracks/
├── logic/              # By topic: the math
├── numbers/            # By topic: the math
├── strategies/         # By technique: how to prove
│   ├── 01-direct-proof.html
│   ├── 02-proof-by-cases.html
│   ├── 03-proof-by-contradiction.html
│   ├── 04-proof-by-induction.html
│   ├── 05-forward-vs-backward.html
│   ├── 06-choosing-witnesses.html
│   ├── 07-strengthening-induction.html
│   └── 08-proof-by-contrapositive.html
```

This is the "How to Prove It" track — it cross-references exercises from the
topic tracks but focuses on the meta-skill of proof construction.

---

## KS2 SATs Revision Tool — Spin-off Project

### Overview

Separate project from ifandonlyif.xyz, but shares the same core insight:
**make the reasoning process visible and interactive**, not just test/mark.

### KS2 SATs: what's tested

| Paper | Duration | Marks | Content |
|-------|----------|-------|---------|
| GPS Paper 1 (Grammar & Punctuation) | 45 mins | 50 | Subordinate clauses, passive voice, word classes, punctuation |
| GPS Paper 2 (Spelling) | ~15 mins | 20 | 20 dictated words |
| Reading | 1 hour | 50 | 3 texts, comprehension/inference/vocabulary |
| Maths Arithmetic | 30 mins | 40 | Long division, fractions, decimals, BODMAS |
| Maths Reasoning Paper 2 | 40 mins | 35 | Multi-step word problems |
| Maths Reasoning Paper 3 | 40 mins | 35 | Multi-step word problems |

2026 SATs: likely **11–14 May 2026** (second full week of May).

### Existing competitors

| Tool | Approach | Weakness |
|------|----------|----------|
| BBC Bitesize | Watch video, then quiz | Passive |
| SATs-Papers.co.uk | Past paper PDFs | Just testing, no teaching |
| CGP Books | Static workbooks | No interactivity |
| Atom Learning | AI-adaptive question bank | Still just questions, ~£85/year |
| DoodleMaths | Daily adaptive drill | Fluency not understanding |
| White Rose Maths | Worksheets | Good but static |

### The gaps

1. **Everything is worksheet-shaped** — no conceptual visualization
2. **No "explain my mistake"** — auto-marking says wrong, not why
3. **Grammar is badly served** — most rule-based subject, fewest interactive tools
4. **No stepper for multi-step reasoning** — children lose marks on reasoning chains, not individual calculations
5. **Parent experience is poor** — no tool says "weak at X, here's a focused session"

### Our differentiator: the Reasoning Stepper

Apply the same proof-stepper concept to KS2 maths reasoning:

```
Problem: A shop sells apples in bags of 6. Tom needs 50 apples.
         How many bags must he buy?

Step 1: What operation?     50 ÷ 6
Step 2: Calculate            50 ÷ 6 = 8 remainder 2
Step 3: Interpret            8 bags gives 48 apples — not enough
Step 4: Reasoning            Need to round UP (real-world context)
Step 5: Answer               Tom needs 9 bags ✓
```

Each step is independently checkable, with hints and explanations.
The child builds the solution chain, not just writes a final answer.

### MVP recommendation

Focus on **Maths Reasoning** first:
- Highest-anxiety area for parents
- Clearest stepper application
- Content most amenable to step-by-step treatment
- Domain: something like revisemaths.co.uk or satstepper.co.uk

### Shared technology

- Same vanilla JS stepper component (adapted for maths notation)
- Same static site architecture (Cloudflare Pages)
- Same dark/light theme system
- KaTeX for maths rendering (instead of Lean Unicode)

---

## Phase 1 — Detailed Plan (current)

### 1a. Proof State Stepper (the unique feature)

The stepper is a JavaScript component that renders proof state at each tactic step.

**Data model** — each exercise has a `proofSteps` array:

```json
{
  "theorem": "and_comm",
  "statement": "P ∧ Q → Q ∧ P",
  "steps": [
    {
      "tactic": null,
      "label": "Initial state",
      "hypotheses": [
        { "name": "P", "type": "Prop" },
        { "name": "Q", "type": "Prop" },
        { "name": "h", "type": "P ∧ Q" }
      ],
      "goals": ["Q ∧ P"]
    },
    {
      "tactic": "obtain ⟨hp, hq⟩ := h",
      "label": "Destructure the conjunction",
      "explanation": "We break h : P ∧ Q into its two parts: a proof of P and a proof of Q.",
      "hypotheses": [
        { "name": "P", "type": "Prop" },
        { "name": "Q", "type": "Prop" },
        { "name": "hp", "type": "P", "new": true },
        { "name": "hq", "type": "Q", "new": true }
      ],
      "goals": ["Q ∧ P"],
      "removed": ["h"]
    },
    {
      "tactic": "exact ⟨hq, hp⟩",
      "label": "Build the conjunction in reverse order",
      "explanation": "We construct Q ∧ P by providing hq (proof of Q) and hp (proof of P).",
      "hypotheses": [
        { "name": "P", "type": "Prop" },
        { "name": "Q", "type": "Prop" },
        { "name": "hp", "type": "P" },
        { "name": "hq", "type": "Q" }
      ],
      "goals": [],
      "qed": true
    }
  ]
}
```

**Rendering** — for each step:

```
┌─ Hypotheses ──────────────┐    ┌─ Goal ──────────┐
│ P : Prop                  │    │                  │
│ Q : Prop                  │    │   Q ∧ P          │
│ hp : P          ← NEW     │    │                  │
│ hq : Q          ← NEW     │    │                  │
└───────────────────────────┘    └──────────────────┘

  Tactic: obtain ⟨hp, hq⟩ := h
  "We break h : P ∧ Q into its two parts."

  ◀ Step 1 of 2  ●────────○  Step 2 of 2 ▶
```

**Tech**: Vanilla JS + CSS (no framework). Optional: D3.js for proof tree view.
- Timeline scrubber (like a video player)
- Keyboard navigation (← →)
- Hypotheses highlight when new (green) or removed (red strikethrough)
- Goal highlight when it changes
- Smooth CSS transitions between steps
- Mobile-friendly (stacked layout)

### 1b. Content tracks

Current:
- Logic (6 exercises) ✓
- Numbers (5 exercises) ✓

Next to build:
- Sets (6 exercises planned)
- Functions (5 exercises planned)

Each exercise gets stepper data added alongside the existing lesson text.

### 1c. Site features

- Track progress stored in localStorage (no backend needed)
- Exercise difficulty shown via self-reported stars (like Project Euler)
- "Open in Lean 4 Web" button pre-fills the exercise code
- Tactic reference page (searchable)
- Dark theme (done), light theme toggle

### 1d. File structure (Phase 1)

```
ifandonlyif.xyz/
├── index.html                    # Landing page
├── style.css                     # Shared styles
├── roadmap.html                  # Public roadmap
├── plan.html                     # This plan, rendered
├── reference/
│   └── tactics.html              # Tactic cheatsheet
├── js/
│   ├── stepper.js                # Proof state stepper component
│   ├── stepper.css               # Stepper styles
│   └── proofs/                   # Proof step data per exercise
│       ├── logic-01-true.json
│       ├── logic-02-implication.json
│       ├── logic-03-and.json
│       └── ...
├── tracks/
│   ├── logic/
│   │   ├── index.html
│   │   ├── 01-true.html
│   │   ├── 02-implication.html
│   │   └── ...
│   ├── numbers/
│   │   ├── index.html
│   │   ├── 01-zero-succ.html
│   │   └── ...
│   ├── sets/                     # Next
│   └── functions/                # After sets
├── .github/workflows/deploy.yml
└── README.md
```

---

## Phase 2 — Embedded Editor (future)

### Goal
Type proofs directly on the exercise page. See goal state update live.

### Components to deploy

1. **lean4web** (self-hosted on Hetzner node-02, cx23 2vCPU/4GB)
   - Docker container: Lean 4 + Mathlib
   - Nginx reverse proxy with SSL (Let's Encrypt)
   - pm2 process manager
   - WebSocket endpoint: wss://lean.ifandonlyif.xyz/websocket

2. **Frontend integration**
   - Embed Monaco editor via iframe or direct integration
   - Parse LSP `textDocument/hover` and `$/lean/plainGoal` responses
   - Feed parsed goal state into our stepper/visualizer
   - Pre-populate editor with exercise skeleton

3. **DNS**
   - lean.ifandonlyif.xyz → Hetzner node-02 (CNAME or A record)

### Capacity
- lean4web designed for "smallish Lean snippets" — perfect for exercises
- ~10-20 concurrent users per server (Lean is memory-hungry)
- Scale by adding nodes if needed

### Estimated cost
- Hetzner cx23 already running (€4.59/mo, K3s worker)
- Could run lean4web as a K3s pod, or standalone Docker on node-02
- Alternatively: dedicated cx21 for lean4web (~€4/mo)

---

## Phase 3 — Game Engine (future)

### Goal
Full lean4game integration. Structured levels with tactic unlocking.

### How lean4game works
- Games defined in Lean 4 using `GameServer.Commands` API
- `MakeGame` command compiles game data to JSON in `.lake/gamedata`
- Node.js relay server manages WebSocket connections to clients
- Each user session gets a Lean server process (bubblewrap sandboxed)
- Tactic panel shows only tactics unlocked for current level
- ~20 concurrent users per server node

### What we'd build
- Our own game levels using the lean4game framework
- Each track becomes a "world" (Logic World, Numbers World, Sets World)
- Exercises become levels within each world
- Our stepper visualization replaces/augments the default game UI

### Deployment
- Hetzner node (cx23 or bigger)
- Could run alongside lean4web or replace it
- lean4game includes both relay and Lean server

---

## Phase 4 — Community (future)

### Features
- GitHub OAuth login
- Progress stored server-side (Supabase or Cloudflare D1)
- Solve counts displayed on each exercise ("347 people proved this")
- Difficulty voting after solving
- Solution discussions (only visible after you solve it — prevents spoilers)
- Community-submitted exercises (PR-based review)
- Track completion badges
- Spaced repetition: exercises resurface after N days

### Infrastructure
- Supabase (free tier) or Cloudflare D1 for user data
- Cloudflare Workers for API endpoints
- GitHub OAuth via Cloudflare Workers

---

## Immediate Next Steps (ordered)

1. ~~**Build the proof state stepper** (JS component)~~ ✅ DONE
   - ~~Data model for proof steps~~
   - ~~Renderer: hypotheses panel, goal panel, timeline scrubber~~
   - ~~CSS animations for state transitions~~
   - ~~Keyboard navigation~~

2. **Add stepper to remaining exercises**
   - ✅ Logic track: all 6 exercises have stepper JSON + integration
   - ⬜ Numbers track: 5 exercises have HTML but no stepper JSON yet
   - Create proof step JSON for numbers exercises

3. **Build Sets track** (6 exercises with stepper data)

4. **Build Functions track** (5 exercises with stepper data)

5. **Research proof visualization standards** — align our JSON format
   with any existing standards (Coq SerAPI traces, Lean InfoView protocol, etc.)

6. **Investigate Agda WASM integration**
   - Test agda-wasm-dist in browser
   - Prototype a simple "type and check" editor
   - If viable: plan Agda tracks

7. **Add tactic reference page**

8. **Add localStorage progress tracking**

9. **Add "Open in Lean 4 Web" buttons**

10. **Add Agda equivalent exercises** (if WASM integration works)

11. **Build "Proof Strategies" track** — the "How to Prove It" curriculum
    - Add `strategy` field to JSON data model
    - Create 8 strategy-focused exercises
    - Cross-reference existing topic track exercises

12. **KS2 SATs Reasoning Stepper** (separate project)
    - Adapt stepper component for maths reasoning chains
    - Add KaTeX for maths rendering
    - Build 10 multi-step reasoning problems as MVP
    - Register domain (revisemaths.co.uk / satstepper.co.uk)
    - Target: ready for May 2026 SATs season

---

## Tech Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | None (vanilla JS/CSS) | No build step, deploys to Cloudflare Pages as-is, fast |
| Visualization | SVG + CSS transitions | Lightweight, no D3 dependency needed for Phase 1 |
| Proof data | Static JSON files | No backend needed, easy to author, version controlled |
| Hosting | Cloudflare Pages (free) | Auto-deploy from GitHub, global CDN |
| Editor (Phase 2a) | Agda WASM (client-side) | Zero server cost, runs in browser, infinite scale |
| Editor (Phase 2b) | lean4web (self-hosted) | Open source, WebSocket LSP, proven in production |
| Game engine (Phase 3) | lean4game | Powers NNG4, active development, Lean community standard |
| Auth (Phase 4) | GitHub OAuth | Target audience are developers/mathematicians |
| Database (Phase 4) | Cloudflare D1 | Already have account, free tier, serverless |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Lean 4 code in exercises may not compile with future Lean versions | Pin Lean toolchain version in docs, test exercises periodically |
| lean4web may be too resource-heavy for cx23 | Start with static stepper (Phase 1), only add backend when needed |
| Authoring proof step JSON is tedious | Later: build a tool that extracts steps from Lean LSP automatically |
| Low traffic initially | Fine — build for quality, not scale. Static site costs nothing |
| lean4game API may change | We wrap it, don't depend on internals |
| Agda WASM may be too slow/large for browser | Test with real exercises first; fallback to stepper-only for Agda |
| Maintaining two languages doubles content work | Share math explanations, only proof code differs; use language toggle |

---

## Success Metrics

Phase 1: "Does the stepper make proofs click?"
- Qualitative: show it to 5 people learning Lean, watch their reaction
- Ship stepper + 4 tracks (Logic, Numbers, Sets, Functions) with ~22 exercises

Phase 2: "Do people use the embedded editor?"
- Track editor sessions via simple analytics
- Target: 50 unique users/month

Phase 3: "Is this a real learning platform?"
- Track completion rates per track
- Target: 500 unique users/month

Phase 4: "Is there a community?"
- User registrations, solve counts, contributed exercises
