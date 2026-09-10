/* ============================================================
   Dosette — Live Demonstration Console
   Panels A / D / E embed the real app (index.html), each locked
   to one role. Panel C runs a scripted walkthrough that drives
   those embeds through their own public functions. State stays
   in sync between panels through the app's existing SSE + server.
   ============================================================ */

const frames = {
  device: document.getElementById('fr-device'),
  patient: document.getElementById('fr-patient'),
  caregiver: document.getElementById('fr-caregiver'),
};
const ROLE_OF = { device: 'DEVICE', patient: 'PATIENT', caregiver: 'CAREGIVER' };

const el = (id) => document.getElementById(id);

/* ---------- embed preparation ---------- */
function stripChrome(key) {
  let d;
  try { d = frames[key].contentDocument; } catch (e) { return; }
  if (!d || !d.body) return;
  d.body.classList.remove('mode-mobile-phone');
  d.body.classList.add('mode-desktop-split');
  if (!d.getElementById('demo-embed-style')) {
    const st = d.createElement('style');
    st.id = 'demo-embed-style';
    st.textContent =
      '.app-header{display:none!important}' +
      '.app-viewport-wrapper{padding:0!important}' +
      '.toast-container{display:none!important}' +
      '.smartphone-frame{max-width:none!important}' +
      'body{overflow-x:hidden}' +
      /* keep the app's own tab bar reachable inside the embed */
      'body:not(.role-device) .mobile-bottom-nav{display:block!important;position:sticky!important;bottom:0!important;z-index:90}' +
      'body.mode-desktop-split .phone-content-area{padding-bottom:5rem!important}';
    d.head.appendChild(st);
  }
}

function prep(key) {
  stripChrome(key);
  try {
    const w = frames[key].contentWindow;
    if (typeof w.switchRole === 'function') w.switchRole(ROLE_OF[key]);
    const d = frames[key].contentDocument;
    if (d && d.documentElement) d.documentElement.scrollTop = 0;
    const area = d && d.querySelector('.phone-content-area');
    if (area) area.scrollTop = 0;
  } catch (e) { /* noop */ }
}

/* schedule a couple of refreshes so the POST has time to land server-side */
function nudge() {
  setTimeout(refreshAll, 300);
  setTimeout(refreshAll, 1100);
}

/* pull fresh shared state into every embed and re-render */
function refreshAll() {
  Object.keys(frames).forEach((key) => {
    try {
      const w = frames[key].contentWindow;
      if (typeof w.loadInitialData === 'function') {
        Promise.resolve(w.loadInitialData()).catch(() => {});
      } else if (typeof w.renderAll === 'function') {
        w.renderAll();
      }
    } catch (e) { /* noop */ }
  });
}

Object.keys(frames).forEach((key) => {
  const frame = frames[key];
  frame.addEventListener('load', () => {
    prep(key);
    // app boots on DOMContentLoaded then loads data async — re-strip chrome after
    setTimeout(() => stripChrome(key), 700);
    setTimeout(() => stripChrome(key), 2000);
  });
  try {
    if (frame.contentDocument && frame.contentDocument.readyState === 'complete') prep(key);
  } catch (e) { /* noop */ }
});

/* ---------- helpers to talk to an embed ---------- */
function inWin(key, fn) {
  try {
    const w = frames[key].contentWindow;
    const d = frames[key].contentDocument;
    if (w && d) fn(w, d);
  } catch (e) { console.warn('[demo] embed call failed:', e); }
}

function focus(key) {
  ['a', 'd', 'e'].forEach((p) => document.querySelector('.panel-' + p).classList.remove('is-focus'));
  const map = { device: 'a', patient: 'd', caregiver: 'e' };
  const p = document.querySelector('.panel-' + map[key]);
  if (p) p.classList.add('is-focus');
}

function setNarr(kicker, head, note) {
  el('b-kicker').textContent = kicker;
  el('b-headline').textContent = head;
  el('b-note').textContent = note;
}

