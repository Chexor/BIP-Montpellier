/**
 * DOSETTE Smart Pillbox & AI Companion Client Application
 * Multi-Role UI (Patient & Caregiver), Realistic Smartphone Lockscreen with Role-Specific Push Notifications,
 * Time-Locked Compartment Safety Logic, Progressive Multi-Stage Reminders, and Multi-Day Patient Schedule.
 */

// Application State
const state = {
  currentRole: 'PATIENT', // 'PATIENT' | 'CAREGIVER' | 'DEVICE'
  activeTab: 'tab-patient-today',
  layoutMode: 'mobile-phone', // 'mobile-phone' | 'desktop-split'
  seniorMode: false,
  isLocked: false,
  simulatedTime: '15:00', // '15:00' (idle) | '08:00' | '12:30' | '19:00' | '19:10' | '19:35'

  pillbox: null,
  schedule: null,
  medications: [],
  messages: [],
  currentScan: null,
  isSpeaking: false,
  pocketAudio: null,
  isPocketTtsPlaying: false,
  webcamStream: null,
  deviceDosePreview: false,
  deviceDosePreviewTimer: null,
  deviceTakeover: null,      // 'info' | 'one-left' | 'all-clear' while a full-screen unit view is up
  _devicePanelKey: null,     // 'wheel' | 'dose' — last panel shown, gates the pop-in animation
};

// Apache and Live Preview serve the UI separately from the Node API.
const apiOrigin = ['3000', '3001'].includes(window.location.port) ? '' : 'http://localhost:3001';
const apiUrl = (path) => `${apiOrigin}${path}`;

// DOM Cache
const dom = {
  // Header & Persona Controls
  headerSubtitle: document.getElementById('header-persona-subtitle'),
  btnRolePatient: document.getElementById('btn-role-patient'),
  btnRoleCaregiver: document.getElementById('btn-role-caregiver'),
  btnRoleDevice: document.getElementById('btn-role-device'),
  btnToggleLockscreen: document.getElementById('btn-toggle-lockscreen'),
  lockBtnLabel: document.getElementById('lock-btn-label'),
  btnToggleLayout: document.getElementById('btn-toggle-layout'),
  layoutLabel: document.getElementById('layout-label'),
  btnSeniorMode: document.getElementById('btn-senior-mode'),

  // Time-Skip Simulator Bar
  simulatedTimeDisplay: document.getElementById('simulated-time-display'),
  btnTs0800: document.getElementById('btn-ts-0800'),
  btnTs1230: document.getElementById('btn-ts-1230'),
  btnTs1900: document.getElementById('btn-ts-1900'),
  btnTs1910: document.getElementById('btn-ts-1910'),
  btnTs1935: document.getElementById('btn-ts-1935'),
  btnTsPlus30: document.getElementById('btn-ts-plus30'),
  btnResetData: document.getElementById('btn-reset-data'),

  // Pitch Flow
  pitchStep1: document.getElementById('pitch-step-1'),
  pitchStep2: document.getElementById('pitch-step-2'),
  pitchStep3: document.getElementById('pitch-step-3'),
  pitchStep4: document.getElementById('pitch-step-4'),
  pitchStepAlert: document.getElementById('pitch-step-alert'),

  // Viewport & Smartphone Frame
  viewportWrapper: document.getElementById('viewport-wrapper'),
  smartphoneFrame: document.getElementById('smartphone-frame'),
  phoneContentArea: document.getElementById('phone-content-area'),
  phoneClock: document.getElementById('phone-clock'),
  phoneBattery: document.getElementById('phone-battery'),

  // Lockscreen Elements
  phoneLockscreen: document.getElementById('phone-lockscreen'),
  lockscreenOwnerBadge: document.getElementById('lockscreen-owner-badge'),
  lockscreenClock: document.getElementById('lockscreen-clock'),
  lockscreenDate: document.getElementById('lockscreen-date'),
  lockscreenNotificationsList: document.getElementById('lockscreen-notifications-list'),
  btnUnlockPhone: document.getElementById('btn-unlock-phone'),

  // Views & Navigation
  roleViewPatient: document.getElementById('role-view-patient'),
  roleViewCaregiver: document.getElementById('role-view-caregiver'),
  roleViewDevice: document.getElementById('role-view-device'),
  navPatientTabs: document.getElementById('nav-patient-tabs'),
  navCaregiverTabs: document.getElementById('nav-caregiver-tabs'),
  deviceWheel: document.getElementById('device-wheel'),
  deviceWheelTime: document.getElementById('device-wheel-time'),
  deviceWheelCurrent: document.getElementById('device-wheel-current'),
  deviceScreenStatus: document.getElementById('device-screen-status'),
  deviceDoseScreen: document.getElementById('device-dose-screen'),

  // Badges
  patientUnreadBadge: document.getElementById('patient-unread-badge'),
  cgUnreadBadge: document.getElementById('cg-unread-badge'),
  patientInboxBadgeLabel: document.getElementById('patient-inbox-badge-label'),

  // Patient Today View & Spotlight Dose
  patientWelcomeGreeting: document.querySelector('.pwc-greeting'),
  patientBatteryBadge: document.getElementById('patient-battery-badge'),
  patientCompartmentsList: document.getElementById('patient-compartments-list'),
  patientCurrentSlot: document.getElementById('patient-current-slot'),
  patientNextDoseCard: document.getElementById('patient-next-dose-card'),
  spotlightStatusTag: document.getElementById('spotlight-status-tag'),
  spotlightTimeText: document.getElementById('spotlight-time-text'),
  spotlightMedName: document.getElementById('spotlight-med-name'),
  spotlightInstructionText: document.getElementById('spotlight-instruction-text'),
  spotlightHintBox: document.getElementById('spotlight-hint-box'),
  btnSpotlightOpen: document.getElementById('btn-spotlight-open'),

  // Patient Schedule Tab Elements
  todayScheduleBadge: document.getElementById('today-schedule-badge'),
  schedSlotMorning: document.getElementById('sched-slot-morning'),
  schedCheckMorning: document.getElementById('sched-check-morning'),
  schedSlotEvening: document.getElementById('sched-slot-evening'),
  schedCheckEvening: document.getElementById('sched-check-evening'),

  // Navigation Shortcuts
  btnPatientGotoSchedule: document.getElementById('btn-patient-goto-schedule'),
  btnPatientGotoScan: document.getElementById('btn-patient-goto-scan'),
  btnPatientGotoInbox: document.getElementById('btn-patient-goto-inbox'),
  btnCgGotoScan: document.getElementById('btn-cg-goto-scan'),
  btnPatientScheduleBack: document.getElementById('btn-patient-schedule-back'),
  btnPatientInboxBack: document.getElementById('btn-patient-inbox-back'),
  btnPatientHelpBack: document.getElementById('btn-patient-help-back'),
  btnPatientInboxLock: document.getElementById('btn-patient-inbox-lock'),

  // Scanner & AI Explanation Card
  scannerLaser: document.getElementById('scanner-laser'),
  scannerTargetBox: document.getElementById('scanner-target-box'),
  scannerLiveBadge: document.getElementById('scanner-live-badge'),
  webcamVideo: document.getElementById('webcam-video'),
  btnCameraSnap: document.getElementById('btn-camera-snap'),
  btnScanDafalgan: document.getElementById('btn-scan-dafalgan'),
  btnScanLipitor: document.getElementById('btn-scan-lipitor'),
  btnScanAsaflow: document.getElementById('btn-scan-asaflow'),
  btnScanAmoxicillin: document.getElementById('btn-scan-amoxicillin'),
  inputScanImage: document.getElementById('input-scan-image'),
  inputBarcode: document.getElementById('input-barcode'),
  btnCustomScan: document.getElementById('btn-custom-scan'),
  btnToggleCamera: document.getElementById('btn-toggle-camera'),

  aiResultCard: document.getElementById('ai-result-card'),
  medDot: document.getElementById('med-dot'),
  medBrandName: document.getElementById('med-brand-name'),
  medGenericName: document.getElementById('med-generic-name'),
  medSummary: document.getElementById('med-summary'),
  medInstructions: document.getElementById('med-instructions'),
  medWarnings: document.getElementById('med-warnings'),
  btnPocketTts: document.getElementById('btn-pocket-tts'),
  pocketTtsBtnLabel: document.getElementById('pocket-tts-btn-label'),
  btnSpeech: document.getElementById('btn-speech'),
  speechBtnLabel: document.getElementById('speech-btn-label'),
  guidanceText: document.getElementById('guidance-text'),
  selectTargetCompartment: document.getElementById('select-target-compartment'),

  // Patient Inbox & Emergency Contacts
  patientInboxList: document.getElementById('patient-inbox-list'),
  btnPatientCallSophie: document.getElementById('btn-patient-call-sophie'),
  btnPatientCallDoctor: document.getElementById('btn-patient-call-doctor'),
  btnPatientCallPharmacy: document.getElementById('btn-patient-call-pharmacy'),
  btnPatientCall112: document.getElementById('btn-patient-call-112'),
  btnPatientDirectSophie: document.getElementById('btn-patient-direct-sophie'),
  btnPatientDirectDoctor: document.getElementById('btn-patient-direct-doctor'),
  btnPatientDirect112: document.getElementById('btn-patient-direct-112'),

  // Caregiver Elements
  caregiverAlertBanner: document.getElementById('caregiver-alert-banner'),
  alertMessage: document.getElementById('alert-message'),
  btnCallPatient: document.getElementById('btn-call-patient'),
  btnDismissAlert: document.getElementById('btn-dismiss-alert'),
  logsTimeline: document.getElementById('logs-timeline'),
  caregiverCompartmentsList: document.getElementById('caregiver-compartments-list'),
  cgSummaryTableWrap: document.getElementById('cg-summary-table-wrap'),
  cgLastSyncTime: document.getElementById('cg-last-sync-time'),
  btnCliOpen1: document.getElementById('btn-cli-open-1'),
  btnCliOpen3: document.getElementById('btn-cli-open-3'),
  btnCliTriggerAlert: document.getElementById('btn-cli-trigger-alert'),

  // Caregiver Messaging Form
  inputCgMessage: document.getElementById('input-cg-message'),
  btnSendMessageToPatient: document.getElementById('btn-send-message-to-patient'),
  caregiverInboxList: document.getElementById('caregiver-inbox-list'),

  // Caregiver Scanner & AI Explanation
  btnCgScanDafalgan: document.getElementById('btn-cg-scan-dafalgan'),
  btnCgScanLipitor: document.getElementById('btn-cg-scan-lipitor'),
  inputCgBarcode: document.getElementById('input-cg-barcode'),
  btnCgCustomScan: document.getElementById('btn-cg-custom-scan'),
  cgScanResult: document.getElementById('cg-scan-result'),
  cgScanDot: document.getElementById('cg-scan-dot'),
  cgScanName: document.getElementById('cg-scan-name'),
  cgScanGeneric: document.getElementById('cg-scan-generic'),
  cgScanSummary: document.getElementById('cg-scan-summary'),
  cgScanInstructions: document.getElementById('cg-scan-instructions'),
  cgScanWarnings: document.getElementById('cg-scan-warnings'),
  cgScanAssign: document.getElementById('cg-scan-assign'),
  btnCgScanLoad: document.getElementById('btn-cg-scan-load'),
  btnCgScanSpeak: document.getElementById('btn-cg-scan-speak'),

  // Caregiver "choose a compartment" wheel (28-slot weekly organiser)
  cgLoaderSlots: document.getElementById('cg-loader-slots'),
  cgLoaderHubNum: document.getElementById('cg-loader-hub-num'),
  cgLoaderHubLabel: document.getElementById('cg-loader-hub-label'),
  cgLoaderPeriods: document.getElementById('cg-loader-periods'),
  btnCgLoaderLoad: document.getElementById('btn-cg-loader-load'),

  // Terminal modal & toast container
  btnOpenTerminalHint: document.getElementById('btn-open-terminal-hint'),
  terminalModal: document.getElementById('terminal-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnModalOk: document.getElementById('btn-modal-ok'),
  toastContainer: document.getElementById('toast-container'),
};

// ===================================================================
// INITIALIZATION
// ===================================================================

document.addEventListener('DOMContentLoaded', async () => {
  initClock();
  initSeniorMode();
  setupEventListeners();
  initSSE();
  await loadInitialData();

  // Initialize simulated time at 15:00 (afternoon — no dose due, unit idle)
  setSimulatedTime('15:00', false);

  // Set default scan preview
  if (state.medications.length > 0) {
    displayMedicationExplanation(state.medications[0]);
  }
});

function initClock() {
  const now = new Date();
  if (dom.lockscreenDate) {
    dom.lockscreenDate.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
  updateClocks(state.simulatedTime);
}

function updateClocks(timeStr) {
  if (dom.phoneClock) dom.phoneClock.textContent = timeStr;
  if (dom.lockscreenClock) dom.lockscreenClock.textContent = timeStr;
  if (dom.simulatedTimeDisplay) dom.simulatedTimeDisplay.textContent = timeStr;
}

function initSeniorMode() {
  const saved = localStorage.getItem('dosette_senior_mode');
  if (saved === 'true') {
    state.seniorMode = true;
    document.body.classList.add('senior-mode');
  }
}

// ===================================================================
// LOCKSCREEN CONTROLS
// ===================================================================

function lockPhone() {
  state.isLocked = true;
  dom.phoneLockscreen.classList.remove('hidden');
  dom.btnToggleLockscreen.classList.add('active-locked');
  dom.lockBtnLabel.textContent = 'Unlock Phone';
  renderLockscreenNotifications();
  showToast(
    state.currentRole === 'PATIENT'
      ? "🔒 John's smartphone locked. Patient medication reminders visible."
      : "🔒 Sophie's smartphone locked. Caregiver telemetry & alert notifications visible.",
    'info'
  );
  window.dispatchEvent(new CustomEvent('phone-lock-changed', { detail: { locked: true, role: state.currentRole } }));
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'phone-lock-changed', role: state.currentRole, locked: true }, '*');
    }
  } catch (e) { /* noop */ }
}

