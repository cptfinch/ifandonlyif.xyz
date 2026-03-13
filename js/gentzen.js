/**
 * Gentzen Tree Renderer — ifandonlyif.xyz
 *
 * Renders natural deduction proofs as Gentzen-style inference trees.
 * Can be used standalone (proof theory track) or as an alternate view
 * mode for the tactic stepper (strategies track).
 *
 * Tree data format:
 *   {
 *     conclusion: "Q",
 *     rule: "→-Elim",
 *     premises: [
 *       { conclusion: "P", label: "hp", assumption: true },
 *       { conclusion: "P → Q", label: "hpq" }
 *     ]
 *   }
 *
 * Usage:
 *   GentzenTree.mount('element-id', treeData);
 *   GentzenTree.mountStepper('element-id', stepperData);
 */

const GentzenTree = (() => {

  // ─── Standalone tree rendering ───────────────────────────────────

  function mount(elementId, data) {
    const root = document.getElementById(elementId);
    if (!root) return;
    root.innerHTML = '';
    root.classList.add('gentzen-container');

    // Header
    const header = el('div', 'gentzen-header');
    const title = el('span', 'gentzen-title');
    title.textContent = data.theorem || 'Proof';
    header.appendChild(title);

    // Tree area
    const treeArea = el('div', 'gentzen-tree-area');
    const tree = renderNode(data.tree);
    treeArea.appendChild(tree);

    // Explanation area
    const explArea = el('div', 'gentzen-explanation');
    if (data.explanation) {
      explArea.textContent = data.explanation;
    }

    root.append(header, treeArea, explArea);

    // Make rule labels interactive
    root.querySelectorAll('.gentzen-rule').forEach(ruleEl => {
      ruleEl.addEventListener('click', () => {
        // Highlight the inference and show explanation
        root.querySelectorAll('.gentzen-inference.highlight').forEach(
          el => el.classList.remove('highlight')
        );
        const inference = ruleEl.closest('.gentzen-inference');
        if (inference) {
          inference.classList.add('highlight');
          const exp = inference.dataset.explanation;
          if (exp) explArea.textContent = exp;
        }
      });
    });
  }

  function renderNode(node) {
    if (!node) return el('span', 'gentzen-empty');

    // Leaf node — just a formula (axiom or assumption)
    if (!node.premises || node.premises.length === 0) {
      const leaf = el('div', 'gentzen-leaf');
      const formula = el('span', 'gentzen-formula');
      formula.innerHTML = formatFormula(node.conclusion);
      if (node.assumption) {
        const bracket = el('span', 'gentzen-assumption-bracket');
        bracket.innerHTML = '[' + formatFormula(node.conclusion) + ']';
        if (node.discharged) {
          const sup = el('sup', 'gentzen-discharge-mark');
          sup.textContent = node.discharged;
          bracket.appendChild(sup);
        }
        leaf.appendChild(bracket);
      } else {
        if (node.label) {
          const lbl = el('span', 'gentzen-label');
          lbl.textContent = node.label;
          leaf.append(lbl, document.createTextNode(' : '));
        }
        leaf.appendChild(formula);
      }
      return leaf;
    }

    // Inference node
    const inference = el('div', 'gentzen-inference');
    if (node.explanation) {
      inference.dataset.explanation = node.explanation;
    }

    // Premises row
    const premisesRow = el('div', 'gentzen-premises');
    node.premises.forEach((p, i) => {
      if (i > 0) {
        const spacer = el('div', 'gentzen-premise-spacer');
        premisesRow.appendChild(spacer);
      }
      premisesRow.appendChild(renderNode(p));
    });

    // Inference bar + rule label
    const barRow = el('div', 'gentzen-bar-row');
    const bar = el('div', 'gentzen-bar');
    const rule = el('span', 'gentzen-rule');
    rule.textContent = node.rule || '';
    if (node.discharged) {
      const sup = el('sup', 'gentzen-discharge-mark');
      sup.textContent = node.discharged;
      rule.appendChild(sup);
    }
    barRow.append(bar, rule);

    // Conclusion
    const conclusionEl = el('div', 'gentzen-conclusion');
    const formula = el('span', 'gentzen-formula');
    formula.innerHTML = formatFormula(node.conclusion);
    conclusionEl.appendChild(formula);

    inference.append(premisesRow, barRow, conclusionEl);
    return inference;
  }

  // ─── Stepper mode (stepping through tree construction) ───────────

  function mountStepper(elementId, data) {
    const root = document.getElementById(elementId);
    if (!root) return;
    root.innerHTML = '';
    root.classList.add('gentzen-container');

    const steps = data.steps;
    const state = { step: 0, maxVisited: 0 };

    // Header
    const header = el('div', 'gentzen-header');
    const title = el('span', 'gentzen-title');
    title.textContent = data.theorem || 'Proof';
    const counter = el('span', 'gentzen-counter');
    header.append(title, counter);

    // Tree area
    const treeArea = el('div', 'gentzen-tree-area');

    // Info panel (rule + explanation)
    const infoPanel = el('div', 'gentzen-info-panel');
    const ruleDisplay = el('div', 'gentzen-rule-display');
    const explDisplay = el('div', 'gentzen-explanation');
    infoPanel.append(ruleDisplay, explDisplay);

    // Timeline
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
    root.append(header, treeArea, infoPanel, timeline);

    // Events
    prevBtn.addEventListener('click', () => goTo(state.step - 1));
    nextBtn.addEventListener('click', () => goTo(state.step + 1));
    document.addEventListener('keydown', (e) => {
      const rect = root.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); goTo(state.step - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); goTo(state.step + 1);
      }
    });

    function goTo(i) {
      if (i < 0 || i >= steps.length) return;
      state.step = i;
      if (i > state.maxVisited) state.maxVisited = i;
      render();
    }

    function render() {
      const s = steps[state.step];
      counter.textContent = `${state.step + 1} / ${steps.length}`;
      prevBtn.disabled = state.step === 0;
      nextBtn.disabled = state.step === steps.length - 1;

      // Dots
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

      // Completion celebration
      if (s.qed && state.step > 0) {
        const prevStep = steps[state.step - 1];
        if (prevStep && !prevStep.qed) {
          root.classList.add('stepper-completed');
          if (typeof Progress !== 'undefined' && Progress.markCompleted) {
            Progress.markCompleted();
          }
        }
      }

      // Tree — render the partial tree for this step
      treeArea.innerHTML = '';
      if (s.tree) {
        treeArea.appendChild(renderNode(s.tree));
      }

      // Rule display
      ruleDisplay.innerHTML = '';
      if (s.rule) {
        const ruleTag = el('span', 'gentzen-rule-tag');
        ruleTag.textContent = s.rule;
        ruleDisplay.appendChild(ruleTag);
        if (s.label) {
          const lbl = el('span', 'gentzen-step-label');
          lbl.textContent = ' — ' + s.label;
          ruleDisplay.appendChild(lbl);
        }
      } else if (s.label) {
        ruleDisplay.textContent = s.label;
      }

      // Explanation
      explDisplay.textContent = s.explanation || '';

      // Lean tactic mapping (shown if present)
      if (s.lean_tactic) {
        const mapping = el('div', 'gentzen-lean-mapping');
        mapping.innerHTML = '<span class="mapping-label">In Lean 4:</span> <code>' +
          escapeHtml(s.lean_tactic) + '</code>';
        infoPanel.appendChild(mapping);
      } else {
        // Remove old mapping if present
        const old = infoPanel.querySelector('.gentzen-lean-mapping');
        if (old) old.remove();
      }
    }

    render();
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  function formatFormula(text) {
    if (!text) return '';
    return escapeHtml(text)
      .replace(/→/g, '<span class="sym">→</span>')
      .replace(/∧/g, '<span class="sym">∧</span>')
      .replace(/∨/g, '<span class="sym">∨</span>')
      .replace(/¬/g, '<span class="sym">¬</span>')
      .replace(/⊥/g, '<span class="sym">⊥</span>')
      .replace(/⊢/g, '<span class="sym">⊢</span>')
      .replace(/∀/g, '<span class="sym">∀</span>')
      .replace(/∃/g, '<span class="sym">∃</span>');
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  return { mount, mountStepper, renderNode };
})();
