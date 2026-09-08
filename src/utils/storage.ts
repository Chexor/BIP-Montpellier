import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Medication, PillboxStatus, ScheduleAndLogs, InboxMessage } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the data directory relative to the repository root
function getDataDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../data'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  const fallback = path.resolve(process.cwd(), 'data');
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

const DATA_DIR = getDataDir();

const MEDICATIONS_FILE = path.join(DATA_DIR, 'medications.json');
const PILLBOX_STATUS_FILE = path.join(DATA_DIR, 'pillbox_status.json');
const SCHEDULE_LOGS_FILE = path.join(DATA_DIR, 'schedule_and_logs.json');
const INBOX_MESSAGES_FILE = path.join(DATA_DIR, 'inbox_messages.json');

export const INITIAL_DATA = {
  medications: [
    {
      id: 'med_001',
      barcode: '3400930000001',
      brand_name: 'Dafalgan 1g',
      generic_name: 'Paracetamol',
      ai_explanation: {
        summary: 'For pain relief and reducing fever.',
        simple_instructions: 'Take 1 tablet with a large glass of water when in pain. Maximum 3 times per day.',
        warnings: 'Do not drink alcohol. Wait at least 4 hours between doses.',
      },
      dosage: '1 tablet',
      color: 'white',
      shape: 'oval',
    },
    {
      id: 'med_002',
      barcode: '3400930000002',
      brand_name: 'Lipitor 20mg',
      generic_name: 'Atorvastatin',
      ai_explanation: {
        summary: 'Lowers cholesterol levels in your blood to protect your heart.',
        simple_instructions: 'Take 1 tablet every evening with water, with or without food.',
        warnings: 'Do not drink with grapefruit juice.',
      },
      dosage: '1 tablet',
      color: 'white',
      shape: 'round',
    },
  ] as Medication[],

  pillbox_status: {
    device_id: 'dosette_box_42',
    battery_level: 88,
    last_synced: '2026-09-08T12:00:00Z',
    compartments: [
      {
        compartment_index: 1,
        label: 'Morning (08:00)',
        medication_id: 'med_001',
        pills_count: 1,
        state: 'FILLED',
        target_time: '08:00',
        led_active: false,
      },
      {
        compartment_index: 2,
        label: 'Noon (12:30)',
        medication_id: null,
        pills_count: 0,
        state: 'EMPTY',
        target_time: '12:30',
        led_active: false,
      },
      {
        compartment_index: 3,
        label: 'Evening (19:00)',
        medication_id: 'med_002',
        pills_count: 1,
        state: 'FILLED',
        target_time: '19:00',
        led_active: false,
      },
    ],
  } as PillboxStatus,

  schedule_and_logs: {
    patient_name: 'Jean Dupont',
    caregiver_contact: '+32470123456',
    intake_logs: [
      {
        id: 'log_101',
        scheduled_time: '2026-09-08T08:00:00Z',
        actual_time: '2026-09-08T08:07:22Z',
        compartment_index: 1,
        medication_name: 'Dafalgan 1g',
        status: 'TAKEN_ON_TIME',
        caregiver_notified: true,
      },
      {
        id: 'log_102',
        scheduled_time: '2026-09-08T19:00:00Z',
        actual_time: null,
        compartment_index: 3,
        medication_name: 'Lipitor 20mg',
        status: 'PENDING',
        caregiver_notified: false,
      },
    ],
  } as ScheduleAndLogs,

  inbox_messages: [
    {
      id: 'msg_001',
      from: 'CAREGIVER',
      to: 'PATIENT',
      sender_name: 'Sophie (Daughter)',
      title: 'Evening Reminder',
      content: "Hi Dad, don't forget to take your Lipitor with dinner tonight! I'll visit tomorrow afternoon with the groceries. Love, Sophie ❤️",
      type: 'REMINDER',
      timestamp: '2026-09-08T11:30:00Z',
      read: false,
    },
    {
      id: 'msg_002',
      from: 'SYSTEM_PILLBOX',
      to: 'CAREGIVER',
      sender_name: 'Dosette Smart Pillbox',
      title: 'Morning Dose Taken on Time',
      content: 'Jean took Dafalgan 1g (Compartment 1) on time at 08:07.',
      type: 'CONFIRMATION',
      timestamp: '2026-09-08T08:07:22Z',
      read: true,
      medication_name: 'Dafalgan 1g',
      compartment_index: 1,
    },
  ] as InboxMessage[],
};

export function loadMedications(): Medication[] {
  if (!fs.existsSync(MEDICATIONS_FILE)) {
    saveMedications(INITIAL_DATA.medications);
    return INITIAL_DATA.medications;
  }
  const content = fs.readFileSync(MEDICATIONS_FILE, 'utf-8');
  return JSON.parse(content);
}