function unlockPhone() {
  state.isLocked = false;
  dom.phoneLockscreen.classList.add('hidden');
  dom.btnToggleLockscreen.classList.remove('active-locked');
  dom.lockBtnLabel.textContent = 'Lock Phone';
  showToast('🔓 Smartphone unlocked.', 'info');
  window.dispatchEvent(new CustomEvent('phone-lock-changed', { detail: { locked: false, role: state.currentRole } }));
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'phone-lock-changed', role: state.currentRole, locked: false }, '*');
    }
  } catch (e) { /* noop */ }
}

function toggleLockscreen() {
  if (state.isLocked) {
    unlockPhone();
  } else {
    lockPhone();
  }
}

// ===================================================================
// TIME-SKIP SIMULATOR
// ===================================================================

function setSimulatedTime(timeStr, shouldAnnounce = true) {
  state.simulatedTime = timeStr;
  updateClocks(timeStr);

  // Highlight active button in time simulator bar
  document.querySelectorAll('.ts-btn').forEach((b) => b.classList.remove('active-time'));
  if (timeStr === '08:00' && dom.btnTs0800) dom.btnTs0800.classList.add('active-time');
  else if (timeStr === '12:30' && dom.btnTs1230) dom.btnTs1230.classList.add('active-time');
  else if (timeStr === '19:00' && dom.btnTs1900) dom.btnTs1900.classList.add('active-time');
  else if (timeStr === '19:10' && dom.btnTs1910) dom.btnTs1910.classList.add('active-time');
  else if (timeStr === '19:35' && dom.btnTs1935) dom.btnTs1935.classList.add('active-time');

  // Trigger alert action if 19:35
  if (timeStr === '19:35') {
    triggerAlertAction(3, false);
  }

  // Toast / speech notifications on time change
  if (shouldAnnounce) {
    if (timeStr === '08:00') {
      showToast('⏰ Time set to 08:00 (Morning). Dafalgan 1g is due in Compartment 1.', 'info');
      if (state.currentRole === 'PATIENT') {
        speakText('Good morning John. It is 8:00 AM. Time for your morning medication: Dafalgan 1 gram.');
      }
    } else if (timeStr === '12:30') {
      showToast('🌤️ Time set to 12:30 (Lunch). No medication due right now.', 'info');
      if (state.currentRole === 'PATIENT') {
        speakText('Good afternoon John. It is 12:30 PM. No medications are scheduled for lunch.');
      }
    } else if (timeStr === '19:00') {
      showToast('🌙 Time set to 19:00 (Evening). Lipitor 20mg is due in Compartment 3.', 'info');
      if (state.currentRole === 'PATIENT') {
        speakText('Good evening John. It is 7:00 PM. Time for your evening medication: Lipitor 20 milligrams.');
      }
    } else if (timeStr === '19:10') {
      showToast('⏰ Time set to 19:10 (+10m reminder). Friendly notification sent, no alarm.', 'info');
      if (state.currentRole === 'PATIENT') {
        speakText('Hi John, gentle reminder: your evening medication Lipitor is ready in Compartment 3. Take your time.');
      }
    } else if (timeStr === '19:35') {
      showToast('🚨 Missed dose simulated! >30 min delay -> Compartment 3 LED flashing red!', 'alert');
      if (state.currentRole === 'PATIENT') {
        speakText('Warning John! You have not taken your evening medication Lipitor. Compartment 3 is flashing red.');
      }
    }
  }

  renderAll();
}

function advanceTimeBy30Minutes() {
  const parts = state.simulatedTime.split(':');
  let hours = parseInt(parts[0], 10);
  let minutes = parseInt(parts[1], 10) + 30;

  if (minutes >= 60) {
    hours = (hours + 1) % 24;
    minutes = minutes % 60;
  }

  const newTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  if (hours === 19 && minutes >= 30) {
    setSimulatedTime('19:35', true);
  } else {
    setSimulatedTime(newTimeStr, true);
  }
}

// ===================================================================
// REACTIVE SPOTLIGHT CARD (PATIENT NEXT DOSE)
// ===================================================================

function renderSpotlightCard() {
  if (!dom.patientNextDoseCard || !state.pillbox || !state.pillbox.compartments) return;

  const comp1 = state.pillbox.compartments.find((c) => c.compartment_index === 1);
  const comp3 = state.pillbox.compartments.find((c) => c.compartment_index === 3);

  dom.patientNextDoseCard.classList.remove('completed-spotlight', 'alert-spotlight');

  // The patient does not press a button to take a dose — the unit dispenses on its own.
  if (dom.btnSpotlightOpen) dom.btnSpotlightOpen.style.display = 'none';

  // Case 1: 08:00 Morning
  if (state.simulatedTime === '08:00') {
    if (comp1 && comp1.state === 'FILLED') {
      dom.spotlightStatusTag.textContent = '☀️ MORNING DOSE DUE';
      dom.spotlightTimeText.textContent = '08:00 (Morning)';
      dom.spotlightMedName.textContent = 'Dafalgan 1g (1000mg)';
      dom.spotlightInstructionText.textContent = 'Take 1 effervescent tablet with a large glass of water for chronic joint pain.';
      dom.spotlightHintBox.innerHTML = '👉 Ready in <strong>Compartment 1 (Morning)</strong>. Compartment 3 opens at 19:00.';
      dom.btnSpotlightOpen.textContent = '🔓 Take Dafalgan 1g (Open Compartment 1)';
      dom.btnSpotlightOpen.disabled = false;
      dom.btnSpotlightOpen.className = 'action-btn btn-primary';
      dom.btnSpotlightOpen.onclick = async () => {
        await openCompartmentAction(1);
        speakText('Intake confirmed! You took Dafalgan 1 gram with water.');
      };
    } else {
      // Comp 1 has been taken
      dom.patientNextDoseCard.classList.add('completed-spotlight');
      dom.spotlightStatusTag.textContent = '✔ MORNING DOSE TAKEN';
      dom.spotlightTimeText.textContent = 'Taken at 08:00';
      dom.spotlightMedName.textContent = 'Dafalgan 1g (Taken ✔)';
      dom.spotlightInstructionText.textContent = 'Well done John! Morning dose completed. Next dose is Lipitor 20mg at 19:00 (Evening).';
      dom.spotlightHintBox.innerHTML = '✨ Compartment 1 emptied. Smart pillbox lid is closed.';
      dom.btnSpotlightOpen.textContent = '✔ Morning Dose Taken (08:00)';
      dom.btnSpotlightOpen.disabled = true;
      dom.btnSpotlightOpen.className = 'action-btn btn-completed';
    }
    return;
  }

  // Case 2: 12:30 Lunch
  if (state.simulatedTime === '12:30') {
    dom.spotlightStatusTag.textContent = '🌤️ ALL CAUGHT UP';
    dom.spotlightTimeText.textContent = '12:30 (Lunch)';
    dom.spotlightMedName.textContent = 'No Medication Due at Lunch';
    dom.spotlightInstructionText.textContent = 'Enjoy your lunch! Your next scheduled dose is Lipitor 20mg at 19:00 (Evening).';
    dom.spotlightHintBox.innerHTML = '👉 <strong>Compartment 2 (Noon)</strong> is empty. Compartment 3 opens at 19:00.';
    dom.btnSpotlightOpen.textContent = '⏳ Compartment 3 opens at 19:00';
    dom.btnSpotlightOpen.disabled = true;
    dom.btnSpotlightOpen.className = 'action-btn btn-locked-disabled';
    return;
  }

  // Case 2b: 15:00 Afternoon — nothing scheduled, unit idle
  if (state.simulatedTime === '15:00') {
    dom.spotlightStatusTag.textContent = '🛋️ NOTHING DUE RIGHT NOW';
    dom.spotlightTimeText.textContent = '15:00 (Afternoon)';
    dom.spotlightMedName.textContent = 'No Medication Due';
    dom.spotlightInstructionText.textContent = 'Nothing to take this afternoon. Your next scheduled dose is Lipitor 20mg at 19:00 (Evening).';
    dom.spotlightHintBox.innerHTML = '👉 The pillbox is resting. <strong>Compartment 3</strong> opens at 19:00.';
    dom.btnSpotlightOpen.textContent = '⏳ Compartment 3 opens at 19:00';
    dom.btnSpotlightOpen.disabled = true;
    dom.btnSpotlightOpen.className = 'action-btn btn-locked-disabled';
    return;
  }

  // Case 3: 19:00, 19:10, 19:35 Evening
  const eMeds = compMeds(comp3);
  const eName = eMeds.length > 1 ? `${eMeds.length} evening tablets` : (eMeds[0]?.brand_name || 'Evening dose');
  const eList = eMeds.length > 1
    ? `Take all ${eMeds.length} tablets with a glass of water after dinner: ${eMeds.map((m) => m.brand_name).join(', ')}.`
    : 'Take 1 tablet with a glass of water after dinner.';
  if (comp3 && comp3.state === 'FILLED') {
    if (state.simulatedTime === '19:35') {
      dom.patientNextDoseCard.classList.add('alert-spotlight');
      dom.spotlightStatusTag.textContent = '🚨 OVERDUE (>30 MIN LATE)';
      dom.spotlightTimeText.textContent = '19:35 (Scheduled 19:00)';
      dom.spotlightMedName.textContent = `${eName} (OVERDUE)`;
      dom.spotlightInstructionText.textContent = 'Your evening dose is 35 minutes late! Sophie has been notified. Please open compartment 3 now.';
      dom.spotlightHintBox.innerHTML = '🔴 <strong>Compartment 3 LED is blinking RED</strong>. Open to confirm intake.';
      dom.btnSpotlightOpen.textContent = '🚨 Take Overdue Dose (Open Compartment 3)';
      dom.btnSpotlightOpen.disabled = false;
      dom.btnSpotlightOpen.className = 'action-btn btn-primary alert-spotlight-btn';
    } else if (state.simulatedTime === '19:10') {
      dom.spotlightStatusTag.textContent = '⏰ 10M GENTLE REMINDER';
      dom.spotlightTimeText.textContent = '19:10 (Scheduled 19:00)';
      dom.spotlightMedName.textContent = `${eName} (Waiting)`;
      dom.spotlightInstructionText.textContent = 'A friendly reminder: 5–10 minutes late is completely fine. Compartment 3 is waiting.';
      dom.spotlightHintBox.innerHTML = '🟢 <strong>Compartment 3 is glowing green</strong>. Take your time with a glass of water.';
      dom.btnSpotlightOpen.textContent = `🔓 Take ${eName} (Open Compartment 3)`;
      dom.btnSpotlightOpen.disabled = false;
      dom.btnSpotlightOpen.className = 'action-btn btn-primary';
    } else {
      dom.spotlightStatusTag.textContent = '🌙 SCHEDULED DOSE DUE';
      dom.spotlightTimeText.textContent = '19:00 (Evening)';
      dom.spotlightMedName.textContent = eName;
      dom.spotlightInstructionText.textContent = eList;
      dom.spotlightHintBox.innerHTML = '👉 Ready in <strong>Compartment 3 (Evening)</strong> of your pillbox.';
      dom.btnSpotlightOpen.textContent = `🔓 Take ${eName} (Open Compartment 3)`;
      dom.btnSpotlightOpen.disabled = false;
      dom.btnSpotlightOpen.className = 'action-btn btn-primary';
    }

    dom.btnSpotlightOpen.onclick = async () => {
      await openCompartmentAction(3);
      speakText('Intake confirmed. Have a good evening John.');
    };
  } else if (comp3 && comp3.state === 'TAKEN') {
    // Only show "taken" once the dose has actually been dispensed/taken.
    dom.patientNextDoseCard.classList.add('completed-spotlight');
    dom.spotlightStatusTag.textContent = '🎉 ALL DOSES COMPLETED FOR TODAY';
    dom.spotlightTimeText.textContent = `Taken at ${state.simulatedTime}`;
    dom.spotlightMedName.textContent = 'Evening dose (Taken ✔)';
    dom.spotlightInstructionText.textContent = 'Great job John! All your medications for today have been taken on schedule.';
    dom.spotlightHintBox.innerHTML = '✨ Compartment 3 emptied. No more doses scheduled tonight. Sleep well! 🌙';
    dom.btnSpotlightOpen.textContent = '✔ Evening Dose Taken (Compartment 3)';
    dom.btnSpotlightOpen.disabled = true;
    dom.btnSpotlightOpen.className = 'action-btn btn-completed';
  } else {
    // Comp 3 is empty — nothing loaded for this evening, so nothing to take yet.
    dom.spotlightStatusTag.textContent = '🌙 NO EVENING DOSE LOADED';
    dom.spotlightTimeText.textContent = `${state.simulatedTime} (Evening)`;
    dom.spotlightMedName.textContent = 'No Medication Due';
    dom.spotlightInstructionText.textContent = 'Compartment 3 has not been loaded, so there is no evening dose to take right now.';
    dom.spotlightHintBox.innerHTML = '👉 <strong>Compartment 3 (Evening)</strong> is empty. Your caregiver loads it before the dose is due.';
    dom.btnSpotlightOpen.textContent = '— No evening dose loaded';
    dom.btnSpotlightOpen.disabled = true;
    dom.btnSpotlightOpen.className = 'action-btn btn-locked-disabled';
  }
}

// ===================================================================
// ROLE-SPECIFIC NOTIFICATIONS (John vs. Sophie)
// ===================================================================

