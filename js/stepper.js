/**
 * Proof State Stepper — ifandonlyif.xyz
 *
 * Renders an interactive step-through visualization of a Lean 4 proof.
 * Each step shows the tactic applied, the hypotheses in context, and the
 * remaining goals, with animated transitions between states.
 *
 * Usage:
 *   <div id="my-stepper"></div>
 *   <script>
 *     ProofStepper.mount('my-stepper', { theorem: '...', steps: [...] });
 *   </script>
 */

const ProofStepper = (() => {

  function mount(elementId, proofData) {
    const root = document.getElementById(elementId);
    if (!root) return;
    root.innerHTML = '';
    root.classList.add('proof-stepper');

    const state = { step: 0, maxVisited: 0 };
    const steps = proofData.steps;

    // Build DOM
    const header = el('div', 'stepper-header');
    const title = el('span', 'stepper-title');
    title.textContent = proofData.theorem || 'Proof';
    const counter = el('span', 'stepper-counter');
    header.append(title, counter);

    const body = el('div', 'stepper-body');
    const hypPanel = el('div', 'stepper-panel stepper-hypotheses');
    const hypLabel = el('div', 'stepper-panel-label');
    hypLabel.textContent = 'Hypotheses';
    const hypList = el('div', 'stepper-hyp-list');
    hypPanel.append(hypLabel, hypList);

    const goalPanel = el('div', 'stepper-panel stepper-goals');
    const goalLabel = el('div', 'stepper-panel-label');
    goalLabel.textContent = 'Goal';
    const goalList = el('div', 'stepper-goal-list');
    goalPanel.append(goalLabel, goalList);

    body.append(hypPanel, goalPanel);

    const tacticBar = el('div', 'stepper-tactic');

    const timeline = el('div', 'stepper-timeline');
    const prevBtn = el('button', 'stepper-btn');
    prevBtn.innerHTML = '&#9664;';
    prevBtn.title = 'Previous step (←)';
    const nextBtn = el('button', 'stepper-btn');
    nextBtn.innerHTML = '&#9654;';
    nextBtn.title = 'Next step (→)';
    const track = el('div', 'stepper-track');
    const keys = el('span', 'stepper-keys');
    keys.textContent = '← →';

    // Build dots and lines
    const dots = [];
    for (let i = 0; i < steps.length; i++) {
      if (i > 0) {
        const line = el('div', 'stepper-line');
        line.dataset.index = i - 1;
        track.appendChild(line);
      }
      const dot = el('div', 'stepper-dot');
      dot.dataset.index = i;
      dot.title = steps[i].label || `Step ${i}`;
      dot.addEventListener('click', () => goTo(i));
      track.appendChild(dot);
      dots.push(dot);
    }

    timeline.append(prevBtn, track, nextBtn, keys);
    root.append(header, body, tacticBar, timeline);

    // Events
    prevBtn.addEventListener('click', () => goTo(state.step - 1));
    nextBtn.addEventListener('click', () => goTo(state.step + 1));

    document.addEventListener('keydown', (e) => {
      // Only handle if stepper is visible in viewport
      const rect = root.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goTo(state.step - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goTo(state.step + 1);
      }
    });

    function goTo(i) {
      if (i < 0 || i >= steps.length) return;
      const prev = state.step;
      state.step = i;
      if (i > state.maxVisited) state.maxVisited = i;
      render(prev);
    }

    function render(prevStep) {
      const s = steps[state.step];
      const prev = prevStep !== undefined ? steps[prevStep] : null;
      const isForward = prevStep === undefined || state.step > prevStep;

      // Counter
      counter.textContent = `${state.step + 1} / ${steps.length}`;

      // Buttons
      prevBtn.disabled = state.step === 0;
      nextBtn.disabled = state.step === steps.length - 1;

      // Dots and lines
      dots.forEach((dot, i) => {
        dot.className = 'stepper-dot';
        if (i === state.step) {
          dot.classList.add(s.qed ? 'dot-qed' : 'dot-active');
        } else if (i <= state.maxVisited) {
          dot.classList.add('dot-visited');
        }
      });
      track.querySelectorAll('.stepper-line').forEach((line) => {
        const idx = parseInt(line.dataset.index);
        line.className = 'stepper-line';
        if (idx < state.maxVisited) line.classList.add('line-visited');
      });

      // Hypotheses
      renderHypotheses(s, prev, isForward);

      // Goals
      renderGoals(s, prev);

      // Tactic
      renderTactic(s);
    }

    function renderHypotheses(s, prev, isForward) {
      hypList.innerHTML = '';
      const prevNames = prev ? new Set(prev.hypotheses.map(h => h.name)) : new Set();
      const removedNames = s.removed ? new Set(s.removed) : new Set();

      // Show removed hypotheses (from previous step) with strikethrough
      if (prev && isForward) {
        prev.hypotheses.forEach(h => {
          if (removedNames.has(h.name)) {
            const item = makeHypEl(h);
            item.classList.add('hyp-removed');
            hypList.appendChild(item);
          }
        });
      }

      s.hypotheses.forEach(h => {
        const item = makeHypEl(h);
        if (h.new && isForward) {
          item.classList.add('hyp-new');
        } else if (!prevNames.has(h.name) && prev && isForward) {
          item.classList.add('hyp-new');
        }
        hypList.appendChild(item);
      });
    }

    function makeHypEl(h) {
      const item = el('div', 'hyp-item');
      const name = el('span', 'hyp-name');
      name.textContent = h.name;
      const colon = el('span', 'hyp-colon');
      colon.textContent = ' : ';
      const type = el('span', 'hyp-type');
      type.textContent = h.type;
      item.append(name, colon, type);
      return item;
    }

    function renderGoals(s, prev) {
      goalList.innerHTML = '';

      if (s.qed) {
        const qed = el('div', 'goal-qed');
        const sym = el('span', 'goal-qed-symbol');
        sym.textContent = '∎';
        const txt = document.createTextNode('No goals. QED');
        qed.append(sym, txt);
        goalList.appendChild(qed);
        return;
      }

      const prevGoals = prev ? prev.goals : [];
      s.goals.forEach((g, i) => {
        const item = el('div', 'goal-item');
        item.textContent = g;
        if (prev && (prevGoals[i] !== g || prevGoals.length !== s.goals.length)) {
          item.classList.add('goal-changed');
        }
        goalList.appendChild(item);
      });
    }

    function renderTactic(s) {
      tacticBar.innerHTML = '';
      if (!s.tactic) {
        const init = el('div', 'tactic-initial');
        init.textContent = s.label || 'Initial proof state';
        tacticBar.appendChild(init);
        return;
      }

      const code = el('div', 'tactic-code');
      code.textContent = s.tactic;
      tacticBar.appendChild(code);

      if (s.explanation) {
        const exp = el('div', 'tactic-explanation');
        exp.textContent = s.explanation;
        tacticBar.appendChild(exp);
      }
    }

    // Initial render
    render();
  }

  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  return { mount };
})();
