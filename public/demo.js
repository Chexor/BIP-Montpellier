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

/* ---------- Pocket TTS Mary voice ---------- */
let demoVoiceEnabled = true;
let demoVoiceAudio = null;
let currentVoiceKey = null;

function voiceSrc(key) {
  return key ? `/assets/audio/demo/${key}.wav` : null;
}

function setVoicePlaying(isPlaying) {
  el('btn-demo-voice-replay')?.classList.toggle('is-playing', isPlaying);
}

function updateVoiceControls() {
  const toggle = el('btn-demo-voice-toggle');
  if (toggle) {
    toggle.classList.toggle('is-muted', !demoVoiceEnabled);
    toggle.setAttribute('aria-pressed', String(demoVoiceEnabled));
    toggle.textContent = demoVoiceEnabled ? 'Dosi voice on' : 'Dosi voice off';
  }

  const replay = el('btn-demo-voice-replay');
  if (replay) {
    replay.disabled = !currentVoiceKey;
    replay.textContent = currentVoiceKey ? 'Replay Dosi' : 'No Dosi line';
  }
}

function stopDemoVoice() {
  if (!demoVoiceAudio) return;
  demoVoiceAudio.pause();
  demoVoiceAudio.currentTime = 0;
  setVoicePlaying(false);
}

function clearDemoVoice() {
  stopDemoVoice();
  currentVoiceKey = null;
  updateVoiceControls();
}

function playDemoVoice(key, { force = false } = {}) {
  const src = voiceSrc(key);
  if (!src) return;
  currentVoiceKey = key;
  updateVoiceControls();

  if (!demoVoiceEnabled && !force) return;

  stopDemoVoice();
  demoVoiceAudio = demoVoiceAudio || new Audio();
  demoVoiceAudio.src = src;
  demoVoiceAudio.currentTime = 0;
  demoVoiceAudio.onended = () => setVoicePlaying(false);
  demoVoiceAudio.onerror = () => setVoicePlaying(false);
  setVoicePlaying(true);
  demoVoiceAudio.play().catch(() => setVoicePlaying(false));
}

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
      '.smartphone-frame{max-width:none!important;position:relative!important}' +
      'body{overflow-x:hidden}' +
      /* device: compact the screen so it fits its panel with no scroll */
      'body.role-device .device-screen-view{min-height:0!important;padding:.7rem .8rem 1rem!important;gap:.55rem!important;justify-content:flex-start!important}' +
      'body.role-device .device-dose-screen{width:min(60%,12.5rem)!important}' +
      /* idle wheel: shrink the disc, its petals and the hub so it fits the panel */
      'body.role-device .device-wheel{width:min(46%,9rem)!important;border-width:.4rem!important;margin-top:1.6rem!important}' +
      'body.role-device .device-wheel-slot{height:6.2rem!important;width:1.1rem!important;left:calc(50% - .55rem)!important;border-radius:.5rem!important}' +
      'body.role-device .device-wheel-center{width:4.6rem!important;height:4.6rem!important;border-width:.2rem!important;font-size:.6rem!important}' +
      'body.role-device .device-wheel-center strong{font-size:1rem!important}' +
      'body.role-device .device-screen-heading h2{font-size:1.1rem!important}' +
      'body.role-device .device-screen-heading p{font-size:.72rem!important}' +
      'body.role-device .device-screen-legend{display:none!important}' +
      'body.role-device .device-dose-top{padding:.4rem!important}' +
      'body.role-device .device-dose-top strong{font-size:1rem!important}' +
      'body.role-device .device-dose-label{font-size:.58rem!important}' +
      'body.role-device .device-dose-top span:last-child{font-size:.64rem!important}' +
      /* keep the ℹ / ☎ glyphs inside the circular screen so nothing clips */
      'body.role-device .device-dose-action-icon{font-size:1.85rem!important}' +
      'body.role-device .device-dose-info .device-dose-action-icon{transform:translate(.5rem,-.9rem)!important}' +
      'body.role-device .device-call-hold .device-dose-action-icon{transform:translate(-.5rem,-.9rem)!important}' +
      'body.role-device .device-simple{padding:15% 19%!important;gap:.22rem!important}' +
      'body.role-device .ds-title{font-size:.95rem!important}' +
      'body.role-device .ds-line{font-size:.64rem!important;line-height:1.2!important}' +
      'body.role-device .ds-kicker{font-size:.5rem!important}' +
      'body.role-device .ds-btn{font-size:.62rem!important;padding:.3rem .7rem!important}' +
      'body.role-device .ds-cup{max-width:2.9rem!important}' +
      'body.role-device .ds-actions{gap:.3rem!important}' +
      /* John's phone is ultra-simplistic: NO bottom menus or tabs */
      'body.role-patient .mobile-bottom-nav{display:none!important}' +
      'body.role-patient #nav-patient-tabs{display:none!important}' +
      'body.role-patient .phone-content-area{padding-bottom:2rem!important}' +
      /* Caregiver retains full clinical tabs */
      'body.role-caregiver .mobile-bottom-nav{display:block!important;position:sticky!important;bottom:0!important;z-index:90}' +
      'body.role-caregiver .phone-content-area{padding-bottom:5rem!important;padding-left:.75rem!important;padding-right:.75rem!important;overflow-x:hidden!important}' +
      'body.role-caregiver .tab-page,body.role-caregiver .card,body.role-caregiver .cg-welcome-card{max-width:100%!important;overflow-x:hidden!important}' +
      'body.role-caregiver .cg-header-patient-chip,body.role-caregiver .compartments-container{flex-wrap:wrap!important}' +
      /* Full lockscreen display in demo console embed */
      '#phone-lockscreen:not(.hidden){display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:100%!important;z-index:99999!important;border-radius:0!important;overflow-y:auto!important;opacity:1!important;transform:none!important;pointer-events:auto!important}';
    d.head.appendChild(st);
  }
}

