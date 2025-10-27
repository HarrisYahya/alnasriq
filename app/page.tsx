'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({
    patient_name: '',
    stage: 'Cusub',
    service: 'Gelin',
    status: 'waiting',
  });

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('ticket', { ascending: true });
    if (!error && data) setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const addPatient = async () => {
    await supabase.from('patients').insert([newPatient]);
    setNewPatient({ patient_name: '', stage: 'Cusub', service: 'Gelin', status: 'waiting' });
    fetchPatients();
  };

  const deletePatient = async (id: number) => {
    await supabase.from('patients').delete().eq('id', id);
    fetchPatients();
  };

  const toggleStatus = async (id: number, current: string) => {
    await supabase.from('patients').update({ status: current === 'waiting' ? 'done' : 'waiting' }).eq('id', id);
    fetchPatients();
  };
 return (
  <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-10 text-white">
    <h1 className="text-4xl font-extrabold text-yellow-400 mb-8 text-center">
      Alnasri Patient List
    </h1>

    {/* Input Section */}
    <div className="bg-[#1a1f2e] w-full max-w-6xl rounded-2xl p-6 mb-6 shadow-lg flex flex-wrap items-center justify-center gap-4">
      <input
        placeholder="Patient Name"
        value={newPatient.patient_name}
        onChange={(e) => setNewPatient({ ...newPatient, patient_name: e.target.value })}
        className="flex-1 min-w-[250px] p-3 rounded-lg bg-[#0f172a] border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
    <div className="bg-[#1a1f2e] w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden">
      <table className="w-full text-center">
        <thead>
          <tr className="bg-[#0f172a] text-yellow-400 uppercase text-sm">
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
            <tr>
              <td colSpan={6} className="py-6 text-gray-400">Loading...</td>
            </tr>
          ) : patients.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-gray-500">No patients yet</td>
            </tr>
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
                  <button
                    onClick={() => toggleStatus(p.id, p.status)}
                    className="text-yellow-400 hover:text-white mx-2 transition-colors"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => deletePatient(p.id)}
                    className="text-red-400 hover:text-white mx-2 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </main>
);

}