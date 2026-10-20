export type ServiceId = 'umum' | 'gigi' | 'kia' | 'mata' | 'farmasi' | 'kasir';

export interface ServiceConfig {
  id: ServiceId;
  code: string; // 'A', 'B', 'C', 'D', 'E', 'K'
  name: string;
  description: string;
  doctorName: string;
  specialistTitle: string;
  roomName: string;
  counterNumber: number;
  avgTimeMin: number;
  badgeColor: string;
}

export type TicketStatus = 'waiting' | 'calling' | 'in_consultation' | 'completed' | 'skipped';
export type PatientCategory = 'BPJS' | 'Umum' | 'Asuransi';
export type PriorityLevel = 'regular' | 'priority';

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "A-012"
  serviceId: ServiceId;
  serviceCode: string; // e.g. "A"
  sequenceNumber: number;
  patientName: string;
  patientCategory: PatientCategory;
  phone?: string;
  priority: PriorityLevel;
  status: TicketStatus;
  createdAt: string; // ISO date string
  calledAt: string | null;
  completedAt: string | null;
  counterNumber: number;
  doctorNotes?: string;
  referredTo?: 'farmasi' | 'kasir' | null;
  referredPharmacyTicketNumber?: string;
}

export interface ClinicSettings {
  clinicName: string;
  clinicTagline: string;
  clinicAddress: string;
  clinicPhone: string;
  runningText: string;
  audioVoiceEnabled: boolean;
  audioSpeechRate: number;
  audioBellVolume: number;
}

export interface CallEvent {
  ticketNumber: string;
  serviceName: string;
  roomName: string;
  counterNumber: number;
  patientName: string;
  timestamp: string;
}