function getRoleNotifications(role, timeStr) {
  const comp3 = state.pillbox?.compartments?.find((c) => c.compartment_index === 3);
  const isComp3Taken = comp3 && comp3.state === 'TAKEN';

  if (role === 'PATIENT') {
    if (isComp3Taken && (timeStr === '19:00' || timeStr === '19:10' || timeStr === '19:35')) {
      return [
        {
          id: 'notif-p-taken',
          app: '✅ Dosette Pillbox',
          title: 'Evening Dose Completed',
          body: 'You took your Lipitor 20mg on time. All doses are completed for today!',
          time: timeStr,
          urgent: false,
          targetTab: 'tab-patient-today',
        },
      ];
    }

    if (timeStr === '08:00') {
      return [
        {
          id: 'notif-p-0800',
          app: '💊 Dosette Pillbox',
          title: 'Morning Dose: Dafalgan 1g',
          body: 'Good morning John! Time for your morning dose (08:00). Compartment 1 is unlocked and glowing green.',
          time: '08:00 AM',
          urgent: false,
          targetTab: 'tab-patient-today',
          compIndex: 1,
        },
      ];
    } else if (timeStr === '12:30') {
      return [
        {
          id: 'notif-p-1230',
          app: '💊 Dosette Pillbox',
          title: 'Lunch Status: All Caught Up',
          body: 'No medication scheduled for lunch. Enjoy your meal! Next dose at 19:00.',
          time: '12:30 PM',
          urgent: false,
          targetTab: 'tab-patient-today',
        },
      ];
    } else if (timeStr === '19:00') {
      return [
        {
          id: 'notif-p-1900',
          app: '💊 Dosette Pillbox',
          title: 'Evening Dose: Lipitor 20mg',
          body: 'Time for your evening dose (19:00). Compartment 3 is illuminated and ready for you.',
          time: '7:00 PM',
          urgent: false,
          targetTab: 'tab-patient-today',
          compIndex: 3,
        },
      ];
    } else if (timeStr === '19:10') {
      return [
        {
          id: 'notif-p-1910',
          app: '💊 Dosette Pillbox',
          title: 'Friendly Reminder: Lipitor 20mg',
          body: 'A few minutes late is completely normal. Compartment 3 is glowing green when you are ready.',
          time: '7:10 PM',
          urgent: false,
          targetTab: 'tab-patient-today',
          compIndex: 3,
        },
        {
          id: 'notif-p-msg',
          app: '💬 Sophie (Caregiver)',
          title: 'Sophie Dupont',
          body: 'Hi John! Just checking in after dinner. Did you remember your Lipitor? ❤️',
          time: '7:11 PM',
          urgent: false,
          targetTab: 'tab-patient-inbox',
        },
      ];
    } else if (timeStr === '19:35') {
      return [
        {
          id: 'notif-p-1935',
          app: '🚨 DOSETTE ALERT',
          title: 'URGENT: Missed Dose (Lipitor 20mg)',
          body: 'Evening dose is 35m overdue! Compartment 3 LED is blinking red. Tap to take medication.',
          time: '7:35 PM',
          urgent: true,
          targetTab: 'tab-patient-today',
          compIndex: 3,
        },
        {
          id: 'notif-p-msg-urgent',
          app: '💬 Sophie (Caregiver)',
          title: 'Urgent Message from Sophie',
          body: 'John, I got an alert on my phone that you missed your 19:00 Lipitor. Are you okay? Call me if needed!',
          time: '7:36 PM',
          urgent: true,
          targetTab: 'tab-patient-inbox',
        },
      ];
    }
  } else {
    // Caregiver (Sophie) receives telemetry confirmations, compliance metrics, and escalation alerts
    if (isComp3Taken && (timeStr === '19:00' || timeStr === '19:10' || timeStr === '19:35')) {
      return [
        {
          id: 'notif-cg-taken',
          app: '✅ Adherence Confirmed',
          title: 'Intake Confirmed: John Dupont',
          body: `John took Lipitor 20mg at ${timeStr} successfully. Daily compliance: 100%.`,
          time: timeStr,
          urgent: false,
          targetTab: 'tab-cg-timeline',
        },
      ];
    }

    if (timeStr === '08:00') {
      return [
        {
          id: 'notif-cg-0800',
          app: '📊 Caregiver Telemetry',
          title: 'Dose Due: John Dupont',
          body: "John's 08:00 Morning Dafalgan 1g is due. Pillbox status: Connected 🟢 (Battery 88%).",
          time: '08:00 AM',
          urgent: false,
          targetTab: 'tab-cg-timeline',
        },
      ];
    } else if (timeStr === '12:30') {
      return [
        {
          id: 'notif-cg-1230',
          app: '✅ Adherence Confirmation',
          title: 'Intake Confirmed: John Dupont',
          body: 'John took Dafalgan 1g at 08:02 on time. Compliance today: 100%. Next dose: 19:00.',
          time: '12:30 PM',
          urgent: false,
          targetTab: 'tab-cg-timeline',
        },
      ];
    } else if (timeStr === '19:00') {
      return [
        {
          id: 'notif-cg-1900',
          app: '📦 Pillbox Telemetry',
          title: 'Evening Dose Unlocked: John Dupont',
          body: "Compartment 3 (Lipitor 20mg) unlocked on John's smart pillbox. Awaiting sensor confirmation.",
          time: '7:00 PM',
          urgent: false,
          targetTab: 'tab-cg-timeline',
        },
      ];
    } else if (timeStr === '19:10') {
      return [
        {
          id: 'notif-cg-1910',
          app: '⏳ Follow-Up Dispatched',
          title: '10m Elapsed: John Dupont',
          body: 'John has not opened Box 3 yet (10m late). Automatic gentle reminder dispatched to his phone.',
          time: '7:10 PM',
          urgent: false,
          targetTab: 'tab-cg-timeline',
        },
      ];
    } else if (timeStr === '19:35') {
      return [
        {
          id: 'notif-cg-1935',
          app: '🚨 CRITICAL ESCALATION',
          title: 'MISSED DOSE ALERT: John Dupont',
          body: 'John has not taken 19:00 Lipitor after 35 minutes! Pillbox LED blinking red. Tap to call patient.',
          time: '7:35 PM',
          urgent: true,
          targetTab: 'tab-cg-timeline',
        },
      ];
    }
  }

  return [];
}

// Render lockscreen push notification cards
function renderLockscreenNotifications() {
  if (!dom.lockscreenNotificationsList) return;
  dom.lockscreenNotificationsList.innerHTML = '';

  // Update lockscreen persona badge
  if (dom.lockscreenOwnerBadge) {
    dom.lockscreenOwnerBadge.textContent =
      state.currentRole === 'PATIENT' ? "John's Phone 👴" : "Sophie's Phone 👩‍⚕️";
  }

  const roleNotifs = getRoleNotifications(state.currentRole, state.simulatedTime);

  if (roleNotifs.length === 0) {
    dom.lockscreenNotificationsList.innerHTML = `
      <div class="ls-notif-card" style="opacity: 0.7; text-align: center; cursor: default;">
        <span class="ls-notif-body">No unread notifications for this time.</span>
      </div>
    `;
    return;
  }

  roleNotifs.forEach((notif) => {
    const card = document.createElement('div');
    card.className = `ls-notif-card ${notif.urgent ? 'urgent' : ''}`;

    card.innerHTML = `
      <div class="ls-notif-card-header">
        <span class="ls-notif-app-brand">${notif.app}</span>
        <span class="ls-notif-time-badge">${notif.time}</span>
      </div>
      <div class="ls-notif-title">${notif.title}</div>
      <div class="ls-notif-body">${notif.body}</div>
      <div class="ls-notif-action-hint">Tap to open app ➔</div>
    `;

    card.onclick = () => {
      unlockPhone();
      if (notif.targetTab) activateTab(notif.targetTab);
      if (notif.compIndex) {
        showToast(`Navigated to Compartment ${notif.compIndex}`, 'info');
      }
    };

    dom.lockscreenNotificationsList.appendChild(card);
  });
}

// ===================================================================
// PATIENT MULTI-DAY SCHEDULE SYNCHRONIZATION
// ===================================================================

function renderPatientSchedule() {
  if (!dom.todayScheduleBadge || !state.pillbox || !state.pillbox.compartments) return;

  const comp3 = state.pillbox.compartments.find((c) => c.compartment_index === 3);
  const isComp3Taken = comp3 && comp3.state === 'TAKEN';

  if (isComp3Taken) {
    dom.todayScheduleBadge.textContent = 'All Doses Taken (100%)';
    dom.todayScheduleBadge.className = 'sdc-status-badge badge-complete';
    if (dom.schedCheckMorning) dom.schedCheckMorning.textContent = '✔ Taken 08:02';
    if (dom.schedSlotMorning) dom.schedSlotMorning.className = 'sdc-slot completed';
    if (dom.schedCheckEvening) dom.schedCheckEvening.textContent = `✔ Taken ${state.simulatedTime}`;
    if (dom.schedSlotEvening) dom.schedSlotEvening.className = 'sdc-slot completed';
    return;
  }

  const isMorning = state.simulatedTime === '08:00';
  const isNoon = state.simulatedTime === '12:30';
  const isEvening = state.simulatedTime === '19:00' || state.simulatedTime === '19:10';
  const isOverdue = state.simulatedTime === '19:35';

  if (isMorning) {
    dom.todayScheduleBadge.textContent = 'Morning Dose Ready';
    dom.todayScheduleBadge.className = 'sdc-status-badge badge-today';
    if (dom.schedCheckMorning) dom.schedCheckMorning.textContent = '🟢 Unlocked / Ready';
    if (dom.schedSlotMorning) dom.schedSlotMorning.className = 'sdc-slot active';
    if (dom.schedCheckEvening) dom.schedCheckEvening.textContent = '⏳ Opens at 19:00';
    if (dom.schedSlotEvening) dom.schedSlotEvening.className = 'sdc-slot upcoming';
  } else if (isNoon) {
    dom.todayScheduleBadge.textContent = 'Morning Completed';
    dom.todayScheduleBadge.className = 'sdc-status-badge badge-complete';
    if (dom.schedCheckMorning) dom.schedCheckMorning.textContent = '✔ Taken 08:02';
    if (dom.schedSlotMorning) dom.schedSlotMorning.className = 'sdc-slot completed';
    if (dom.schedCheckEvening) dom.schedCheckEvening.textContent = '⏳ Opens at 19:00';
    if (dom.schedSlotEvening) dom.schedSlotEvening.className = 'sdc-slot upcoming';
  } else if (isEvening) {
    dom.todayScheduleBadge.textContent = 'Evening Dose Active';
    dom.todayScheduleBadge.className = 'sdc-status-badge badge-today';
    if (dom.schedCheckMorning) dom.schedCheckMorning.textContent = '✔ Taken 08:02';
    if (dom.schedSlotMorning) dom.schedSlotMorning.className = 'sdc-slot completed';
    if (dom.schedCheckEvening) dom.schedCheckEvening.textContent = '🟢 Unlocked / Ready';
    if (dom.schedSlotEvening) dom.schedSlotEvening.className = 'sdc-slot active';
  } else if (isOverdue) {
    dom.todayScheduleBadge.textContent = '🚨 Evening Overdue (>30m)';
    dom.todayScheduleBadge.className = 'sdc-status-badge sdc-alert-badge';
    if (dom.schedCheckMorning) dom.schedCheckMorning.textContent = '✔ Taken 08:02';
    if (dom.schedSlotMorning) dom.schedSlotMorning.className = 'sdc-slot completed';
    if (dom.schedCheckEvening) dom.schedCheckEvening.textContent = '🔴 OVERDUE (LED Blinking)';
    if (dom.schedSlotEvening) dom.schedSlotEvening.className = 'sdc-slot active';
  }
}

// ===================================================================
// DATA FETCHING & SYNCHRONIZATION
// ===================================================================

async function loadInitialData() {
  try {
    const res = await fetch(apiUrl('/api/status'));
    if (!res.ok) throw new Error('Could not load status');
    const data = await res.json();

    state.pillbox = data.pillbox;
    state.schedule = data.schedule;
    state.medications = data.medications || [];
    state.messages = data.messages || [];

    renderAll();
  } catch (err) {
    console.error('Error fetching initial status:', err);
    showToast('Error connecting to Dosette server', 'alert');
  }
}

function initSSE() {
  try {
    const eventSource = new EventSource(apiUrl('/api/events'));

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        handleLiveEvent(data);
      } catch (err) {
        console.warn('SSE parse error:', err);
      }
    };

    eventSource.onerror = () => {
      console.warn('SSE disconnected, browser will retry automatically');
    };
  } catch (err) {
    console.warn('SSE init error:', err);
  }
}

function handleLiveEvent(data) {
  if (data.type === 'CONNECTED') return;

  if (data.status) {
    if (data.status.pillbox) state.pillbox = data.status.pillbox;
    if (data.status.schedule) state.schedule = data.status.schedule;
    if (data.status.medications) state.medications = data.status.medications;
  }

  // Handle new incoming message
  if (data.event === 'message_created' || data.message) {
    const newMsg = data.message;
    if (newMsg && !state.messages.some((m) => m.id === newMsg.id)) {
      state.messages.unshift(newMsg);
      playChime();
      renderLockscreenNotifications();

      if (newMsg.to === state.currentRole) {
        showToast(`📬 New message from ${newMsg.sender_name}: "${newMsg.title}"`, 'info');
      }
    }
  }

  // Refresh status & inbox
  loadInitialData();

  // Toast notifications for hardware actions
  if (data.type === 'OPEN') {
    showToast(`🔓 Compartment ${data.index} opened! Intake confirmed.`, 'success');
  } else if (data.type === 'ALERT') {
    showToast(`🚨 Warning: Dose in Compartment ${data.index} missed (>30 min delay)!`, 'alert');
  } else if (data.type === 'FILL') {
    showToast(`📥 Compartment ${data.index} loaded by caregiver.`, 'info');
  } else if (data.type === 'RESET') {
    showToast('🔄 Demo reset to initial state.', 'info');
  }
}