export function saveMedications(medications: Medication[]): void {
  fs.writeFileSync(MEDICATIONS_FILE, JSON.stringify(medications, null, 2), 'utf-8');
}

export function loadPillboxStatus(): PillboxStatus {
  if (!fs.existsSync(PILLBOX_STATUS_FILE)) {
    savePillboxStatus(INITIAL_DATA.pillbox_status);
    return INITIAL_DATA.pillbox_status;
  }
  const content = fs.readFileSync(PILLBOX_STATUS_FILE, 'utf-8');
  return JSON.parse(content);
}

export function savePillboxStatus(status: PillboxStatus): void {
  fs.writeFileSync(PILLBOX_STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
}

export function loadScheduleAndLogs(): ScheduleAndLogs {
  if (!fs.existsSync(SCHEDULE_LOGS_FILE)) {
    saveScheduleAndLogs(INITIAL_DATA.schedule_and_logs);
    return INITIAL_DATA.schedule_and_logs;
  }
  const content = fs.readFileSync(SCHEDULE_LOGS_FILE, 'utf-8');
  return JSON.parse(content);
}

export function saveScheduleAndLogs(schedule: ScheduleAndLogs): void {
  fs.writeFileSync(SCHEDULE_LOGS_FILE, JSON.stringify(schedule, null, 2), 'utf-8');
}

export function fillCompartment(
  index: number,
  medicationId?: string,
  pillsCount: number = 1
): { success: boolean; message: string; compartment?: any } {
  const pillbox = loadPillboxStatus();
  const comp = pillbox.compartments.find((c) => c.compartment_index === index);
  if (!comp) {
    return { success: false, message: `Vakje ${index} bestaat niet op dit apparaat.` };
  }

  if (medicationId) {
    comp.medication_id = medicationId;
  }
  comp.state = 'FILLED';
  comp.pills_count = pillsCount;
  comp.led_active = false;
  pillbox.last_synced = new Date().toISOString();
  savePillboxStatus(pillbox);

  // Notify any running companion server in background
  void notifyServerEvent('data_updated', { type: 'FILL', index });

  return {
    success: true,
    message: `Vakje ${index} (${comp.label}) is succesvol gevuld.`,
    compartment: comp,
  };
}

export async function notifyServerEvent(event: string, payload?: unknown): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 400);
    await fetch('http://127.0.0.1:3000/api/internal/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Server is not running or unreachable, gracefully ignore
  }
}

export function loadInboxMessages(): InboxMessage[] {
  if (!fs.existsSync(INBOX_MESSAGES_FILE)) {
    saveInboxMessages(INITIAL_DATA.inbox_messages);
    return INITIAL_DATA.inbox_messages;
  }
  const content = fs.readFileSync(INBOX_MESSAGES_FILE, 'utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return INITIAL_DATA.inbox_messages;
  }
}

export function saveInboxMessages(messages: InboxMessage[]): void {
  fs.writeFileSync(INBOX_MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
}

export function addInboxMessage(msgData: {
  from: 'PATIENT' | 'CAREGIVER' | 'SYSTEM_PILLBOX';
  to: 'PATIENT' | 'CAREGIVER';
  sender_name: string;
  title: string;
  content: string;
  type?: 'ALERT' | 'INFO' | 'REMINDER' | 'CONFIRMATION';
  medication_name?: string;
  compartment_index?: number;
}): InboxMessage {
  const messages = loadInboxMessages();
  const newMessage: InboxMessage = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    from: msgData.from,
    to: msgData.to,
    sender_name: msgData.sender_name,
    title: msgData.title,
    content: msgData.content,
    type: msgData.type || 'INFO',
    timestamp: new Date().toISOString(),
    read: false,
    medication_name: msgData.medication_name,
    compartment_index: msgData.compartment_index,
  };
  messages.unshift(newMessage);
  saveInboxMessages(messages);
  void notifyServerEvent('message_created', { message: newMessage });
  return newMessage;
}

export function markMessageRead(id: string): boolean {
  const messages = loadInboxMessages();
  const msg = messages.find((m) => m.id === id);
  if (msg) {
    msg.read = true;
    saveInboxMessages(messages);
    void notifyServerEvent('message_read', { id });
    return true;
  }
  return false;
}

export function resetAllData(): void {
  saveMedications(INITIAL_DATA.medications);
  savePillboxStatus(INITIAL_DATA.pillbox_status);
  saveScheduleAndLogs(INITIAL_DATA.schedule_and_logs);
  saveInboxMessages(INITIAL_DATA.inbox_messages);
  void notifyServerEvent('data_updated', { type: 'RESET' });
}