function prep(key) {
  stripChrome(key);
  try {
    const w = frames[key].contentWindow;
    w.__dosetteDemoSuppressSpeech = true;
    if (typeof w.switchRole === 'function') w.switchRole(ROLE_OF[key]);
    const d = frames[key].contentDocument;
    if (d && d.documentElement) d.documentElement.scrollTop = 0;
    const area = d && d.querySelector('.phone-content-area');
    if (area) area.scrollTop = 0;
  } catch (e) { /* noop */ }
}

/* schedule a couple of refreshes so the POST has time to land server-side */
let _nudgeTimers = [];
function cancelNudges() {
  _nudgeTimers.forEach((id) => window.clearTimeout(id));
  _nudgeTimers = [];
}
function nudge() {
  cancelNudges();
  _nudgeTimers.push(window.setTimeout(refreshAll, 300));
  _nudgeTimers.push(window.setTimeout(refreshAll, 1100));
}

/* pull fresh shared state into every embed and re-render */
function refreshAll() {
  Object.keys(frames).forEach((key) => {
    try {
      const w = frames[key].contentWindow;
      if (typeof w.loadInitialData === 'function') {
        Promise.resolve(w.loadInitialData()).then(() => {
          if (typeof w.renderLockscreenNotifications === 'function') w.renderLockscreenNotifications();
          if (typeof w.renderPatientSophieNote === 'function') w.renderPatientSophieNote();
        }).catch(() => {});
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
    if (w && d) {
      w.__dosetteDemoSuppressSpeech = true;
      fn(w, d);
    }
  } catch (e) { console.warn('[demo] embed call failed:', e); }
}

function focus(key) {
  ['a', 'd', 'e'].forEach((p) => document.querySelector('.panel-' + p).classList.remove('is-focus'));
  const map = { device: 'a', patient: 'd', caregiver: 'e' };
  const p = document.querySelector('.panel-' + map[key]);
  if (p) p.classList.add('is-focus');
}

function setNarr(kicker, head, note) {
  // Panel B (narration) was removed — keep this a safe no-op if it's absent.
  if (el('b-kicker')) el('b-kicker').textContent = kicker;
  if (el('b-headline')) el('b-headline').textContent = head;
  if (el('b-note')) el('b-note').textContent = note;
}

/* ---------- 3 scripted walkthroughs ---------- */
let demoTime = '15:00';                 // last simulated time the demo applied (15:00 = idle default)
let scannedMedId = null;                // med the caregiver last scanned in the loader flow

const WT = {
  load: {
    title: 'Caregiver scans & loads a medicine',
    steps: [
      {
        kicker: 'LOAD · 1', head: 'Sophie scans the medicine box',
        note: 'In the caregiver app the camera reads the barcode and confirms the medicine before it is loaded.',
        run() {
          scannedMedId = 'med_002';
          inWin('caregiver', (w, d) => {
            w.switchRole('CAREGIVER');
            w.activateTab('tab-cg-scan');
            const b = d.getElementById('btn-cg-scan-lipitor');
            if (b) b.click();
          });
          focus('caregiver');
        },
      },
      {
        kicker: 'LOAD · 2', head: 'Pick a compartment on the weekly wheel',
        note: 'In Sophie’s app, the 28-slot wheel mirrors the unit display — the slot at the bottom opening dispenses next. She taps a slot (or a time of day) and loads the scanned medicine into it.',
        run() {
          inWin('caregiver', (w, d) => {
            w.switchRole('CAREGIVER');
            w.activateTab('tab-cg-scan');
            const box = d.getElementById('sync-guidance-box');
            if (box) box.scrollIntoView({ block: 'center', behavior: 'smooth' });
          });
          nudge();
          focus('caregiver');
        },
      },
      {
        kicker: 'LOAD · 3', head: 'Loaded — the slot is armed for its time',
        note: 'The compartment now holds the medicine and will unlock at its scheduled time. Sophie can see it in the pillbox view.',
        run() {
          inWin('caregiver', (w) => { w.switchRole('CAREGIVER'); w.activateTab('tab-cg-pillbox'); });
          nudge();
          focus('caregiver');
        },
      },
    ],
  },

  dispense: {
    title: 'Dispensing & the cup camera check',
    steps: [
      {
        kicker: 'DISPENSE · 1', head: 'Dose time — the unit dispenses',
        voice: 'dispense_0',
        note: 'At 19:00 the compartment opens on its own — no confirmation, no lock. The unit shows the dose with two buttons: ℹ for a plain-language explanation, and ☎ to call the caregiver.',
        run() {
          applyTime('19:00');
          inWin('device', (w) => {
            w.switchRole('DEVICE');
            if (typeof w.showDeviceCup === 'function') w.showDeviceCup('dispensed');
          });
          inWin('patient', (w) => { w.switchRole('PATIENT'); w.activateTab('tab-patient-today'); });
          focus('device');
        },
      },
      {
        kicker: 'DISPENSE · 2', head: 'Camera: one tablet left over — unit warns',
        voice: 'dispense_1',
        note: 'John took all but one. The built-in camera spots the leftover tablet and the unit display warns him to take the last one.',
        run() {
          inWin('device', (w) => {
            w.switchRole('DEVICE');
            if (typeof w.showDeviceCup === 'function') w.showDeviceCup('one-left');
          });
          focus('device');
        },
      },
      {
        kicker: 'DISPENSE · 3', head: 'Camera: cup empty — all clear',
        voice: 'dispense_2',
        note: 'The camera confirms the cup is empty. The dose is logged as taken on time and a green confirmation lands in Sophie’s Care Inbox.',
        run() {
          inWin('device', (w) => {
            w.switchRole('DEVICE');
            if (typeof w.showDeviceCup === 'function') w.showDeviceCup('all-clear');
          });
          inWin('patient', (w) => {
            w.switchRole('PATIENT');
            w.activateTab('tab-patient-today');
            if (typeof w.openCompartmentAction === 'function') w.openCompartmentAction(3);
          });
          inWin('caregiver', (w) => { w.switchRole('CAREGIVER'); w.activateTab('tab-cg-inbox'); });
          nudge();
          focus('device');
          // re-assert the all-clear cup after the refresh settles
          setTimeout(() => inWin('device', (w) => {
            if (typeof w.showDeviceCup === 'function') w.showDeviceCup('all-clear');
          }), 1400);
        },
      },
    ],
  },

  missed: {
    title: 'A missed medication',
    steps: [
      {
        kicker: 'MISSED · 1', head: 'The evening dose is due',
        voice: 'missed_0',
        note: 'It is 19:00. The unit shows the dose and John’s phone prompts him — but he does not take it.',
        run() {
          applyTime('19:00');
          inWin('device', (w) => w.switchRole('DEVICE'));
          inWin('patient', (w) => { w.switchRole('PATIENT'); w.activateTab('tab-patient-today'); });
          nudge();
          focus('patient');
        },
      },
      {
        kicker: 'MISSED · 2', head: '10 minutes late — gentle reminder',
        voice: 'missed_1',
        note: 'At 19:10 John’s phone sends a calm reminder. No alarm yet, no message to Sophie.',
        run() {
          applyTime('19:10');
          inWin('patient', (w) => { w.switchRole('PATIENT'); w.activateTab('tab-patient-today'); });
          nudge();
          focus('patient');
        },
      },
      {
        kicker: 'MISSED · 3', head: '35 minutes late — Sophie is alerted',
        note: 'At 19:35 the unit LED blinks red and the caregiver app raises an alarm banner with a one-tap call to John.',
        run() {
          applyTime('19:35');
          inWin('caregiver', (w) => {
            w.switchRole('CAREGIVER');
            if (typeof w.triggerAlertAction === 'function') w.triggerAlertAction(3, false);
            w.activateTab('tab-cg-timeline');
          });
          nudge();
          focus('caregiver');
        },
      },
      {
        kicker: 'MISSED · 4', head: 'John takes it late',
        voice: 'missed_3',
        note: 'John finally opens the compartment. The alert clears and the intake is logged as late.',
        run() {
          inWin('patient', (w) => {
            w.switchRole('PATIENT');
            w.activateTab('tab-patient-today');
            if (typeof w.openCompartmentAction === 'function') w.openCompartmentAction(3);
          });
          inWin('caregiver', (w) => { w.switchRole('CAREGIVER'); w.activateTab('tab-cg-timeline'); });
          nudge();
          focus('caregiver');
        },
      },
    ],
  },
};

let activeWt = 'load';
let reached = -1;

function applyTime(t) {
  demoTime = t;
  ['patient', 'caregiver', 'device'].forEach((r) =>
    inWin(r, (w) => { if (typeof w.setSimulatedTime === 'function') w.setSimulatedTime(t, t === '19:35'); }));
  markTime(t);
}

/* highlight the active "Simulation time" button */
function markTime(t) {
  el('grp-time').querySelectorAll('[data-time]').forEach((b) => {
    b.classList.toggle('is-current', b.dataset.time === t);
  });
}

/* manual "Simulation time" control */
function setTime(t) {
  applyTime(t);
  nudge();
  clearDemoVoice();
}

/* which of the 4 "today" slots is dispensing next, from the demo clock */
function activeSlotForClock() {
  if (demoTime === '08:00') return 1;
  if (demoTime === '12:30') return 2;
  if (demoTime === '22:00') return 4;
  return 3;
}

/* ---------- walkthrough rendering ---------- */
function renderSteps() {
  const wt = WT[activeWt];
  el('wt-title').textContent = wt.title;

  const grid = el('wt-steps');
  grid.innerHTML = '';
  wt.steps.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'c-btn';
    btn.dataset.step = String(i);
    btn.textContent = `${i + 1} · ${s.head}`;
    btn.classList.toggle('is-done', i < reached);
    btn.classList.toggle('is-current', i === reached);
    grid.appendChild(btn);
  });

  const prog = el('b-progress');
  if (prog) {
    prog.innerHTML = '';
    for (let i = 0; i < wt.steps.length; i += 1) {
      const dot = document.createElement('i');
      if (i < reached) dot.className = 'done';
      if (i === reached) dot.className = 'current';
      prog.appendChild(dot);
    }
  }

  el('wt-tabs').querySelectorAll('.wt-tab').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.wt === activeWt);
  });
}