// Gentle notification sound
function playChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // AudioContext blocked by user gesture policy
  }
}

// ===================================================================
// ROLE & VIEW NAVIGATION
// ===================================================================

function switchRole(newRole) {
  state.currentRole = newRole;

  // Toggle role classes on body for distinct calming light theme for Patient vs clean clinical daylight for Caregiver
  document.body.classList.toggle('role-patient', newRole === 'PATIENT');
  document.body.classList.toggle('role-caregiver', newRole === 'CAREGIVER');
  document.body.classList.toggle('role-device', newRole === 'DEVICE');

  // Toggle active class on role buttons
  dom.btnRolePatient.classList.toggle('active', newRole === 'PATIENT');
  dom.btnRoleCaregiver.classList.toggle('active', newRole === 'CAREGIVER');
  dom.btnRoleDevice.classList.toggle('active', newRole === 'DEVICE');

  // Update header subtitle and role visibility
  if (newRole === 'PATIENT') {
    dom.headerSubtitle.innerHTML = 'Logged in as: <strong>John Dupont (Patient)</strong>';
    dom.roleViewPatient.classList.remove('hidden');
    dom.roleViewCaregiver.classList.add('hidden');
    dom.roleViewDevice.classList.add('hidden');
    if (dom.navPatientTabs) dom.navPatientTabs.classList.remove('hidden');
    if (dom.navCaregiverTabs) dom.navCaregiverTabs.classList.add('hidden');
    activateTab('tab-patient-today');
  } else if (newRole === 'CAREGIVER') {
    dom.headerSubtitle.innerHTML = 'Logged in as: <strong>Sophie Dupont (Caregiver)</strong>';
    dom.roleViewPatient.classList.add('hidden');
    dom.roleViewCaregiver.classList.remove('hidden');
    dom.roleViewDevice.classList.add('hidden');
    if (dom.navPatientTabs) dom.navPatientTabs.classList.add('hidden');
    if (dom.navCaregiverTabs) dom.navCaregiverTabs.classList.remove('hidden');
    activateTab('tab-cg-timeline');
  } else {
    dom.headerSubtitle.innerHTML = 'Viewing: <strong>Dosette Pillbox Device</strong>';
    dom.roleViewPatient.classList.add('hidden');
    dom.roleViewCaregiver.classList.add('hidden');
    dom.roleViewDevice.classList.remove('hidden');
    if (dom.navPatientTabs) dom.navPatientTabs.classList.add('hidden');
    if (dom.navCaregiverTabs) dom.navCaregiverTabs.classList.add('hidden');
  }

  renderAll();
  const roleLabel = newRole === 'PATIENT'
    ? '👴 John Dupont (Patient)'
    : newRole === 'CAREGIVER' ? '👩‍⚕️ Sophie Dupont (Caregiver)' : '⚙️ Dosette Pillbox Device';
  showToast(`Viewing ${roleLabel}`, 'info');
}

