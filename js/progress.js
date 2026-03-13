/**
 * Progress Tracker — ifandonlyif.xyz
 *
 * Duolingo-style progress tracking using localStorage.
 * Tracks which exercises have been visited and completed (stepped through
 * to QED). Renders progress indicators on track index pages and exercise
 * pages.
 *
 * Data model in localStorage key "iff-progress":
 *   {
 *     exercises: {
 *       "proof-theory/01": { visited: true, completed: true, completedAt: "..." },
 *       "logic/02": { visited: true, completed: false },
 *       ...
 *     },
 *     stats: { streak: 3, lastActiveDate: "2026-03-13", totalCompleted: 7 }
 *   }
 */

const Progress = (() => {

  const STORAGE_KEY = 'iff-progress';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { exercises: {}, stats: { streak: 0, lastActiveDate: null, totalCompleted: 0 } };
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  // ─── Exercise tracking ─────────────────────────────────────────

  function exerciseId() {
    // Derive from URL path: /tracks/logic/02-implication.html → "logic/02"
    const path = window.location.pathname;
    const match = path.match(/tracks\/([^/]+)\/(\d+)/);
    if (match) return match[1] + '/' + match[2];
    return null;
  }

  function markVisited() {
    const id = exerciseId();
    if (!id) return;
    const data = load();
    if (!data.exercises[id]) data.exercises[id] = {};
    data.exercises[id].visited = true;
    updateStreak(data);
    save(data);
  }

  function markCompleted() {
    const id = exerciseId();
    if (!id) return;
    const data = load();
    if (!data.exercises[id]) data.exercises[id] = {};
    if (!data.exercises[id].completed) {
      data.exercises[id].completed = true;
      data.exercises[id].completedAt = new Date().toISOString();
      data.stats.totalCompleted = (data.stats.totalCompleted || 0) + 1;
    }
    updateStreak(data);
    save(data);
  }

  function isCompleted(trackSlug, exerciseNum) {
    const data = load();
    const id = trackSlug + '/' + exerciseNum;
    return data.exercises[id] && data.exercises[id].completed;
  }

  function isVisited(trackSlug, exerciseNum) {
    const data = load();
    const id = trackSlug + '/' + exerciseNum;
    return data.exercises[id] && data.exercises[id].visited;
  }

  // ─── Streak ────────────────────────────────────────────────────

  function updateStreak(data) {
    const today = new Date().toISOString().slice(0, 10);
    const last = data.stats.lastActiveDate;
    if (last === today) return; // Already active today

    if (last) {
      const lastDate = new Date(last);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / 86400000);
      if (diffDays === 1) {
        data.stats.streak = (data.stats.streak || 0) + 1;
      } else if (diffDays > 1) {
        data.stats.streak = 1; // Streak broken
      }
    } else {
      data.stats.streak = 1;
    }
    data.stats.lastActiveDate = today;
  }

  function getStats() {
    return load().stats;
  }

  // ─── UI: Track index page badges ──────────────────────────────

  function renderTrackProgress() {
    // Detect which track we're on from the URL
    const path = window.location.pathname;
    const trackMatch = path.match(/tracks\/([^/]+)\/index/);
    if (!trackMatch) return;
    const trackSlug = trackMatch[1];

    // Find all exercise list items and add badges
    document.querySelectorAll('.exercise-list a').forEach(link => {
      const href = link.getAttribute('href');
      const numMatch = href && href.match(/(\d+)/);
      if (!numMatch) return;
      const num = numMatch[1];

      if (isCompleted(trackSlug, num)) {
        const badge = document.createElement('span');
        badge.className = 'ex-badge ex-badge-complete';
        badge.textContent = '\u2713'; // checkmark
        badge.title = 'Completed';
        link.appendChild(badge);
      } else if (isVisited(trackSlug, num)) {
        const badge = document.createElement('span');
        badge.className = 'ex-badge ex-badge-visited';
        badge.textContent = '\u25CB'; // circle
        badge.title = 'Visited';
        link.appendChild(badge);
      }
    });

    // Add track progress bar
    const data = load();
    const exerciseLinks = document.querySelectorAll('.exercise-list a');
    let completed = 0;
    let total = exerciseLinks.length;
    exerciseLinks.forEach(link => {
      const href = link.getAttribute('href');
      const numMatch = href && href.match(/(\d+)/);
      if (numMatch && isCompleted(trackSlug, numMatch[1])) completed++;
    });

    if (total > 0) {
      const bar = document.createElement('div');
      bar.className = 'track-progress-bar';
      const fill = document.createElement('div');
      fill.className = 'track-progress-fill';
      fill.style.width = Math.round((completed / total) * 100) + '%';
      const label = document.createElement('span');
      label.className = 'track-progress-label';
      label.textContent = completed + ' / ' + total + ' completed';
      bar.appendChild(fill);

      const container = document.createElement('div');
      container.className = 'track-progress';
      container.append(bar, label);

      // Insert after the track-desc paragraph
      const desc = document.querySelector('.track-desc');
      if (desc) desc.after(container);
    }
  }

  // ─── UI: Homepage track card progress ─────────────────────────

  function renderHomepageProgress() {
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) return;

    const data = load();
    const stats = data.stats;

    // Add streak display if active
    if (stats.streak > 0 && stats.lastActiveDate) {
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = new Date(stats.lastActiveDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / 86400000);

      if (diffDays <= 1) {
        const streakEl = document.createElement('div');
        streakEl.className = 'streak-display';
        streakEl.innerHTML = '<span class="streak-fire">\uD83D\uDD25</span> ' +
          stats.streak + ' day streak';
        const hero = document.querySelector('.hero-actions');
        if (hero) hero.after(streakEl);
      }
    }

    // Add completion dots to track cards
    document.querySelectorAll('.track-card').forEach(card => {
      const href = card.getAttribute('href');
      const trackMatch = href && href.match(/tracks\/([^/]+)/);
      if (!trackMatch) return;
      const trackSlug = trackMatch[1];

      // Count completed for this track
      let completed = 0;
      let total = 0;
      Object.keys(data.exercises).forEach(key => {
        if (key.startsWith(trackSlug + '/')) {
          total++;
          if (data.exercises[key].completed) completed++;
        }
      });

      if (completed > 0) {
        const statusEl = card.querySelector('.track-status');
        if (statusEl) {
          statusEl.textContent = completed + ' completed \u00B7 ' + statusEl.textContent;
        }
      }
    });
  }

  // ─── Init ──────────────────────────────────────────────────────

  function init() {
    markVisited();
    renderTrackProgress();
    renderHomepageProgress();
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { markCompleted, isCompleted, isVisited, getStats, exerciseId };
})();
