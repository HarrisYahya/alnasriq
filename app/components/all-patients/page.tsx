'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Patient } from '../../types';

export default function AllPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('inserted_at', { ascending: true });

    if (!error && data) setPatients(data as Patient[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients
  const filteredPatients = patients.filter(p =>
    p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    String(p.ticket).includes(search) ||
    p.stage.toLowerCase().includes(search.toLowerCase()) ||
    p.service.toLowerCase().includes(search.toLowerCase()) ||
    p.status.toLowerCase().includes(search.toLowerCase())
  );

  // Group by date
  const groupedByDate: Record<string, Patient[]> = {};
  filteredPatients.forEach(p => {
    const dateKey = new Date(p.inserted_at).toLocaleDateString();
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(p);
  });

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400 mb-6">All Patients</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, ticket, stage, service or status..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-3xl p-2 rounded-lg text-white mb-6 bg-gray-800 placeholder-gray-400"
      />

      {loading ? (
        <div className="text-gray-400 animate-pulse">Loading...</div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <div className="text-gray-500">No patients found</div>
      ) : (
        Object.keys(groupedByDate)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .map(date => (
            <div key={date} className="w-full max-w-6xl mb-8">
              <h2 className="text-xl font-semibold text-yellow-300 mb-2">{date}</h2>
              <div className="bg-[#1a1f2e] rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-center text-sm sm:text-base">
                  <thead>
                    <tr className="bg-[#0f172a] text-yellow-400 uppercase">
                      <th className="py-3 px-2">Ticket #</th>
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Stage</th>
                      <th className="py-3 px-2">Service</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDate[date].map((p, index) => (
                      <tr key={p.id} className="border-t border-gray-700 hover:bg-gray-800/40 transition-all">
                        <td className="py-3">{index + 1}</td>
                        <td>{p.patient_name}</td>
                        <td>{p.stage}</td>
                        <td>{p.service}</td>
                        <td className={p.status === 'done' ? 'text-green-400' : 'text-yellow-400'}>
                          {p.status}
                        </td>
                        <td>{new Date(p.inserted_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
      )}
    </main>
  );
}