function activateTab(tabId) {
  state.activeTab = tabId;

  // Patient view tab switching
  if (state.currentRole === 'PATIENT') {
    if (dom.roleViewPatient) {
      dom.roleViewPatient.querySelectorAll('.tab-page').forEach((p) => p.classList.remove('active'));
    }
    const targetPage = document.getElementById(tabId);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    if (dom.navPatientTabs) {
      dom.navPatientTabs.querySelectorAll('.bottom-tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });
    }
    if (dom.phoneContentArea) {
      dom.phoneContentArea.scrollTop = 0;
    }
    return;
  }

  // Caregiver tab switching
  if (dom.roleViewCaregiver) {
    dom.roleViewCaregiver.querySelectorAll('.tab-page').forEach((p) => p.classList.remove('active'));
  }

  const targetPage = document.getElementById(tabId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update Caregiver bottom navigation active button
  if (dom.navCaregiverTabs) {
    dom.navCaregiverTabs.querySelectorAll('.bottom-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
  }

  if (dom.phoneContentArea) {
    dom.phoneContentArea.scrollTop = 0;
  }
}

function toggleLayoutMode() {
  if (state.layoutMode === 'mobile-phone') {
    state.layoutMode = 'desktop-split';
    document.body.classList.remove('mode-mobile-phone');
    document.body.classList.add('mode-desktop-split');
    dom.layoutLabel.textContent = 'Split View';
    showToast('Wide Split-screen layout enabled', 'info');
  } else {
    state.layoutMode = 'mobile-phone';
    document.body.classList.remove('mode-desktop-split');
    document.body.classList.add('mode-mobile-phone');
    dom.layoutLabel.textContent = 'Phone View';
    showToast('Smartphone simulator layout enabled', 'info');
  }
}

// ===================================================================
// RENDERING
// ===================================================================

function renderAll() {
  renderHardwareStatus();
  renderCompartments();
  // Don't redraw the unit screen while a full-screen takeover (med info / cup
  // camera) is up — a background refresh would flip it back to DOSE READY.
  if (!state.deviceTakeover) renderDeviceWheel();
  renderTimeline();
  renderInboxMessages();
  renderPatientSchedule();
  renderSpotlightCard();
  renderLockscreenNotifications();
  if (typeof renderCgLoader === 'function') renderCgLoader();
}

// A compartment can hold several medicines. Return the list of medicine objects.
function compMeds(comp) {
  if (!comp) return [];
  const ids = (comp.medication_ids && comp.medication_ids.length)
    ? comp.medication_ids
    : (comp.medication_id ? [comp.medication_id] : []);
  return ids.map((id) => state.medications.find((m) => m.id === id) || { id, brand_name: id });
}
// Short label for what's in a compartment: one name, or "N tablets".
function compLabelText(comp) {
  const meds = compMeds(comp);
  if (meds.length === 0) return 'Empty';
  if (meds.length === 1) return meds[0].brand_name;
  return `${meds.length} tablets`;
}

// Which of the 28 weekly compartments is "up next" for the simulated clock.
function currentSlotIndex() {
  const t = state.simulatedTime;
  if (t === '08:00') return 1;   // Today · Morning
  if (t === '12:30') return 2;   // Today · Noon
  if (t === '22:00') return 4;   // Today · Night
  return 3;                      // 19:00 / 19:10 / 19:35 -> Today · Evening
}

function renderDeviceWheel() {
  if (!dom.deviceWheel || !state.pillbox?.compartments || !dom.deviceDoseScreen) return;
  state.deviceTakeover = null;   // reaching the wheel/dose screen ends any takeover view

  const compartments = state.pillbox.compartments;
  const currentIndex = currentSlotIndex();
  const currentCompartment = compartments.find((comp) => comp.compartment_index === currentIndex) || compartments[0];
  const hasDose = ['08:00', '19:00', '19:10', '19:35'].includes(state.simulatedTime) || state.deviceDosePreview;
  const sliceAngle = 360 / 28;
  const activePosition = currentIndex;
  const wheelOffset = 180 - ((activePosition - 1) * sliceAngle);

  dom.deviceWheel.classList.toggle('hidden', hasDose);
  dom.deviceDoseScreen.classList.toggle('hidden', !hasDose);
  const deviceLegend = dom.roleViewDevice.querySelector('.device-screen-legend');
  if (deviceLegend) deviceLegend.classList.toggle('hidden', hasDose);
  dom.deviceWheel.style.display = hasDose ? 'none' : '';
  dom.deviceDoseScreen.style.display = hasDose ? 'flex' : 'none';
  if (deviceLegend) deviceLegend.style.display = hasDose ? 'none' : '';
  // Only play the pop-in animation when the visible panel actually changes
  // (wheel <-> dose screen). Plain re-renders (SSE refresh, demo nudges) keep
  // the current panel steady instead of flashing it again and again.
  const visibleDevicePanel = hasDose ? dom.deviceDoseScreen : dom.deviceWheel;
  const panelKey = hasDose ? 'dose' : 'wheel';
  if (state._devicePanelKey !== panelKey) {
    state._devicePanelKey = panelKey;
    visibleDevicePanel.classList.remove('device-fade-in');
    void visibleDevicePanel.offsetWidth;
    visibleDevicePanel.classList.add('device-fade-in');
  }
  if (hasDose) {
    // "DOSE READY" only when the simulated clock is actually at a dispensing
    // time. Otherwise (e.g. tapping the idle wheel at 15:00 to peek) it's just
    // a look-ahead, so label it "NEXT DOSE" and show the slot's own time.
    const isRealDoseTime = ['08:00', '19:00', '19:10', '19:35'].includes(state.simulatedTime);

    // Normally show the medicine in the compartment at the opening. If that
    // slot is empty (dose already taken, or nothing loaded), look ahead and
    // name the next compartment that actually has medicine instead of the
    // vague "Scheduled medication".
    let screenComp = currentCompartment;
    let screenMeds = compMeds(screenComp);
    let doseLabel = isRealDoseTime ? 'DOSE READY' : 'NEXT DOSE';
    let subLine = isRealDoseTime
      ? `Compartment ${currentIndex} · ${state.simulatedTime}`
      : `Compartment ${currentIndex}${currentCompartment?.target_time ? ` · ${currentCompartment.target_time}` : ''}`;

    if (screenMeds.length === 0) {
      const filledAhead = compartments
        .filter((c) => compMeds(c).length > 0)
        .sort((a, b) => a.compartment_index - b.compartment_index);
      const next = filledAhead.find((c) => c.compartment_index > currentIndex) || filledAhead[0];
      if (next) {
        screenComp = next;
        screenMeds = compMeds(next);
        doseLabel = 'NEXT DOSE';
        subLine = `Compartment ${next.compartment_index}${next.target_time ? ` · ${next.target_time}` : ''}`;
      } else {
        doseLabel = 'ALL DONE';
        subLine = 'No more doses scheduled';
      }
    }

    const medicationName = screenMeds.length > 1
      ? `${screenMeds.length} tablets`
      : (screenMeds[0]?.brand_name || 'No medicine loaded');
    dom.deviceDoseScreen.innerHTML = `
      <div class="device-dose-top">
        <span class="device-dose-label">${doseLabel}</span>
        <strong>${medicationName}</strong>
        <span>${subLine}</span>
      </div>
      <div class="device-dose-bottom">
        <button class="device-dose-info" type="button" aria-label="Medication information" title="Medication information">
          <span class="device-dose-action-icon">i</span>
        </button>
        <button class="device-call-hold" type="button" aria-label="Hold to call caregiver" title="Hold 3s to call caregiver">
          <span class="device-hold-progress"></span>
          <span class="device-dose-action-icon">☎</span>
        </button>
      </div>
    `;
    const infoButton = dom.deviceDoseScreen.querySelector('.device-dose-info');
    const callButton = dom.deviceDoseScreen.querySelector('.device-call-hold');
    infoButton.addEventListener('click', () => showDeviceMedInfo(screenComp, medicationName));
    bindDeviceCallHold(callButton);
  }

  dom.deviceWheel.innerHTML = `
    <div class="device-wheel-center">
      <span>${state.simulatedTime}</span>
      <strong>#${currentIndex}</strong>
    </div>
  `;
  dom.deviceWheel.style.setProperty('--device-wheel-offset', `${wheelOffset}deg`);
  if (dom.deviceWheelTime) dom.deviceWheelTime.textContent = state.simulatedTime;
  if (dom.deviceWheelCurrent) dom.deviceWheelCurrent.textContent = `#${currentIndex}`;
  if (dom.deviceScreenStatus) dom.deviceScreenStatus.textContent = `Compartment ${currentIndex} is positioned at the opening.`;

  for (let index = 1; index <= 28; index += 1) {
    const configuredCompartment = compartments.find((comp) => comp.compartment_index === index);
    const slot = document.createElement('div');
    const isCurrent = index === activePosition;
    const isFilled = configuredCompartment?.state === 'FILLED';
    slot.className = `device-wheel-slot ${isFilled ? 'filled' : 'empty'}${isCurrent ? ' active' : ''}`;
    slot.style.setProperty('--device-slot-angle', `${(index - 1) * sliceAngle + wheelOffset}deg`);
    slot.title = isCurrent ? `Opening: compartment ${currentIndex}` : (isFilled ? 'Medication loaded' : 'Empty');
    dom.deviceWheel.appendChild(slot);
  }

  dom.deviceWheel.onclick = () => {
    if (hasDose) return;
    state.deviceDosePreview = true;
    window.clearTimeout(state.deviceDosePreviewTimer);
    renderDeviceWheel();
    state.deviceDosePreviewTimer = window.setTimeout(() => {
      state.deviceDosePreview = false;
      renderDeviceWheel();
    }, 10000);
  };
}

// Press-and-hold (3s) on the unit's ☎ button before the caregiver call goes out.
function bindDeviceCallHold(btn) {
  if (!btn) return;
  let holdTimer = null;

  const cancelHold = () => {
    if (holdTimer) { window.clearTimeout(holdTimer); holdTimer = null; }
    btn.classList.remove('holding');
  };

  const startHold = (e) => {
    if (e) e.preventDefault();
    if (holdTimer) return;
    btn.classList.add('holding');
    holdTimer = window.setTimeout(() => {
      holdTimer = null;
      btn.classList.remove('holding');
      speakText('Calling your caregiver Sophie.');
      showToast('Calling caregiver Sophie Dupont.', 'success');
      alert('📞 Calling caregiver Sophie Dupont\n+32 470 12 34 56');
    }, 3000);
  };

  btn.addEventListener('pointerdown', startHold);
  btn.addEventListener('pointerup', cancelHold);
  btn.addEventListener('pointerleave', cancelHold);
  btn.addEventListener('pointercancel', cancelHold);
  // ignore a plain click — the hold timer is the only way to place the call
  btn.addEventListener('click', (e) => e.preventDefault());
}

function deviceScreenTakeover() {
  dom.deviceDoseScreen.classList.remove('hidden');
  dom.deviceDoseScreen.style.display = 'flex';
  if (dom.deviceWheel) {
    dom.deviceWheel.classList.add('hidden');
    dom.deviceWheel.style.display = 'none';
  }
}

// "i" button: speak a plain, short explanation and show it big on the screen.
function showDeviceMedInfo(comp, medicationName) {
  if (!dom.deviceDoseScreen) return;
  state.deviceTakeover = 'info';
  deviceScreenTakeover();

  const meds = compMeds(comp);
  let line;
  let spoken;
  if (meds.length > 1) {
    line = meds.map((m) => m.brand_name).join('<br>');
    spoken = `This dose has ${meds.length} tablets: ${meds.map((m) => m.brand_name).join(', ')}. Take them all with water.`;
  } else {
    const m = meds[0];
    line = m ? `${m.ai_explanation?.summary || ''}` : '';
    spoken = m
      ? `This is ${m.brand_name}. ${m.ai_explanation?.summary || ''} ${m.ai_explanation?.simple_instructions || ''}`
      : `This is ${medicationName}.`;
  }

  dom.deviceDoseScreen.innerHTML = `
    <div class="device-simple">
      <span class="ds-kicker">YOUR MEDICINE</span>
      <strong class="ds-title">${medicationName}</strong>
      <p class="ds-line">${line}</p>
      <div class="ds-actions">
        <button class="ds-btn ds-again" type="button">🔊 Again</button>
        <button class="ds-btn ds-back" type="button">← Back</button>
      </div>
    </div>
  `;
  dom.deviceDoseScreen.querySelector('.ds-again').addEventListener('click', () => speakText(spoken));
  dom.deviceDoseScreen.querySelector('.ds-back').addEventListener('click', () => renderDeviceWheel());
  speakText(spoken);
}

// The dispenser's built-in camera checks the cup after the dose drops.
// 'dispensed' just shows the normal dose screen (info + call-caregiver buttons);
// 'one-left' warns; 'all-clear' confirms.
function showDeviceCup(cupState) {
  if (!dom.deviceDoseScreen) return;

  // "Dispensed" = the standard DOSE READY screen with the two buttons.
  if (cupState === 'dispensed') {
    renderDeviceWheel();
    return;
  }

  state.deviceTakeover = cupState;
  deviceScreenTakeover();

  const conf = {
    'one-left': { cls: 'cup-warn', pills: 1, title: '⚠ ONE LEFT', msg: 'Take the last tablet', speak: 'Warning. One tablet is still in the cup. Please take the last tablet.' },
    'all-clear': { cls: 'cup-clear', pills: 0, title: '✓ ALL TAKEN', msg: 'Dose complete', speak: 'Well done. All medication taken. Your dose is complete.' },
  }[cupState];
  if (!conf) return;

  const pillDots = Array.from({ length: conf.pills }, () => '<span class="cup-pill"></span>').join('');

  dom.deviceDoseScreen.innerHTML = `
    <div class="device-simple cup ${conf.cls}">
      <span class="ds-kicker">📷 CUP CAMERA</span>
      <div class="ds-cup"><div class="ds-cup-body">${pillDots}</div></div>
      <strong class="ds-title">${conf.title}</strong>
      <p class="ds-line">${conf.msg}</p>
      <button class="ds-btn ds-back" type="button">← Back</button>
    </div>
  `;
  dom.deviceDoseScreen.querySelector('.ds-back').addEventListener('click', () => renderDeviceWheel());
  speakText(conf.speak);
}

function renderHardwareStatus() {
  if (state.pillbox) {
    const batt = `${state.pillbox.battery_level}% 🔋`;
    dom.phoneBattery.textContent = batt;
    dom.patientBatteryBadge.textContent = `${state.pillbox.battery_level}% Battery 🔋`;

    if (state.pillbox.last_synced) {
      const timeStr = new Date(state.pillbox.last_synced).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      dom.cgLastSyncTime.textContent = `Last synced: ${timeStr}`;
    }
  }
}

/**
 * SMART COMPARTMENT LOCKING & SAFETY RULE:
 * 1. John only takes medication when scheduled.
 * 2. John CANNOT open a compartment before scheduled time (e.g. Comp 3 is locked until 19:00).
 * 3. John CANNOT refill or place pills (refill is caregiver-only).
 */
function renderCompartments() {
  if (!state.pillbox || !state.pillbox.compartments) return;

  const comps = state.pillbox.compartments;

  // 1. Render Patient View (Calming, Time-Locked, No Refill buttons)
  if (dom.patientCompartmentsList) {
    dom.patientCompartmentsList.querySelectorAll('.dispenser-slot').forEach((slot) => slot.remove());

    const currentCompartment = comps.find((comp) => comp.compartment_index === currentSlotIndex()) || comps[0];
    const currentCompartmentIndex = currentCompartment?.compartment_index;
    const sliceAngle = 360 / 28;
    const currentVisualIndex = currentCompartmentIndex || 1;
    const wheelOffset = 180 - ((currentVisualIndex - 1) * sliceAngle);
    dom.patientCompartmentsList.style.setProperty('--wheel-offset', `${wheelOffset}deg`);
    if (dom.patientCurrentSlot && currentCompartment) {
      dom.patientCurrentSlot.textContent = `#${currentCompartment.compartment_index}`;
    }

    const patientSlots = Array.from({ length: 28 }, (_, index) => {
      const comp = comps.find((item) => item.compartment_index === index + 1);
      return { comp, index: index + 1 };
    });

    patientSlots.forEach(({ comp, index }) => {
      if (!comp) {
        const emptySlot = document.createElement('div');
        const emptyAngle = (index - 1) * sliceAngle + wheelOffset;
        const isCurrentVisualSlot = index === currentVisualIndex;
        const emptyVisualState = (index - 1) * sliceAngle >= 180 ? ' visual-filled' : ' visual-empty';
        emptySlot.className = `dispenser-slot dispenser-slot-empty${emptyVisualState}${isCurrentVisualSlot ? ' current-slot' : ''}`;
        emptySlot.style.setProperty('--slot-angle', `${emptyAngle}deg`);
        emptySlot.innerHTML = `<span class="dispenser-slot-number">${index}</span><span class="dispenser-slot-empty-label">Empty</span>`;
        dom.patientCompartmentsList.appendChild(emptySlot);
        return;
      }

      const med = state.medications.find((m) => m.id === comp.medication_id);
      const medName = med ? med.brand_name : (comp.medication_id || 'Empty');

      // Determine time lock status for this compartment
      let isUnlockedNow = false;
      let isLockedFuture = false;

      if (comp.compartment_index === 1) {
        // Morning dose (08:00)
        isUnlockedNow = state.simulatedTime === '08:00' && comp.state === 'FILLED';
      } else if (comp.compartment_index === 3) {
        // Evening dose (19:00)
        if (state.simulatedTime === '19:00' || state.simulatedTime === '19:10' || state.simulatedTime === '19:35') {
          isUnlockedNow = comp.state === 'FILLED';
        } else {
          isLockedFuture = comp.state === 'FILLED';
        }
      }

      const card = document.createElement('div');
      let stateClass = comp.state === 'FILLED' ? 'state-filled' : (comp.state === 'TAKEN' ? 'state-taken' : 'state-empty');
      if (isLockedFuture) stateClass = 'state-locked';
      const alertClass = comp.led_active ? 'state-alert' : '';

      const currentClass = index === currentVisualIndex ? 'current-slot' : '';
      const slotAngle = (index - 1) * sliceAngle + wheelOffset;
      const visualState = (index - 1) * sliceAngle >= 180 ? 'visual-filled' : 'visual-empty';
      card.className = `dispenser-slot ${stateClass} ${visualState} ${alertClass} ${currentClass}`;
      card.style.setProperty('--slot-angle', `${slotAngle}deg`);

      // LED indicator
      const led = document.createElement('div');
      let ledTitle = 'LED Off';
      if (comp.led_active) {
        led.className = 'dispenser-led active-alert';
        ledTitle = 'LED Blinking Red (Overdue)';
      } else if (isUnlockedNow) {
        led.className = 'dispenser-led active-green';
        ledTitle = 'LED Glowing Green (Ready to open)';
      } else {
        led.className = 'dispenser-led';
      }
      led.title = ledTitle;
      card.appendChild(led);

      // Header
      const header = document.createElement('div');
      header.className = 'dispenser-slot-header';
      header.innerHTML = `
        <span class="dispenser-slot-number">${comp.compartment_index}</span>
        <span class="dispenser-slot-time">${comp.target_time}</span>
      `;
      card.appendChild(header);

      // Pill Graphic
      const lidView = document.createElement('div');
      lidView.className = 'dispenser-lid-view';
      let pillEmoji = '💊';
      let badgeText = 'Ready';
      let badgeClass = 'state-badge-filled';

      if (isLockedFuture) {
        pillEmoji = '🔒';
        badgeText = 'Locked';
        badgeClass = 'state-badge-empty';
      } else if (comp.state === 'EMPTY') {
        pillEmoji = '⚪';
        badgeText = 'Empty';
        badgeClass = 'state-badge-empty';
      } else if (comp.state === 'TAKEN') {
        pillEmoji = '✨';
        badgeText = 'Taken';
        badgeClass = 'state-badge-taken';
      }

      lidView.innerHTML = `
        <div class="dispenser-pill-visual">${pillEmoji}</div>
        <span class="dispenser-state-badge ${badgeClass}">${badgeText}</span>
      `;
      card.appendChild(lidView);

      // Med title
      const medTitle = document.createElement('div');
      medTitle.className = 'dispenser-med-name';
      medTitle.textContent = medName;
      card.appendChild(medTitle);

      // Patient Action Button with Safety Time Locking
      const actionBtn = document.createElement('button');
      if (isLockedFuture) {
        actionBtn.className = 'dispenser-open-btn btn-locked-disabled';
        actionBtn.textContent = `🔒 Locked until ${comp.target_time}`;
        actionBtn.onclick = () => {
          showToast(`🔒 Safety Lock: Compartment ${comp.compartment_index} opens automatically at ${comp.target_time}.`, 'info');
        };
      } else if (comp.state === 'FILLED') {
        actionBtn.className = 'dispenser-open-btn';
        actionBtn.textContent = comp.led_active ? '🚨 Take Overdue Dose (Open)' : 'Open Lid 🔓';
        actionBtn.onclick = async () => {
          await openCompartmentAction(comp.compartment_index);
          speakText(`Compartment ${comp.compartment_index} opened. Please take ${medName} with water.`);
        };
      } else if (comp.state === 'TAKEN') {
        actionBtn.className = 'dispenser-open-btn btn-taken-disabled';
        actionBtn.textContent = 'Taken Today ✨';
        actionBtn.disabled = true;
      } else {
        actionBtn.className = 'dispenser-open-btn btn-empty-disabled';
        actionBtn.textContent = 'Empty';
        actionBtn.disabled = true;
      }
      card.appendChild(actionBtn);

      dom.patientCompartmentsList.appendChild(card);
    });
  }

  // 2. Render Caregiver View (Full management: taken history, what was in it, required refills, test open)
  if (dom.caregiverCompartmentsList) {
    dom.caregiverCompartmentsList.innerHTML = '';

    const scannedMed = state.currentCgScan || state.currentScan || null;

    comps.forEach((comp) => {
      const medsHere = compMeds(comp);
      const isEmpty = comp.state === 'EMPTY' || medsHere.length === 0;
      const medName = isEmpty
        ? 'Empty'
        : (medsHere.length > 1 ? `${medsHere.length} medicines` : medsHere[0].brand_name);
      const medListHtml = medsHere.map((m) => `<span class="cd-line">💊 ${m.brand_name}</span>`).join('');

      // Find last intake log for this compartment
      const compLogs = (state.schedule?.intake_logs || []).filter((l) => l.compartment_index === comp.compartment_index);
      const takenLog = compLogs.filter((l) => l.status === 'TAKEN_ON_TIME' || l.actual_time).slice(-1)[0];

      const card = document.createElement('div');
      const stateClass = comp.state === 'FILLED' ? 'state-filled' : (comp.state === 'TAKEN' ? 'state-taken' : 'state-empty');
      const alertClass = comp.led_active ? 'state-alert' : '';

      // Collapsible: keep filled / alert / today's (1-4) open, everything else collapsed
      const startOpen = comp.state === 'FILLED' || comp.led_active || comp.compartment_index <= 4;
      card.className = `compartment-card is-collapsible ${stateClass} ${alertClass}${startOpen ? '' : ' collapsed'}`;

      let pillEmoji = '💊';
      let badgeText = 'Loaded';
      let badgeClass = 'state-badge-filled';

      if (comp.state === 'EMPTY') {
        pillEmoji = '⚪';
        badgeText = 'Empty';
        badgeClass = 'state-badge-empty';
      } else if (comp.state === 'TAKEN') {
        pillEmoji = '✨';
        badgeText = 'Taken Today';
        badgeClass = 'state-badge-taken';
      }

      let detailHtml = '';
      if (comp.state === 'TAKEN') {
        const timeStr = takenLog?.actual_time
          ? new Date(takenLog.actual_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : (comp.compartment_index === 1 ? '08:07' : '19:07');
        detailHtml = `
          <span class="cd-line">✅ <strong>Taken:</strong> Today at ${timeStr}</span>
          <span class="cd-line">⏰ <strong>Scheduled:</strong> ${comp.target_time}</span>
        `;
      } else if (comp.state === 'FILLED') {
        detailHtml = `
          <span class="cd-line">📦 <strong>Loaded (${medsHere.length}):</strong></span>
          ${medListHtml}
          <span class="cd-line">⏰ <strong>Scheduled:</strong> ${comp.target_time}</span>
        `;
      } else {
        detailHtml = `
          <span class="cd-line">⚪ <strong>Status:</strong> Empty — no medicine loaded</span>
          <span class="cd-line">⏰ <strong>Scheduled time:</strong> ${comp.target_time}</span>
        `;
      }

      card.innerHTML = `
        <div class="comp-card-top-row">
          <div class="comp-slot-badge-group">
            <span class="compartment-led ${comp.led_active ? 'active-alert' : ''}" title="${comp.led_active ? 'LED Blinking Red (Alert)' : (comp.state === 'FILLED' ? 'LED Green' : 'LED Off')}"></span>
            <span class="comp-index-tag">Box ${comp.compartment_index}</span>
            <span class="comp-label">${comp.label}</span>
          </div>
          <span class="comp-state-badge ${badgeClass}">${badgeText}</span>
          <span class="comp-collapse-chevron" aria-hidden="true">▾</span>
        </div>
        <div class="comp-card-body-row">
          <div class="comp-pill-visual">${pillEmoji}</div>
          <div class="comp-info-block">
            <div class="comp-med-name">${medName}</div>
            <div class="comp-detail-info">${detailHtml}</div>
          </div>
        </div>
        <div class="comp-card-action-row"></div>
      `;

      // click the header row to expand / collapse
      card.querySelector('.comp-card-top-row').addEventListener('click', () => {
        card.classList.toggle('collapsed');
      });

      // Caregiver action buttons
      const actionBtn = document.createElement('button');
      actionBtn.className = 'comp-open-btn';
      if (comp.state === 'FILLED') {
        actionBtn.textContent = 'Test Open 🔓';
        actionBtn.onclick = () => openCompartmentAction(comp.compartment_index);
      } else if (comp.state === 'TAKEN') {
        const refillId = comp.medication_id || (scannedMed && scannedMed.id);
        actionBtn.textContent = refillId ? `Refill ${medName} 📥` : 'Scan a medicine to refill';
        actionBtn.disabled = !refillId;
        if (refillId) actionBtn.onclick = () => fillCompartmentAction(comp.compartment_index, refillId);
      } else {
        actionBtn.textContent = scannedMed ? `Load ${scannedMed.brand_name} 📥` : 'Scan a medicine to load';
        actionBtn.disabled = !scannedMed;
        if (scannedMed) actionBtn.onclick = () => fillCompartmentAction(comp.compartment_index, scannedMed.id);
      }
      card.querySelector('.comp-card-action-row').appendChild(actionBtn);

      dom.caregiverCompartmentsList.appendChild(card);
    });
  }

  // 3. Render Caregiver Pillbox Summary & Refill Audit Card
  if (dom.cgSummaryTableWrap) {
    dom.cgSummaryTableWrap.innerHTML = '';
    comps.forEach((comp) => {
      const defaultMedId = comp.compartment_index === 1 ? 'med_001' : (comp.compartment_index === 2 ? 'med_003' : 'med_002');
      const med = state.medications.find((m) => m.id === (comp.medication_id || defaultMedId));
      const medName = med ? med.brand_name : (comp.medication_id || 'Prescription medication');
      const compLogs = (state.schedule?.intake_logs || []).filter((l) => l.compartment_index === comp.compartment_index);
      const takenLog = compLogs.filter((l) => l.status === 'TAKEN_ON_TIME' || l.actual_time).slice(-1)[0];

      const item = document.createElement('div');
      item.className = `cg-refill-item ${comp.state === 'TAKEN' ? 'refill-taken' : (comp.state === 'EMPTY' ? 'refill-urgent' : '')}`;

      let badgeClass = 'cg-badge-filled';
      let badgeLabel = '📦 Loaded';
      if (comp.state === 'TAKEN') {
        badgeClass = 'cg-badge-taken';
        badgeLabel = '✅ Taken Today';
      } else if (comp.state === 'EMPTY') {
        badgeClass = 'cg-badge-empty';
        badgeLabel = '⚠️ Needs Refill';
      }

      let detailHtml = '';
      if (comp.state === 'TAKEN') {
        const timeStr = takenLog?.actual_time
          ? new Date(takenLog.actual_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : (comp.compartment_index === 1 ? '08:07' : '19:07');
        detailHtml = `
          <div class="cg-refill-details">
            <span>🕒 Taken at: <strong>${timeStr}</strong></span>
            <span>💊 Contained: <strong>${medName} (1 tablet)</strong></span>
            <span>🔄 Must be refilled with: <strong>${medName}</strong> (for upcoming ${comp.label})</span>
          </div>
        `;
      } else if (comp.state === 'FILLED') {
        detailHtml = `
          <div class="cg-refill-details">
            <span>💊 Currently loaded: <strong>${medName} (1 tablet)</strong></span>
            <span>⏰ Scheduled for: <strong>${comp.target_time}</strong> (Patient lock engaged)</span>
            <span>✅ Status: Ready for John's intake</span>
          </div>
        `;
      } else {
        detailHtml = `
          <div class="cg-refill-details">
            <span>⚪ Empty compartment (${comp.label})</span>
            <span>📥 Recommended medication to load: <strong>${medName}</strong></span>
          </div>
        `;
      }

      item.innerHTML = `
        <div class="cg-refill-item-top">
          <span class="cg-refill-box-tag">Box #${comp.compartment_index} • ${comp.label}</span>
          <span class="cg-refill-status-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        ${detailHtml}
        <div class="cg-refill-action-row">
          ${comp.state === 'TAKEN'
            ? `<button class="btn-refill-action primary" onclick="fillCompartmentAction(${comp.compartment_index}, '${comp.medication_id || defaultMedId}')">Refill ${medName} 📥</button>`
            : (comp.state === 'EMPTY'
                ? `<button class="btn-refill-action primary" onclick="fillCompartmentAction(${comp.compartment_index}, '${defaultMedId}')">Load ${medName} 📥</button>`
                : `<button class="btn-refill-action secondary" onclick="openCompartmentAction(${comp.compartment_index})">Test Open 🔓</button>`
              )
          }
        </div>
      `;
      dom.cgSummaryTableWrap.appendChild(item);
    });
  }
}

function renderTimeline() {
  if (!state.schedule) return;

  const logs = state.schedule.intake_logs || [];
  dom.logsTimeline.innerHTML = '';

  const comp3 = state.pillbox?.compartments?.find((c) => c.compartment_index === 3);
  const isComp3Taken = comp3 && comp3.state === 'TAKEN';

  // If dose is taken, alert is resolved
  const hasMissed = logs.some((l) => l.status === 'MISSED') && !isComp3Taken;
  const hasActiveLed = state.pillbox?.compartments?.some((c) => c.led_active) && !isComp3Taken;

  if (hasMissed || hasActiveLed) {
    const missedLog = logs.find((l) => l.status === 'MISSED');
    const medName = missedLog ? missedLog.medication_name : 'the scheduled medication';
    dom.alertMessage.textContent = `${state.schedule.patient_name} has not taken ${medName} after >30 min delay.`;
    dom.caregiverAlertBanner.classList.remove('hidden');
  } else {
    dom.caregiverAlertBanner.classList.add('hidden');
  }

}

// Render Inbox Messages for both Patient and Caregiver
function renderInboxMessages() {
  const patientMessages = state.messages.filter((m) => m.to === 'PATIENT');
  const caregiverMessages = state.messages.filter((m) => m.to === 'CAREGIVER');

  // Update unread count badges
  const patientUnread = patientMessages.filter((m) => !m.read).length;
  const caregiverUnread = caregiverMessages.filter((m) => !m.read).length;

  dom.patientUnreadBadge.textContent = patientUnread > 0 ? patientUnread : '';
  dom.patientUnreadBadge.classList.toggle('hidden', patientUnread === 0);
  dom.patientInboxBadgeLabel.textContent = patientUnread > 0 ? `${patientUnread} new message${patientUnread > 1 ? 's' : ''}` : 'No unread messages';

  dom.cgUnreadBadge.textContent = caregiverUnread > 0 ? caregiverUnread : '';
  dom.cgUnreadBadge.classList.toggle('hidden', caregiverUnread === 0);

  // 1. Render Patient Inbox
  dom.patientInboxList.innerHTML = '';
  if (patientMessages.length === 0) {
    dom.patientInboxList.innerHTML = '<div class="inbox-card"><span class="inbox-content">You have no messages in your inbox.</span></div>';
  } else {
    patientMessages.forEach((msg) => {
      dom.patientInboxList.appendChild(createMessageCard(msg, true));
    });
  }

  // 2. Render Caregiver Inbox
  dom.caregiverInboxList.innerHTML = '';
  if (caregiverMessages.length === 0) {
    dom.caregiverInboxList.innerHTML = '<div class="inbox-card"><span class="inbox-content">No notifications received.</span></div>';
  } else {
    caregiverMessages.forEach((msg) => {
      dom.caregiverInboxList.appendChild(createMessageCard(msg, false));
    });
  }
}

function createMessageCard(msg, isPatientView) {
  const card = document.createElement('div');
  card.className = `inbox-card type-${msg.type} ${!msg.read ? 'unread' : ''}`;

  const dateStr = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let typeBadge = 'ℹ️ Info';
  if (msg.type === 'REMINDER') typeBadge = '⏰ Reminder';
  if (msg.type === 'ALERT') typeBadge = '🚨 Alert';
  if (msg.type === 'CONFIRMATION') typeBadge = '✅ Confirmation';

  card.innerHTML = `
    <div class="inbox-header">
      <span class="inbox-sender-badge">${msg.sender_name} • ${typeBadge}</span>
      <span class="inbox-time">${dateStr}</span>
    </div>
    <div class="inbox-title">${msg.title}</div>
    <div class="inbox-content">${msg.content}</div>
  `;

  const actionsRow = document.createElement('div');
  actionsRow.className = 'inbox-actions-row';

  // Read out aloud button (Audio TTS in English)
  const readoutBtn = document.createElement('button');
  readoutBtn.className = 'inbox-btn-readout';
  readoutBtn.textContent = 'Read Aloud 🔊';
  readoutBtn.onclick = () => {
    speakText(`Message from ${msg.sender_name}. ${msg.title}. ${msg.content}`);
    markAsRead(msg.id);
  };
  actionsRow.appendChild(readoutBtn);

  if (!msg.read) {
    const markReadBtn = document.createElement('button');
    markReadBtn.className = 'inbox-btn-dismiss';
    markReadBtn.textContent = 'Mark Read ✔';
    markReadBtn.onclick = () => markAsRead(msg.id);
    actionsRow.appendChild(markReadBtn);
  }

  card.appendChild(actionsRow);
  return card;
}

// Display AI Explanation in the Companion Panel
function displayMedicationExplanation(med) {
  if (!med) return;
  state.currentScan = med;

  dom.medBrandName.textContent = med.brand_name;
  dom.medGenericName.textContent = `${med.generic_name} • ${med.dosage} (${med.color}, ${med.shape})`;
  dom.medDot.style.background = med.color === 'white' ? '#ffffff' : (med.color === 'yellow' ? '#fde047' : '#f43f5e');

  dom.medSummary.textContent = `"${med.ai_explanation.summary}"`;
  dom.medInstructions.textContent = med.ai_explanation.simple_instructions;
  dom.medWarnings.textContent = med.ai_explanation.warnings;

  let assignedComp = null;
  if (state.pillbox && state.pillbox.compartments) {
    assignedComp = state.pillbox.compartments.find((c) => compMeds(c).some((m) => m.id === med.id));
  }

  if (assignedComp) {
    dom.guidanceText.innerHTML = `Caregiver assignment: <strong>Compartment ${assignedComp.compartment_index} (${assignedComp.label})</strong>.`;
  } else {
    dom.guidanceText.innerHTML = `No fixed compartment assigned. You can load this into an empty compartment.`;
  }
}

// Caregiver-side scanner: look up a barcode and show the plain-language card
// used to confirm a medicine before loading it into a compartment.
async function scanForCaregiver(barcode) {
  if (!barcode) return;
  try {
    const res = await fetch(apiUrl('/api/scan'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: String(barcode).trim() }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Barcode not recognized', 'alert');
      return;
    }
    const data = await res.json();
    displayMedicationExplanation(data.medication);
    displayCaregiverScan(data.medication, data.assigned_compartment);
    showToast(`✅ ${data.medication.brand_name} recognized`, 'success');
  } catch (err) {
    console.error('Caregiver scan error:', err);
    showToast('Error during medication scan', 'alert');
  }
}

function displayCaregiverScan(med, assignedComp) {
  if (!med || !dom.cgScanResult) return;
  state.currentCgScan = med;

  dom.cgScanName.textContent = med.brand_name;
  dom.cgScanGeneric.textContent = `${med.generic_name} • ${med.dosage} (${med.color}, ${med.shape})`;
  if (dom.cgScanDot) {
    dom.cgScanDot.style.background = med.color === 'white' ? '#ffffff' : (med.color === 'yellow' ? '#fde047' : '#f43f5e');
  }
  dom.cgScanSummary.textContent = `"${med.ai_explanation.summary}"`;
  dom.cgScanInstructions.textContent = med.ai_explanation.simple_instructions;
  dom.cgScanWarnings.textContent = med.ai_explanation.warnings;

  const comp = assignedComp
    || (state.pillbox && state.pillbox.compartments
      ? state.pillbox.compartments.find((c) => compMeds(c).some((m) => m.id === med.id))
      : null);
  const targetIndex = comp ? comp.compartment_index : 2;

  dom.cgScanAssign.innerHTML = comp
    ? `Belongs in <strong>Compartment ${comp.compartment_index} (${comp.label})</strong>.`
    : `No fixed compartment assigned — load into an empty one.`;

  if (dom.btnCgScanLoad) {
    dom.btnCgScanLoad.textContent = `Load into Compartment ${targetIndex}`;
    dom.btnCgScanLoad.onclick = () => fillCompartmentAction(targetIndex, med.id);
  }

  // Pre-select the suggested slot on the wheel, then draw it
  state.cgLoaderSelected = comp ? comp.compartment_index : null;
  renderCgLoader();

  dom.cgScanResult.classList.remove('hidden');
}

// The caregiver's "choose a compartment" wheel: 28 weekly slots, the one at the
// bottom opening dispenses next. Click a slot (or a time-of-day) then Load.
function renderCgLoader() {
  if (!dom.cgLoaderSlots || !state.pillbox || !state.pillbox.compartments) return;
  const comps = state.pillbox.compartments;
  const active = currentSlotIndex();
  const step = 360 / 28;
  const offset = 180 - (active - 1) * step;   // active slot points down to the opening

  dom.cgLoaderSlots.innerHTML = '';
  for (let i = 1; i <= 28; i += 1) {
    const comp = comps.find((c) => c.compartment_index === i);
    const slot = document.createElement('div');
    slot.className = 'clw-slot'
      + (comp && comp.state === 'FILLED' ? ' filled' : '')
      + (i === active ? ' is-active' : '')
      + (i === state.cgLoaderSelected ? ' is-pick' : '');
    slot.style.setProperty('--a', `${(i - 1) * step + offset}deg`);
    slot.title = comp ? comp.label : `Slot ${i}`;
    slot.onclick = () => cgLoaderSelect(i);
    dom.cgLoaderSlots.appendChild(slot);
  }

  const sel = state.cgLoaderSelected || active;
  const selComp = comps.find((c) => c.compartment_index === sel);
  if (dom.cgLoaderHubNum) dom.cgLoaderHubNum.textContent = `#${sel}`;
  if (dom.cgLoaderHubLabel) dom.cgLoaderHubLabel.textContent = selComp ? selComp.label : `Slot ${sel}`;

  if (dom.cgLoaderPeriods) {
    const period = ((sel - 1) % 4) + 1;
    dom.cgLoaderPeriods.querySelectorAll('.clp-btn').forEach((b) => {
      b.classList.toggle('is-active', state.cgLoaderSelected != null && Number(b.dataset.period) === period);
    });
  }

  if (dom.btnCgLoaderLoad) {
    dom.btnCgLoaderLoad.disabled = state.cgLoaderSelected == null || !state.currentCgScan;
    dom.btnCgLoaderLoad.textContent = state.cgLoaderSelected
      ? `📥 Load into Compartment ${state.cgLoaderSelected}`
      : '📥 Load into this compartment';
  }
}

function cgLoaderSelect(idx) {
  state.cgLoaderSelected = idx;
  renderCgLoader();
}

async function cgLoaderLoad() {
  const idx = state.cgLoaderSelected;
  const med = state.currentCgScan;
  if (!idx || !med) return;
  await fillCompartmentAction(idx, med.id);
  const comp = state.pillbox?.compartments?.find((c) => c.compartment_index === idx);
  showToast(`📥 ${med.brand_name} loaded into Compartment ${idx}${comp ? ` (${comp.label})` : ''}.`, 'success');
  speakText(`${med.brand_name} loaded into compartment ${idx}.`);
  renderCgLoader();
  activateTab('tab-cg-pillbox');
}

// ===================================================================
// TEXT-TO-SPEECH (SPEECH SYNTHESIS - ENGLISH)
// ===================================================================

const pocketTtsClips = {
  dosiIntro: '/assets/audio/dosi_intro_mary_cheerful.wav',
};

function resetPocketTtsUi() {
  state.isPocketTtsPlaying = false;
  if (dom.btnPocketTts) dom.btnPocketTts.classList.remove('speaking');
  if (dom.pocketTtsBtnLabel) dom.pocketTtsBtnLabel.textContent = 'Dosi Voice ▶';
}

function stopPocketTts() {
  if (!state.pocketAudio) return;
  state.pocketAudio.pause();
  state.pocketAudio.currentTime = 0;
  resetPocketTtsUi();
}

function playPocketTtsClip(clipName = 'dosiIntro') {
  const clipPath = pocketTtsClips[clipName];
  if (!clipPath) return false;

  if (state.isPocketTtsPlaying) {
    stopPocketTts();
    return true;
  }

  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const audio = state.pocketAudio || new Audio();
  state.pocketAudio = audio;
  audio.src = clipPath;
  audio.currentTime = 0;
  audio.onended = resetPocketTtsUi;
  audio.onerror = () => {
    resetPocketTtsUi();
    showToast('Pocket TTS audio could not be played. Using browser voice instead.', 'alert');
    speakText("Hi, I'm Dosi. I'll guide you step by step when it is time for your medication.");
  };

  state.isPocketTtsPlaying = true;
  if (dom.btnPocketTts) dom.btnPocketTts.classList.add('speaking');
  if (dom.pocketTtsBtnLabel) dom.pocketTtsBtnLabel.textContent = 'Stop Dosi ⏹';

  audio.play().catch(() => {
    resetPocketTtsUi();
    showToast('Tap the Dosi voice button again to allow audio playback.', 'info');
  });
  return true;
}

function speakText(text) {
  const isDemoEmbed = new URLSearchParams(window.location.search).has('demoEmbed');
  if (isDemoEmbed || window.__dosetteDemoSuppressSpeech) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser.', 'alert');
    return;
  }

  stopPocketTts();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.92;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || true));
  if (enVoice) utterance.voice = enVoice;

  utterance.onstart = () => {
    state.isSpeaking = true;
    dom.btnSpeech.classList.add('speaking');
    dom.speechBtnLabel.textContent = 'Stop ⏹️';
  };

  utterance.onend = utterance.onerror = () => {
    state.isSpeaking = false;
    dom.btnSpeech.classList.remove('speaking');
    dom.speechBtnLabel.textContent = 'Read Aloud 🔊';
  };

  window.speechSynthesis.speak(utterance);
}

function toggleMedExplanationSpeech() {
  if (state.isSpeaking) {
    window.speechSynthesis.cancel();
    state.isSpeaking = false;
    dom.btnSpeech.classList.remove('speaking');
    dom.speechBtnLabel.textContent = 'Read Aloud 🔊';
    return;
  }

  const med = state.currentScan;
  if (!med) return;

  const fullText = `This is ${med.brand_name}. ${med.ai_explanation.summary} Instructions: ${med.ai_explanation.simple_instructions} Important warning: ${med.ai_explanation.warnings}`;
  speakText(fullText);
}

// ===================================================================
// ACTIONS: SCAN, OPEN, FILL, ALERT, SEND MESSAGE, RESET
// ===================================================================

async function scanBarcode(barcode) {
  try {
    const res = await fetch(apiUrl('/api/scan'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: barcode.trim() }),
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Barcode not recognized', 'alert');
      return;
    }

    const data = await res.json();
    displayMedicationExplanation(data.medication);
    // Keep the caregiver's "choose a compartment" flow in sync with the scan.
    if (typeof displayCaregiverScan === 'function') {
      displayCaregiverScan(data.medication, data.assigned_compartment);
    }
    showToast(`✅ ${data.medication.brand_name} recognized!`, 'success');
  } catch (err) {
    console.error('Scan error:', err);
    showToast('Error during medication scan', 'alert');
  }
}

async function openCompartmentAction(index) {
  try {
    const res = await fetch(apiUrl('/api/open'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compartment_index: index }),
    });

    if (!res.ok) throw new Error('Could not open compartment');
    playChime();
    await loadInitialData();
    showToast(`🔓 Compartment ${index} opened! Intake logged & notification sent to caregiver.`, 'success');
  } catch (err) {
    console.error('Open error:', err);
    showToast(`Error opening compartment ${index}`, 'alert');
  }
}

