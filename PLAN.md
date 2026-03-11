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

1. **Build the proof state stepper** (JS component)
   - Data model for proof steps
   - Renderer: hypotheses panel, goal panel, timeline scrubber
   - CSS animations for state transitions
   - Keyboard navigation

2. **Add stepper to existing exercises**
   - Create proof step JSON for all 11 existing exercises
   - Integrate stepper component into exercise HTML

3. **Build Sets track** (6 exercises with stepper data)

4. **Build Functions track** (5 exercises with stepper data)

5. **Add tactic reference page**

6. **Add localStorage progress tracking**

7. **Add "Open in Lean 4 Web" buttons**

---

## Tech Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | None (vanilla JS/CSS) | No build step, deploys to Cloudflare Pages as-is, fast |
| Visualization | SVG + CSS transitions | Lightweight, no D3 dependency needed for Phase 1 |
| Proof data | Static JSON files | No backend needed, easy to author, version controlled |
| Hosting | Cloudflare Pages (free) | Auto-deploy from GitHub, global CDN |
| Editor (Phase 2) | lean4web (self-hosted) | Open source, WebSocket LSP, proven in production |
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