function runStep(i) {
  const step = WT[activeWt].steps[i];
  if (!step) return;
  reached = Math.max(reached, i);
  cancelNudges();           // drop any pending refresh from the previous step
  setNarr(step.kicker, step.head, step.note);
  step.run();
  if (step.voice) {
    playDemoVoice(step.voice);
  } else {
    clearDemoVoice();
  }
  renderSteps();
}

function setWalkthrough(key) {
  if (!WT[key]) return;
  activeWt = key;
  reached = -1;
  clearDemoVoice();
  // leaving a walkthrough: renderDeviceWheel() clears any full-screen takeover
  // (med-info / cup-camera) the unit was stuck on and redraws the normal screen
  inWin('device', (w) => {
    if (typeof w.renderDeviceWheel === 'function') w.renderDeviceWheel();
  });
  const wt = WT[key];
  setNarr('WALKTHROUGH', wt.title, 'Click the steps in order — each drives the real patient, caregiver and device apps on the right.');
  renderSteps();
}

async function resetDemo() {
  stopDemoVoice();
  try { await fetch('/api/reset', { method: 'POST' }); } catch (e) { /* noop */ }
  Object.keys(frames).forEach((key) => {
    try { frames[key].contentWindow.location.reload(); }
    catch (e) { frames[key].src = 'index.html'; }
  });
  reached = -1;
  scannedMedId = null;
  demoTime = '15:00';
  markTime('15:00');
  setWalkthrough(activeWt);
  ['a', 'd', 'e'].forEach((p) => document.querySelector('.panel-' + p).classList.remove('is-focus'));
  updateLockUi();
}