async function fillCompartmentAction(index, medId) {
  try {
    const res = await fetch(apiUrl('/api/fill'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compartment_index: index, medication_id: medId }),
    });

    if (!res.ok) throw new Error('Could not fill compartment');
    await loadInitialData();
    showToast(`📥 Compartment ${index} refilled with medication!`, 'info');
  } catch (err) {
    console.error('Fill error:', err);
    showToast(`Error refilling compartment ${index}`, 'alert');
  }
}

async function triggerAlertAction(index = 3, showUserToast = true) {
  try {
    const res = await fetch(apiUrl('/api/alert'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compartment_index: index }),
    });

    if (!res.ok) throw new Error('Could not trigger alert');
    await loadInitialData();
    if (showUserToast) {
      showToast(`🚨 Warning: Compartment ${index} missed (>30m delay)!`, 'alert');
    }
  } catch (err) {
    console.error('Alert error:', err);
  }
}

async function sendCaregiverMessageToPatient() {
  const text = dom.inputCgMessage.value.trim();
  if (!text) {
    showToast('Please type a message first', 'alert');
    return;
  }

  try {
    const res = await fetch(apiUrl('/api/messages'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'CAREGIVER',
        to: 'PATIENT',
        sender_name: 'Sophie (Caregiver)',
        title: 'Reminder from Sophie',
        content: text,
        type: 'REMINDER',
      }),
    });

    if (!res.ok) throw new Error('Failed to send');
    dom.inputCgMessage.value = '';
    await loadInitialData();
    showToast('🚀 Message sent successfully to John!', 'success');
  } catch (err) {
    console.error('Send message error:', err);
    showToast('Error sending message', 'alert');
  }
}