/* ---------- scripted steps ---------- */
const STEPS = [
  {
    kicker: 'STEP 1', head: 'John scans his medication box',
    note: 'In the patient app Dosette recognises the Lipitor 20 mg package from its barcode — no typing, no leaflet.',
    run() {
      inWin('patient', (w, d) => {
        w.switchRole('PATIENT');
        w.activateTab('tab-patient-scan');
        const b = d.getElementById('btn-scan-lipitor');
        if (b) b.click();
      });
      focus('patient');
    },
  },
  {
    kicker: 'STEP 2', head: 'Dosette explains it in one plain sentence',
    note: '“Lipitor lowers your cholesterol. Take 1 tablet every evening with water.” — large text, and it can be read aloud.',
    run() {
      inWin('patient', (w, d) => {
        w.activateTab('tab-patient-scan');
        const c = d.getElementById('ai-result-card');
        if (c) c.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      focus('patient');
    },
  },
  {
    kicker: 'STEP 3', head: 'Sophie loads Compartment 3',
    note: 'The caregiver app shows which compartment to fill. Sophie loads the evening Lipitor dose into Compartment 3.',
    run() {
      inWin('caregiver', (w) => {
        w.switchRole('CAREGIVER');
        w.activateTab('tab-cg-pillbox');
        if (typeof w.fillCompartmentAction === 'function') w.fillCompartmentAction(3, 'med_002');
      });
      nudge();
      focus('caregiver');
    },
  },
  {
    kicker: 'STEP 4', head: '19:00 — the evening dose is due',
    note: 'All three views move to 19:00. The unit and John’s phone show the dose is waiting in Compartment 3.',
    run() {
      ['patient', 'caregiver', 'device'].forEach((r) =>
        inWin(r, (w) => { if (typeof w.setSimulatedTime === 'function') w.setSimulatedTime('19:00', false); }));
      markTime('19:00');
      inWin('device', (w) => w.switchRole('DEVICE'));
      inWin('patient', (w) => { w.switchRole('PATIENT'); w.activateTab('tab-patient-today'); });
      nudge();
      focus('device');
    },
  },
  {
    kicker: 'STEP 5', head: 'John opens Compartment 3 and takes his dose',
    note: 'The sensor logs the intake. Watch Sophie’s Care Inbox — a green “taken on time” confirmation arrives in real time through the shared server.',
    run() {
      inWin('patient', (w) => {
        w.switchRole('PATIENT');
        w.activateTab('tab-patient-today');
        if (typeof w.openCompartmentAction === 'function') w.openCompartmentAction(3);
      });
      inWin('caregiver', (w) => { w.switchRole('CAREGIVER'); w.activateTab('tab-cg-inbox'); });
      nudge();
      focus('caregiver');
    },
  },
  {
    kicker: 'STEP 6', head: 'Sophie sees John is on schedule',
    note: 'The Care Inbox confirms the evening dose was taken on time, and adherence stays at 94%. No alert was raised.',
    run() {
      inWin('caregiver', (w) => { w.switchRole('CAREGIVER'); w.activateTab('tab-cg-inbox'); });
      nudge();
      focus('caregiver');
    },
  },
];

let reached = -1; // highest step index run

/* highlight one of the "Other states" buttons ('idle' | 'missed' | null) */
function setOtherCurrent(which) {
  el('grp-fallback').querySelectorAll('.c-btn').forEach((b) => {
    const key = b.dataset.state === 'idle' ? 'idle' : 'missed';
    b.classList.toggle('is-current', key === which);
  });
}

/* highlight the active "Simulation time" button (or null to clear) */
function markTime(t) {
  el('grp-time').querySelectorAll('[data-time]').forEach((b) => {
    b.classList.toggle('is-current', b.dataset.time === t);
  });
}

/* set the simulated clock across all three embeds */
function setTime(t) {
  const announce = t === '19:35';
  ['patient', 'caregiver', 'device'].forEach((r) =>
    inWin(r, (w) => { if (typeof w.setSimulatedTime === 'function') w.setSimulatedTime(t, announce); }));
  markTime(t);
  nudge();
}

function renderProgress() {
  const wrap = el('b-progress');
  wrap.innerHTML = '';
  for (let i = 0; i < STEPS.length; i += 1) {
    const b = document.createElement('i');
    if (i < reached) b.className = 'done';
    if (i === reached) b.className = 'current';
    wrap.appendChild(b);
  }
  el('grp-flow').querySelectorAll('[data-step]').forEach((btn) => {
    const i = Number(btn.dataset.step);
    btn.classList.toggle('is-done', i < reached);
    btn.classList.toggle('is-current', i === reached);
  });
}

function runStep(i) {
  const step = STEPS[i];
  if (!step) return;
  reached = Math.max(reached, i);
  setOtherCurrent(null);
  setNarr(step.kicker, step.head, step.note);
  step.run();
  renderProgress();
}

function runIdle() {
  setNarr('IDLE', 'No dose due right now',
    'It is 12:30 — nothing is scheduled until this evening. The unit shows its idle dial, John’s phone says “all caught up”, and Sophie’s app stays quiet.');
  ['patient', 'caregiver', 'device'].forEach((r) =>
    inWin(r, (w) => { if (typeof w.setSimulatedTime === 'function') w.setSimulatedTime('12:30', false); }));
  markTime('12:30');
  inWin('patient', (w) => { w.switchRole('PATIENT'); w.activateTab('tab-patient-today'); });
  inWin('device', (w) => w.switchRole('DEVICE'));
  inWin('caregiver', (w) => { w.switchRole('CAREGIVER'); w.activateTab('tab-cg-timeline'); });
  nudge();
  reached = -1;
  setOtherCurrent('idle');
  renderProgress();
  focus('device');
}

function runFallback() {
  setNarr('FALLBACK', 'Missed dose — Sophie is alerted',
    'The dose is now more than 30 minutes late. The unit LED blinks red and the caregiver app raises an alarm banner with a one-tap call to John.');
  ['patient', 'caregiver', 'device'].forEach((r) =>
    inWin(r, (w) => { if (typeof w.setSimulatedTime === 'function') w.setSimulatedTime('19:35', true); }));
  markTime('19:35');
  inWin('caregiver', (w) => {
    w.switchRole('CAREGIVER');
    if (typeof w.triggerAlertAction === 'function') w.triggerAlertAction(3, false);
    w.activateTab('tab-cg-timeline');
  });
  nudge();
  focus('caregiver');
  setOtherCurrent('missed');
}

async function resetDemo() {
  try { await fetch('/api/reset', { method: 'POST' }); } catch (e) { /* noop */ }
  Object.keys(frames).forEach((key) => {
    try { frames[key].contentWindow.location.reload(); }
    catch (e) { frames[key].src = 'index.html'; }
  });
  reached = -1;
  setNarr('READY', 'Dosette live demonstration',
    'Use the walkthrough controls below. Each step drives the real patient, caregiver and device apps shown on the right.');
  setOtherCurrent(null);
  markTime('19:00');
  ['a', 'd', 'e'].forEach((p) => document.querySelector('.panel-' + p).classList.remove('is-focus'));
  renderProgress();
}

/* ---------- wiring ---------- */
el('grp-flow').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-step]');
  if (btn) runStep(Number(btn.dataset.step));
});
el('grp-fallback').addEventListener('click', (e) => {
  if (e.target.closest('[data-state="idle"]')) { runIdle(); return; }
  if (e.target.closest('[data-fallback]')) runFallback();
});
el('grp-time').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-time]');
  if (btn) setTime(btn.dataset.time);
});
el('grp-jump').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-jump]');
  if (!btn) return;
  const key = btn.dataset.jump;
  inWin(key, (w) => w.switchRole(ROLE_OF[key]));
  focus(key);
});
el('btn-reset').addEventListener('click', resetDemo);

document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== ' ') return;
  if (document.activeElement && /^(INPUT|BUTTON|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  e.preventDefault();
  runStep(Math.min(reached + 1, STEPS.length - 1));
});

renderProgress();
