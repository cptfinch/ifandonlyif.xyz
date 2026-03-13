/**
 * View Toggle — ifandonlyif.xyz
 *
 * Adds a "Tactic view / Tree view" toggle to exercises that have both
 * a tactic stepper and Gentzen tree data. Same proof, two representations.
 *
 * Usage:
 *   ViewToggle.mount('element-id', proofData);
 *   // proofData must have both `steps` (tactic) and `gentzen_tree` (tree) fields
 */

const ViewToggle = (() => {

  function mount(elementId, proofData) {
    const root = document.getElementById(elementId);
    if (!root) return;

    // Only show toggle if both views are available
    const hasTactic = proofData.steps && proofData.steps.length > 0;
    const hasTree = proofData.gentzen_tree && proofData.gentzen_tree.tree;

    if (!hasTactic || !hasTree) {
      // Fall back to tactic stepper only
      if (hasTactic && typeof ProofStepper !== 'undefined') {
        ProofStepper.mount(elementId, proofData);
      }
      return;
    }

    root.innerHTML = '';
    root.classList.add('view-toggle-container');

    // Toggle bar
    const toggleBar = document.createElement('div');
    toggleBar.className = 'view-toggle-bar';

    const tacticBtn = document.createElement('button');
    tacticBtn.className = 'view-toggle-btn view-toggle-active';
    tacticBtn.textContent = 'Tactic view';
    tacticBtn.title = 'Show Lean 4 tactics step by step';

    const treeBtn = document.createElement('button');
    treeBtn.className = 'view-toggle-btn';
    treeBtn.textContent = 'Tree view';
    treeBtn.title = 'Show Gentzen inference tree';

    const gentzenLabel = document.createElement('span');
    gentzenLabel.className = 'view-toggle-rule';
    if (proofData.gentzen && proofData.gentzen.rule) {
      gentzenLabel.textContent = proofData.gentzen.rule;
    }

    toggleBar.append(tacticBtn, treeBtn, gentzenLabel);

    // View containers
    const tacticView = document.createElement('div');
    tacticView.className = 'view-toggle-view view-toggle-visible';
    tacticView.id = elementId + '-tactic';

    const treeView = document.createElement('div');
    treeView.className = 'view-toggle-view';
    treeView.id = elementId + '-tree';

    root.append(toggleBar, tacticView, treeView);

    // Mount tactic stepper
    if (typeof ProofStepper !== 'undefined') {
      ProofStepper.mount(elementId + '-tactic', proofData);
    }

    // Mount Gentzen tree (static view, not stepper)
    if (typeof GentzenTree !== 'undefined') {
      GentzenTree.mount(elementId + '-tree', proofData.gentzen_tree);
    }

    // Toggle logic
    let currentView = 'tactic';

    tacticBtn.addEventListener('click', () => {
      if (currentView === 'tactic') return;
      currentView = 'tactic';
      tacticBtn.classList.add('view-toggle-active');
      treeBtn.classList.remove('view-toggle-active');
      tacticView.classList.add('view-toggle-visible');
      treeView.classList.remove('view-toggle-visible');
    });

    treeBtn.addEventListener('click', () => {
      if (currentView === 'tree') return;
      currentView = 'tree';
      treeBtn.classList.add('view-toggle-active');
      tacticBtn.classList.remove('view-toggle-active');
      treeView.classList.add('view-toggle-visible');
      tacticView.classList.remove('view-toggle-visible');
    });

    // Keyboard shortcut: T to toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 't' || e.key === 'T') {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        // Only if not typing in an input
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        const rect = root.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;
        if (currentView === 'tactic') {
          treeBtn.click();
        } else {
          tacticBtn.click();
        }
      }
    });
  }

  return { mount };
})();
