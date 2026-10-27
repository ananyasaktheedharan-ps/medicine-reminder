export type DoseStatus = "taken" | "missed" | "snoozed";

export interface User {
  id: string;
  name: string;
  email: string;
}

/** A person whose medicines are managed: the user themselves or a family member. */
export interface Profile {
  id: string;
  name: string;
  relation: string; // "Self", "Mother", "Father", ...
  email?: string;
  isSelf: boolean;
}

export interface Medicine {
  id: string;
  profileId: string;
  name: string;
  dosage: string; // e.g. "500 mg"
  form: string; // Tablet, Capsule, Syrup...
  times: string[]; // "HH:MM" 24h
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  notes?: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM scheduled time
  status: DoseStatus;
  snoozeUntil?: number; // epoch ms
  updatedAt: number;
}

export interface DoseItem {
  key: string;
  medicine: Medicine;
  date: string;
  time: string;
  scheduledAt: number; // epoch ms
  log?: DoseLog;
}
