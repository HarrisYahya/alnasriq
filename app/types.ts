export interface Patient {
  id: number;
  patient_name: string;
  stage: string;
  service: string; // stored as comma-separated string in Supabase
  status: 'waiting' | 'done';
  ticket: number;
  inserted_at: string; // keep this here
}

export interface NewPatient {
  patient_name: string;
  stage: string;
  service: string[]; // array in React state for multi-select
  status: string;
  inserted_at?: string; // make optional
}
