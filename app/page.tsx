'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Patient, NewPatient } from './types';
import PatientInput from './components/PatientInput';
import PatientTable from './components/PatientTable';
import ConfirmModal from './components/ConfirmModal';
import UndoToast from './components/UndoToast';
import Link from 'next/link';


export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedBackup, setDeletedBackup] = useState<Patient[]>([]);
  const [singleDeleted, setSingleDeleted] = useState<Patient | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const undoTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const [newPatient, setNewPatient] = useState<NewPatient>({
    patient_name: '',
    stage: 'Cusub',
    service: [],
    status: 'waiting',
  });

  // === Fetch patients (last 24h only) ===
  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('ticket', { ascending: true });

    if (!error && data) {
      const now = new Date();
      const last24hPatients = (data as Patient[]).filter(p => {
        const inserted = new Date((p as any).inserted_at); // inserted_at from DB
        return now.getTime() - inserted.getTime() <= 24 * 60 * 60 * 1000;
      });
      setPatients(last24hPatients);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, []);

  const getNextTicket = () => (patients.length === 0 ? 1 : Math.max(...patients.map(p => p.ticket)) + 1);

   // === Add patient ===
const addPatient = async () => {
  if (!newPatient.patient_name.trim()) return alert('Please enter a patient name.');
  if (!newPatient.service.length) return alert('Please select at least one service.');

  const ticketNumber = getNextTicket();
  const patientToInsert = {
    ...newPatient,
    patient_name: newPatient.patient_name.trim(),
    service: newPatient.service.join(','), // join array into string
    ticket: ticketNumber,
    status: 'pending', // updated to match interface
    inserted_at: new Date().toISOString(), // timestamp
  };

  await supabase.from('patients').insert([patientToInsert]);
  setNewPatient({ patient_name: '', stage: 'Cusub', service: [], status: 'pending' }); // reset with correct status
  fetchPatients();
};

  // === Toggle status ===
  const toggleStatus = async (id: number, current: string) => {
    await supabase
      .from('patients')
      .update({ status: current === 'waiting' ? 'done' : 'waiting' })
      .eq('id', id);
    fetchPatients();
  };

  // === Delete single patient + undo ===
  const deletePatient = async (id: number) => {
    if (!confirm('Delete this patient?')) return;
    const p = patients.find(p => p.id === id);
    if (!p) return;
    setSingleDeleted(p);
    await supabase.from('patients').delete().eq('id', id);
    fetchPatients();
    startUndoTimer(30, () => setSingleDeleted(null));
  };

  const undoSingleDelete = async () => {
    if (!singleDeleted) return;
    const { id, ...rest } = singleDeleted;
    await supabase.from('patients').insert([rest]);
    setSingleDeleted(null);
    clearTimers();
    fetchPatients();
  };

  // === Delete all patients + undo ===
  const deleteAllPatients = async () => {
    setConfirmOpen(false);
    if (!patients.length) return alert('No patients to delete.');
    setDeletedBackup(patients);
    await supabase.from('patients').delete().neq('id', 0);
    fetchPatients();
    startUndoTimer(600, () => setDeletedBackup([]));
  };

  const undoDeleteAll = async () => {
    if (!deletedBackup.length) return alert('Nothing to undo.');
    const restored = deletedBackup.map(({ id, ...rest }) => rest);
    await supabase.from('patients').insert(restored);
    setDeletedBackup([]);
    clearTimers();
    fetchPatients();
  };

  // === Undo timer helpers ===
  const startUndoTimer = (seconds: number, onExpire: () => void) => {
    clearTimers();
    setCountdown(seconds);
    undoTimerRef.current = window.setTimeout(() => {
      onExpire();
      setCountdown(0);
    }, seconds * 1000);
    countdownRef.current = window.setInterval(() => {
      setCountdown(c => (c <= 1 ? 0 : c - 1));
    }, 1000);
  };

  const clearTimers = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const formatSeconds = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex items-center justify-between mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400">Alnasri Patient List</h1>
        <div className="flex items-center gap-3">
          {deletedBackup.length > 0 && (
            <button
              onClick={undoDeleteAll}
              className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Undo Delete ({formatSeconds(countdown)})
            </button>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Delete All
          </button>
             <Link
              href="/components/all-patients"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              View All Patients
            </Link>
        </div>
      </div>

      <PatientInput newPatient={newPatient} setNewPatient={setNewPatient} addPatient={addPatient} />
      <PatientTable
        patients={patients}
        loading={loading}
        toggleStatus={toggleStatus}
        deletePatient={deletePatient}
      />
      <ConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={deleteAllPatients} />
      <UndoToast
        deletedBackup={deletedBackup}
        singleDeleted={singleDeleted}
        countdown={countdown}
        formatSeconds={formatSeconds}
        undoDeleteAll={undoDeleteAll}
        undoSingleDelete={undoSingleDelete}
        clearUndo={() => {
          setDeletedBackup([]);
          setSingleDeleted(null);
          setCountdown(0);
        }}
      />
    </main>
  );
}