async function markAsRead(id) {
  try {
    await fetch(apiUrl('/api/messages/read'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const msg = state.messages.find((m) => m.id === id);
    if (msg) msg.read = true;
    renderInboxMessages();
  } catch (err) {
    console.error('Mark read error:', err);
  }
}

async function resetDemoData() {
  try {
    const res = await fetch(apiUrl('/api/reset'), { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    await loadInitialData();
    if (state.medications.length > 0) {
      displayMedicationExplanation(state.medications[0]);
    }
    setSimulatedTime('15:00', false);
    showToast('🔄 Demo restored to initial state!', 'info');
  } catch (err) {
    console.error('Reset error:', err);
    showToast('Error resetting demo data', 'alert');
  }
}

// ===================================================================
// CAMERA / WEBCAM & REAL BARCODE SCANNING
// ===================================================================

let barcodeDetector = null;
if ('BarcodeDetector' in window) {
  try {
    barcodeDetector = new BarcodeDetector({
      formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'data_matrix'],
    });
  } catch (e) {
    try { barcodeDetector = new BarcodeDetector(); } catch (_) {}
  }
}

let isScanLoopRunning = false;
function startWebcamScanLoop() {
  if (isScanLoopRunning) return;
  isScanLoopRunning = true;

  async function detectFrame() {
    if (!state.webcamStream || !dom.webcamVideo || dom.webcamVideo.paused || dom.webcamVideo.ended) {
      isScanLoopRunning = false;
      return;
    }

    if (dom.webcamVideo.readyState >= 2 && barcodeDetector) {
      try {
        const barcodes = await barcodeDetector.detect(dom.webcamVideo);
        if (barcodes && barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          if (raw && raw !== state.lastScannedCode) {
            state.lastScannedCode = raw;
            flashScannerSuccess(raw);
            scanBarcode(raw);
            setTimeout(() => { state.lastScannedCode = null; }, 3500);
          }
        }
      } catch (err) {
        // detection frame error
      }
    }

    if (state.webcamStream) {
      requestAnimationFrame(detectFrame);
    } else {
      isScanLoopRunning = false;
    }
  }

  requestAnimationFrame(detectFrame);
}

function flashScannerSuccess(code) {
  playChime();
  if (dom.scannerTargetBox) {
    dom.scannerTargetBox.classList.add('success-pulse');
    setTimeout(() => {
      dom.scannerTargetBox.classList.remove('success-pulse');
    }, 800);
  }
}

async function snapCurrentFrame() {
  if (!state.webcamStream || !dom.webcamVideo || dom.webcamVideo.readyState < 2) {
    showToast('Webcam is not ready yet', 'alert');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = dom.webcamVideo.videoWidth || 640;
  canvas.height = dom.webcamVideo.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(dom.webcamVideo, 0, 0, canvas.width, canvas.height);

  flashScannerSuccess();
  showToast('🎯 Frame captured! Scanning package...', 'info');

  if (barcodeDetector) {
    try {
      const barcodes = await barcodeDetector.detect(canvas);
      if (barcodes && barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        dom.inputBarcode.value = code;
        scanBarcode(code);
        return;
      }
    } catch (e) {
      console.warn('BarcodeDetector frame error:', e);
    }
  }

  // Fallback to active barcode or field value
  const activePreset = document.querySelector('.scan-preset-btn.active');
  const code = (activePreset && activePreset.dataset.barcode) || dom.inputBarcode.value || '3400930000001';
  scanBarcode(code);
}

async function handleImageUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  showToast(`📁 Processing ${file.name}...`, 'info');

  const img = new Image();
  img.onload = async () => {
    flashScannerSuccess();
    if (barcodeDetector) {
      try {
        const barcodes = await barcodeDetector.detect(img);
        if (barcodes && barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          dom.inputBarcode.value = code;
          scanBarcode(code);
          return;
        }
      } catch (err) {
        console.warn('Detector error on uploaded image:', err);
      }
    }

    const filenameCode = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, ' ').trim();
    if (filenameCode) {
      dom.inputBarcode.value = filenameCode;
      scanBarcode(filenameCode);
    } else {
      scanBarcode('3400930000001');
    }
  };
  img.src = URL.createObjectURL(file);
}

async function toggleWebcam() {
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach((t) => t.stop());
    state.webcamStream = null;
    dom.webcamVideo.srcObject = null;
    dom.webcamVideo.classList.add('hidden');
    if (dom.btnCameraSnap) dom.btnCameraSnap.classList.add('hidden');
    if (dom.scannerLiveBadge) dom.scannerLiveBadge.classList.add('hidden');
    dom.btnToggleCamera.textContent = '📷 Start Live Camera';
    showToast('Camera turned off', 'info');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    state.webcamStream = stream;
    dom.webcamVideo.srcObject = stream;
    dom.webcamVideo.classList.remove('hidden');
    if (dom.btnCameraSnap) dom.btnCameraSnap.classList.remove('hidden');
    if (dom.scannerLiveBadge) dom.scannerLiveBadge.classList.remove('hidden');
    dom.btnToggleCamera.textContent = '⏹️ Stop Camera';
    showToast('Live camera feed activated. Point at any medication packaging!', 'info');
    startWebcamScanLoop();
  } catch (err) {
    console.warn('Webcam error:', err);
    showToast('Camera not accessible. You can upload an image or use presets.', 'alert');
  }
}

// ===================================================================
// JURY PITCH STEPS FLOW
// ===================================================================

function runPitchStep(stepNumber) {
  document.querySelectorAll('.pitch-steps .step-btn').forEach((btn) => btn.classList.remove('active-step'));

  if (stepNumber === 1) {
    if (dom.pitchStep1) dom.pitchStep1.classList.add('active-step');
    switchRole('CAREGIVER');
    activateTab('tab-cg-scan');
    dom.btnScanDafalgan.click();
    showToast('Step 1: Caregiver Sophie scans medication box (Dafalgan 1g) to verify & refill!', 'success');
  } else if (stepNumber === 2) {
    if (dom.pitchStep2) dom.pitchStep2.classList.add('active-step');
    toggleMedExplanationSpeech();
    showToast('Step 2: AI explains prescription & recommends pillbox compartment!', 'info');
  } else if (stepNumber === 3) {
    if (dom.pitchStep3) dom.pitchStep3.classList.add('active-step');
    switchRole('CAREGIVER');
    activateTab('tab-cg-pillbox');
    fillCompartmentAction(1, 'med_001');
    showToast('Step 3: Caregiver refilled Compartment 1 (Morning) with Dafalgan 1g!', 'info');
  } else if (stepNumber === 4) {
    if (dom.pitchStep4) dom.pitchStep4.classList.add('active-step');
    switchRole('PATIENT');
    activateTab('tab-patient-today');
    openCompartmentAction(1);
    setTimeout(() => {
      switchRole('CAREGIVER');
      activateTab('tab-cg-timeline');
      showToast('Step 4: Intake confirmed! Caregiver dashboard updated with green checkmark.', 'success');
    }, 600);
  } else if (stepNumber === 'alert') {
    if (dom.pitchStepAlert) dom.pitchStepAlert.classList.add('active-step');
    setSimulatedTime('19:35', true);
    setTimeout(() => {
      switchRole('CAREGIVER');
      activateTab('tab-cg-timeline');
      showToast('🚨 Alert: >30 min delay! Red blinking LED & alarm banner activated.', 'alert');
    }, 400);
  }
}

// ===================================================================
// EVENT LISTENERS
// ===================================================================

function setupEventListeners() {
  // Role Switchers
  dom.btnRolePatient.addEventListener('click', () => switchRole('PATIENT'));
  dom.btnRoleCaregiver.addEventListener('click', () => switchRole('CAREGIVER'));
  dom.btnRoleDevice.addEventListener('click', () => switchRole('DEVICE'));

  // Lockscreen Toggle
  dom.btnToggleLockscreen.addEventListener('click', toggleLockscreen);
  dom.btnUnlockPhone.addEventListener('click', unlockPhone);

  // Layout Toggle
  dom.btnToggleLayout.addEventListener('click', toggleLayoutMode);

  // Senior Mode Toggle
  dom.btnSeniorMode.addEventListener('click', () => {
    state.seniorMode = !state.seniorMode;
    document.body.classList.toggle('senior-mode', state.seniorMode);
    localStorage.setItem('dosette_senior_mode', String(state.seniorMode));
    showToast(state.seniorMode ? 'Senior Mode enabled (extra-large text)' : 'Standard view restored', 'info');
  });

  // Time-Skip Simulator Buttons
  if (dom.btnTs0800) dom.btnTs0800.addEventListener('click', () => setSimulatedTime('08:00'));
  if (dom.btnTs1230) dom.btnTs1230.addEventListener('click', () => setSimulatedTime('12:30'));
  if (dom.btnTs1900) dom.btnTs1900.addEventListener('click', () => setSimulatedTime('19:00'));
  if (dom.btnTs1910) dom.btnTs1910.addEventListener('click', () => setSimulatedTime('19:10'));
  if (dom.btnTs1935) dom.btnTs1935.addEventListener('click', () => setSimulatedTime('19:35'));
  if (dom.btnTsPlus30) dom.btnTsPlus30.addEventListener('click', advanceTimeBy30Minutes);
  dom.btnResetData.addEventListener('click', resetDemoData);

  // Pitch Flow
  if (dom.pitchStep1) dom.pitchStep1.addEventListener('click', () => runPitchStep(1));
  if (dom.pitchStep2) dom.pitchStep2.addEventListener('click', () => runPitchStep(2));
  if (dom.pitchStep3) dom.pitchStep3.addEventListener('click', () => runPitchStep(3));
  if (dom.pitchStep4) dom.pitchStep4.addEventListener('click', () => runPitchStep(4));
  if (dom.pitchStepAlert) dom.pitchStepAlert.addEventListener('click', () => runPitchStep('alert'));

  // Bottom Navigation Tabs
  document.querySelectorAll('.bottom-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (tabId) activateTab(tabId);
    });
  });

  // Navigation Shortcuts
  if (dom.btnPatientGotoSchedule) dom.btnPatientGotoSchedule.addEventListener('click', () => activateTab('tab-patient-schedule'));
  if (dom.btnPatientGotoScan) dom.btnPatientGotoScan.addEventListener('click', () => activateTab('tab-cg-scan'));
  if (dom.btnPatientGotoInbox) dom.btnPatientGotoInbox.addEventListener('click', () => {
    lockPhone();
  });
  if (dom.btnCgGotoScan) dom.btnCgGotoScan.addEventListener('click', () => activateTab('tab-cg-scan'));

  // Patient Back Buttons & Lockscreen Shortcuts
  if (dom.btnPatientScheduleBack) dom.btnPatientScheduleBack.addEventListener('click', () => activateTab('tab-patient-today'));
  if (dom.btnPatientInboxBack) dom.btnPatientInboxBack.addEventListener('click', () => activateTab('tab-patient-today'));
  if (dom.btnPatientHelpBack) dom.btnPatientHelpBack.addEventListener('click', () => activateTab('tab-patient-today'));
  if (dom.btnPatientInboxLock) dom.btnPatientInboxLock.addEventListener('click', lockPhone);

  // Scanner Presets, Camera Snap & File Upload
  dom.btnScanDafalgan.addEventListener('click', () => {
    document.querySelectorAll('.scan-preset-btn').forEach((b) => b.classList.remove('active'));
    dom.btnScanDafalgan.classList.add('active');
    dom.inputBarcode.value = dom.btnScanDafalgan.dataset.barcode;
    scanBarcode(dom.btnScanDafalgan.dataset.barcode);
  });

  dom.btnScanLipitor.addEventListener('click', () => {
    document.querySelectorAll('.scan-preset-btn').forEach((b) => b.classList.remove('active'));
    dom.btnScanLipitor.classList.add('active');
    dom.inputBarcode.value = dom.btnScanLipitor.dataset.barcode;
    scanBarcode(dom.btnScanLipitor.dataset.barcode);
  });

  if (dom.btnScanAsaflow) {
    dom.btnScanAsaflow.addEventListener('click', () => {
      document.querySelectorAll('.scan-preset-btn').forEach((b) => b.classList.remove('active'));
      dom.btnScanAsaflow.classList.add('active');
      dom.inputBarcode.value = dom.btnScanAsaflow.dataset.barcode;
      scanBarcode(dom.btnScanAsaflow.dataset.barcode);
    });
  }

  if (dom.btnScanAmoxicillin) {
    dom.btnScanAmoxicillin.addEventListener('click', () => {
      document.querySelectorAll('.scan-preset-btn').forEach((b) => b.classList.remove('active'));
      dom.btnScanAmoxicillin.classList.add('active');
      dom.inputBarcode.value = dom.btnScanAmoxicillin.dataset.barcode;
      scanBarcode(dom.btnScanAmoxicillin.dataset.barcode);
    });
  }

  if (dom.btnCameraSnap) {
    dom.btnCameraSnap.addEventListener('click', snapCurrentFrame);
  }

  if (dom.inputScanImage) {
    dom.inputScanImage.addEventListener('change', handleImageUpload);
  }

  dom.btnCustomScan.addEventListener('click', () => {
    if (dom.inputBarcode.value) scanBarcode(dom.inputBarcode.value);
  });

  dom.inputBarcode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && dom.inputBarcode.value) scanBarcode(dom.inputBarcode.value);
  });

  dom.btnToggleCamera.addEventListener('click', toggleWebcam);
  if (dom.btnPocketTts) {
    dom.btnPocketTts.addEventListener('click', () => playPocketTtsClip('dosiIntro'));
  }
  dom.btnSpeech.addEventListener('click', toggleMedExplanationSpeech);

  // Patient Emergency Calls — one helper wired to every call button on the
  // patient app (the simple home shortcuts AND the Help & Contacts tab).
  function patientPlaceCall(spoken, popup) {
    speakText(spoken);
    showToast(popup, 'success');
    alert(popup);
  }
  const callSophie = () => patientPlaceCall(
    'Calling caregiver Sophie Dupont.',
    '📞 Calling Sophie Dupont (+32 470 12 34 56)...',
  );
  const callDoctor = () => patientPlaceCall(
    'Calling family physician Dr. Peeters.',
    '👨‍⚕️ Calling Family Doctor Dr. Peeters (+32 2 555 01 99)...',
  );
  const callPharmacy = () => patientPlaceCall(
    'Calling Central Pharmacy.',
    '💊 Calling Central Pharmacy (+32 2 555 01 44)...',
  );
  const call112 = () => patientPlaceCall(
    'Calling emergency services. One one two.',
    '🚨 Calling Emergency Services (112)...',
  );

  [dom.btnPatientCallSophie, dom.btnPatientDirectSophie].forEach((b) => b && b.addEventListener('click', callSophie));
  [dom.btnPatientCallDoctor, dom.btnPatientDirectDoctor].forEach((b) => b && b.addEventListener('click', callDoctor));
  if (dom.btnPatientCallPharmacy) dom.btnPatientCallPharmacy.addEventListener('click', callPharmacy);
  [dom.btnPatientCall112, dom.btnPatientDirect112].forEach((b) => b && b.addEventListener('click', call112));

  // Caregiver Messaging Form
  document.querySelectorAll('.preset-msg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.inputCgMessage.value = btn.dataset.text;
      dom.inputCgMessage.focus();
    });
  });

  dom.btnSendMessageToPatient.addEventListener('click', sendCaregiverMessageToPatient);

  // Caregiver Hardware Simulator Buttons
  dom.btnCliOpen1.addEventListener('click', () => openCompartmentAction(1));
  dom.btnCliOpen3.addEventListener('click', () => openCompartmentAction(3));
  dom.btnCliTriggerAlert.addEventListener('click', () => triggerAlertAction(3));

  // Caregiver Scanner
  if (dom.btnCgScanDafalgan) dom.btnCgScanDafalgan.addEventListener('click', () => scanForCaregiver('3400930000001'));
  if (dom.btnCgScanLipitor) dom.btnCgScanLipitor.addEventListener('click', () => scanForCaregiver('3400930000002'));

  // Caregiver compartment wheel
  if (dom.cgLoaderPeriods) {
    dom.cgLoaderPeriods.addEventListener('click', (e) => {
      const b = e.target.closest('.clp-btn');
      if (b) cgLoaderSelect(Number(b.dataset.period));   // period 1-4 = today's slot 1-4
    });
  }
  if (dom.btnCgLoaderLoad) dom.btnCgLoaderLoad.addEventListener('click', cgLoaderLoad);
  if (dom.btnCgCustomScan) dom.btnCgCustomScan.addEventListener('click', () => scanForCaregiver(dom.inputCgBarcode ? dom.inputCgBarcode.value : ''));
  if (dom.inputCgBarcode) {
    dom.inputCgBarcode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') scanForCaregiver(dom.inputCgBarcode.value);
    });
  }
  if (dom.btnCgScanSpeak) {
    dom.btnCgScanSpeak.addEventListener('click', () => {
      const med = state.currentCgScan;
      if (!med) return;
      speakText(`This is ${med.brand_name}. ${med.ai_explanation.summary} How to take it: ${med.ai_explanation.simple_instructions} Important warning: ${med.ai_explanation.warnings}`);
    });
  }

  // Caregiver Alert Banner Actions
  dom.btnCallPatient.addEventListener('click', () => {
    alert('📞 Calling John Dupont directly (+32 470 99 88 77)...');
  });

  dom.btnDismissAlert.addEventListener('click', () => {
    dom.caregiverAlertBanner.classList.add('hidden');
    showToast('Alert acknowledged by caregiver', 'info');
  });

  // Terminal Modal
  dom.btnOpenTerminalHint.addEventListener('click', () => dom.terminalModal.classList.remove('hidden'));
  dom.btnCloseModal.addEventListener('click', () => dom.terminalModal.classList.add('hidden'));
  dom.btnModalOk.addEventListener('click', () => dom.terminalModal.classList.add('hidden'));
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'alert') icon = '🚨';

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// Expose key functions for multi-device demo console & embeds
window.lockPhone = lockPhone;
window.unlockPhone = unlockPhone;
window.toggleLockscreen = toggleLockscreen;
window.isLocked = () => state.isLocked;
window.switchRole = switchRole;
window.activateTab = activateTab;
window.setSimulatedTime = setSimulatedTime;
window.openCompartmentAction = openCompartmentAction;
window.fillCompartmentAction = fillCompartmentAction;
window.triggerAlertAction = triggerAlertAction;
window.loadInitialData = loadInitialData;
window.renderAll = renderAll;
window.renderLockscreenNotifications = renderLockscreenNotifications;