/* ---------- Lockscreen Integration ---------- */
function isPhoneLocked(key) {
  try {
    const w = frames[key]?.contentWindow;
    return typeof w?.isLocked === 'function' ? w.isLocked() : false;
  } catch (e) {
    return false;
  }
}

function updateLockUi() {
  const pLocked = isPhoneLocked('patient');
  const cgLocked = isPhoneLocked('caregiver');

  const btnP = el('btn-lock-patient');
  if (btnP) {
    btnP.classList.toggle('is-locked', pLocked);
    btnP.innerHTML = pLocked
      ? '<span class="lock-icon">🔓</span> <span class="lock-text">Unlock Phone</span>'
      : '<span class="lock-icon">🔒</span> <span class="lock-text">Lockscreen</span>';
  }

  const btnCg = el('btn-lock-caregiver');
  if (btnCg) {
    btnCg.classList.toggle('is-locked', cgLocked);
    btnCg.innerHTML = cgLocked
      ? '<span class="lock-icon">🔓</span> <span class="lock-text">Unlock Phone</span>'
      : '<span class="lock-icon">🔒</span> <span class="lock-text">Lockscreen</span>';
  }

  const ctlP = el('btn-ctl-lock-patient');
  if (ctlP) {
    ctlP.classList.toggle('is-current', pLocked);
    ctlP.textContent = pLocked ? "🔓 Unlock John's phone" : "🔒 Lock John's phone (view push notifications)";
  }

  const ctlCg = el('btn-ctl-lock-cg');
  if (ctlCg) {
    ctlCg.classList.toggle('is-current', cgLocked);
    ctlCg.textContent = cgLocked ? "🔓 Unlock Sophie's phone" : "🔒 Lock Sophie's phone (view alerts)";
  }
}

