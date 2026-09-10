export interface AiExplanation {
  summary: string;
  simple_instructions: string;
  warnings: string;
}

export interface Medication {
  id: string;
  barcode: string;
  brand_name: string;
  generic_name: string;
  ai_explanation: AiExplanation;
  dosage: string;
  color: string;
  shape: string;
}

export type CompartmentState = 'FILLED' | 'EMPTY' | 'TAKEN';

export interface Compartment {
  compartment_index: number;
  label: string;
  /** primary medicine (first of medication_ids) — kept for backward compatibility */
  medication_id: string | null;
  /** full list when a compartment holds more than one medicine */
  medication_ids?: string[];
  pills_count: number;
  state: CompartmentState;
  target_time: string;
  led_active: boolean;
}

export interface PillboxStatus {
  device_id: string;
  battery_level: number;
  last_synced: string;
  compartments: Compartment[];
}

export type IntakeStatus = 'TAKEN_ON_TIME' | 'PENDING' | 'MISSED' | 'LATE';

export interface IntakeLog {
  id: string;
  scheduled_time: string;
  actual_time: string | null;
  compartment_index: number;
  medication_name: string;
  status: IntakeStatus;
  caregiver_notified: boolean;
}

export interface ScheduleAndLogs {
  patient_name: string;
  caregiver_contact: string;
  intake_logs: IntakeLog[];
}

export type UserRole = 'PATIENT' | 'CAREGIVER';

export type MessageType = 'ALERT' | 'INFO' | 'REMINDER' | 'CONFIRMATION';

export interface InboxMessage {
  id: string;
  from: 'PATIENT' | 'CAREGIVER' | 'SYSTEM_PILLBOX';
  to: 'PATIENT' | 'CAREGIVER';
  sender_name: string;
  title: string;
  content: string;
  type: MessageType;
  timestamp: string;
  read: boolean;
  medication_name?: string;
  compartment_index?: number;
}

