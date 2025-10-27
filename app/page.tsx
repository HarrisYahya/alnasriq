 'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // backups for undo
  const [deletedBackup, setDeletedBackup] = useState<any[]>([]);
  const [singleDeleted, setSingleDeleted] = useState<any | null>(null);

  const undoTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [newPatient, setNewPatient] = useState({
    patient_name: '',
    stage: 'Cusub',
    service: 'Gelin',
    status: 'waiting',
  });

  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('ticket', { ascending: true });
    if (!error && data) setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, []);

  // Generate ticket numbers that restart from 1
  const getNextTicket = () => {
    if (patients.length === 0) return 1;
    const tickets = patients.map((p) => p.ticket);
    return Math.max(...tickets) + 1;
  };

  const addPatient = async () => {
    // validate name is present
    if (!newPatient.patient_name || newPatient.patient_name.trim() === '') {
      alert('Please enter a patient name.');
      return;
    }

    const ticketNumber = getNextTicket();
    const patientToInsert = { ...newPatient, patient_name: newPatient.patient_name.trim(), ticket: ticketNumber };
    await supabase.from('patients').insert([patientToInsert]);
    setNewPatient({ patient_name: '', stage: 'Cusub', service: 'Gelin', status: 'waiting' });
    fetchPatients();
  };

  // SINGLE DELETE + UNDO (30 seconds)
  const deletePatient = async (id: number) => {
    if (!confirm('Delete this patient?')) return;
    const patientToDelete = patients.find((p) => p.id === id);
    if (!patientToDelete) return;

    setSingleDeleted(patientToDelete);
    await supabase.from('patients').delete().eq('id', id);
    fetchPatients();

    // start 30 sec undo
    const UNDO_SECONDS = 30;
    setCountdown(UNDO_SECONDS);

    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);

    undoTimerRef.current = window.setTimeout(() => {
      setSingleDeleted(null);
      setCountdown(0);
      undoTimerRef.current = null;
    }, UNDO_SECONDS * 1000);

    countdownRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const undoSingleDelete = async () => {
    if (!singleDeleted) return;
    const { id, ...rest } = singleDeleted;
    await supabase.from('patients').insert([rest]);
    setSingleDeleted(null);
    setCountdown(0);
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    fetchPatients();
  };

  const toggleStatus = async (id: number, current: string) => {
    await supabase
      .from('patients')
      .update({ status: current === 'waiting' ? 'done' : 'waiting' })
      .eq('id', id);
    fetchPatients();
  };

  // ===== Delete All + Undo (10 mins) =====
  const openDeleteAllConfirm = () => setConfirmOpen(true);
  const closeDeleteAllConfirm = () => setConfirmOpen(false);

  const deleteAllPatients = async () => {
    closeDeleteAllConfirm();
    if (patients.length === 0) {
      alert('No patients to delete.');
      return;
    }

    setDeletedBackup(patients);
    await supabase.from('patients').delete().neq('id', 0);
    await fetchPatients();

    const UNDO_SECONDS = 600;
    setCountdown(UNDO_SECONDS);

    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);

    undoTimerRef.current = window.setTimeout(() => {
      setDeletedBackup([]);
      setCountdown(0);
    }, UNDO_SECONDS * 1000);

    countdownRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const undoDeleteAll = async () => {
    if (deletedBackup.length === 0) {
      alert('Nothing to undo.');
      return;
    }

    const restored = deletedBackup.map(({ id, ...rest }) => rest);
    await supabase.from('patients').insert(restored);
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    setDeletedBackup([]);
    setCountdown(0);
    fetchPatients();
  };

  // format time
  const formatSeconds = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex items-center justify-between mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
          Alnasri Patient List
        </h1>
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
            onClick={openDeleteAllConfirm}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[#1a1f2e] w-full max-w-6xl rounded-2xl p-6 mb-6 shadow-lg flex flex-wrap items-center justify-center gap-4">
        <input
          name="patient_name"
          aria-label="Patient Name"
          required
          placeholder="Patient Name"
          value={newPatient.patient_name}
          onChange={(e) => setNewPatient({ ...newPatient, patient_name: e.target.value })}
          className="flex-1 min-w-[200px] p-3 rounded-lg bg-[#0f172a] border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <select
          value={newPatient.stage}
          onChange={(e) => setNewPatient({ ...newPatient, stage: e.target.value })}
          className="p-3 rounded-lg bg-[#0f172a] border border-yellow-500 text-yellow-400"
        >
          <option>Cusub</option>
          <option>14 malin</option>
          <option>7 malin</option>
          <option>Raajo</option>
        </select>
        <select
          value={newPatient.service}
          onChange={(e) => setNewPatient({ ...newPatient, service: e.target.value })}
          className="p-3 rounded-lg bg-[#0f172a] border border-yellow-500 text-yellow-400"
        >
          <option>Gelin</option>
          <option>Buuxin</option>
          <option>Xirid</option>
          <option>Dhaqid</option>
          <option>Bedel</option>
        </select>
        <button
          onClick={addPatient}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg transition-all duration-200"
        >
          Add
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-[#1a1f2e] w-full max-w-6xl rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-center text-sm sm:text-base">
          <thead>
            <tr className="bg-[#0f172a] text-yellow-400 uppercase">
              <th className="py-3 px-2">Ticket #</th>
              <th className="py-3 px-2">Name</th>
              <th className="py-3 px-2">Stage</th>
              <th className="py-3 px-2">Service</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-6 text-gray-400">Loading...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-gray-500">No patients yet</td></tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id} className="border-t border-gray-700 hover:bg-gray-800/40 transition-all">
                  <td className="py-3">{p.ticket}</td>
                  <td>{p.patient_name}</td>
                  <td>{p.stage}</td>
                  <td>{p.service}</td>
                  <td className={p.status === 'done' ? 'text-green-400' : 'text-yellow-400'}>
                    {p.status}
                  </td>
                  <td>
                    <button onClick={() => toggleStatus(p.id, p.status)} className="text-yellow-400 hover:text-white mx-2 transition-colors">Toggle</button>
                    <button onClick={() => deletePatient(p.id)} className="text-red-400 hover:text-white mx-2 transition-colors">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#0b1020] rounded-xl p-6 w-[90%] max-w-md text-center shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-red-400 mb-3">Confirm Delete All</h3>
            <p className="text-sm text-gray-300 mb-6">
              This will permanently delete all patients. Undo available for 10 minutes. Continue?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={deleteAllPatients} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold">Yes, delete all</button>
              <button onClick={closeDeleteAllConfirm} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toasts */}
      {deletedBackup.length > 0 && (
        <div className="fixed left-4 bottom-4 z-50 bg-[#0f172a] border border-gray-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <div>
            <div className="text-sm text-yellow-400 font-semibold">Deleted all patients</div>
            <div className="text-xs text-gray-300">Undo available for {formatSeconds(countdown)}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={undoDeleteAll} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm">Undo</button>
            <button onClick={() => { setDeletedBackup([]); setCountdown(0); }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm">Dismiss</button>
          </div>
        </div>
      )}

      {singleDeleted && (
        <div className="fixed right-4 bottom-4 z-50 bg-[#0f172a] border border-gray-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <div>
            <div className="text-sm text-yellow-400 font-semibold">Patient deleted</div>
            <div className="text-xs text-gray-300">Undo available for {formatSeconds(countdown)}</div>
          </div>
          <button onClick={undoSingleDelete} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm">Undo</button>
        </div>
      )}
    </main>
  );
}