function togglePhoneLock(key) {
  inWin(key, (w) => {
    if (typeof w.toggleLockscreen === 'function') {
      w.toggleLockscreen();
    }
  });
  focus(key);
  setTimeout(updateLockUi, 100);

  setTimeout(() => {
    const lockedNow = isPhoneLocked(key);
    if (lockedNow) {
      if (key === 'patient') {
        setNarr('LOCKSCREEN', "John's smartphone lockscreen",
          "Push notifications appear on John's lockscreen for the simulated time. Tap any notification card or the unlock button to enter the app.");
      } else {
        setNarr('LOCKSCREEN', "Sophie's caregiver lockscreen",
          "Sophie receives real-time telemetry notifications, dose confirmations, and urgent alerts directly on her smartphone lockscreen.");
      }
    }
  }, 150);
}

function unlockAllPhones() {
  ['patient', 'caregiver'].forEach((key) => {
    inWin(key, (w) => {
      if (typeof w.unlockPhone === 'function') w.unlockPhone();
    });
  });
  setTimeout(updateLockUi, 100);
}

/* ---------- wiring ---------- */
el('wt-tabs').addEventListener('click', (e) => {
  const t = e.target.closest('.wt-tab');
  if (t) setWalkthrough(t.dataset.wt);
});
el('wt-steps').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-step]');
  if (btn) runStep(Number(btn.dataset.step));
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

/* Lockscreen controls wiring */
el('btn-lock-patient')?.addEventListener('click', () => togglePhoneLock('patient'));
el('btn-lock-caregiver')?.addEventListener('click', () => togglePhoneLock('caregiver'));
el('btn-ctl-lock-patient')?.addEventListener('click', () => togglePhoneLock('patient'));
el('btn-ctl-lock-cg')?.addEventListener('click', () => togglePhoneLock('caregiver'));
el('btn-ctl-unlock-all')?.addEventListener('click', unlockAllPhones);
el('btn-demo-voice-toggle')?.addEventListener('click', () => {
  demoVoiceEnabled = !demoVoiceEnabled;
  if (!demoVoiceEnabled) stopDemoVoice();
  updateVoiceControls();
});
el('btn-demo-voice-replay')?.addEventListener('click', () => {
  if (currentVoiceKey) playDemoVoice(currentVoiceKey, { force: true });
});

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'phone-lock-changed') {
    updateLockUi();
  }
  if (e.data && (e.data.type === 'refresh_all' || e.data.type === 'new_message_sent')) {
    refreshAll();
    setTimeout(refreshAll, 400);
  }
});

// Sync lock state on iframe load and time changes
setInterval(updateLockUi, 1000);

el('btn-reset').addEventListener('click', resetDemo);

document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== ' ') return;
  if (document.activeElement && /^(INPUT|BUTTON|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  e.preventDefault();
  runStep(Math.min(reached + 1, WT[activeWt].steps.length - 1));
});

setWalkthrough('load');
updateLockUi();
updateVoiceControls();
markTime('15:00');   /* embeds boot at 15:00 (afternoon — unit idle, nothing due) */
