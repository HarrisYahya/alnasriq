'use client';
import { Patient } from '../types';

interface Props {
  patients: Patient[];
  loading: boolean;
  toggleStatus: (id: number, current: string) => void;
  deletePatient: (id: number) => void;
}

export default function PatientTable({ patients, loading, toggleStatus, deletePatient }: Props) {
  // Get Somali date boundaries (UTC+3)
  const now = new Date();
  const somaliOffset = 3 * 60; // +3 hours in minutes
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const somaliNow = new Date(utcNow.getTime() + somaliOffset * 60000);

  // Start of Somali day (midnight)
  const startOfSomaliDay = new Date(somaliNow);
  startOfSomaliDay.setHours(0, 0, 0, 0);

  // Filter patients recorded since Somali midnight
  const todayPatients = patients.filter(p => {
    const inserted = new Date(p.inserted_at);
    const insertedUTC = new Date(inserted.getTime() + inserted.getTimezoneOffset() * 60000);
    const insertedSomali = new Date(insertedUTC.getTime() + somaliOffset * 60000);
    return insertedSomali >= startOfSomaliDay;
  });

  return (
    <div className="bg-[#1a1f2e] w-full max-w-6xl rounded-2xl shadow-lg overflow-x-auto">
      <table className="w-full text-center text-sm sm:text-base">
        <thead>
          <tr className="bg-[#0f172a] text-yellow-400 uppercase">
            <th className="py-3 px-2">#</th>
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
              <td colSpan={6} className="py-6 text-gray-400 animate-pulse">
                Loading...
              </td>
            </tr>
          ) : todayPatients.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-gray-500">
                No patients recorded today
              </td>
            </tr>
          ) : (
            todayPatients.map((p, index) => (
              <tr key={p.id} className="border-t border-gray-700 hover:bg-gray-800/40 transition-all">
                <td className="py-3">{index + 1}</td>
                <td>{p.patient_name}</td>
                <td>{p.stage}</td>
                <td>{p.service}</td>
                <td className={p.status === 'done' ? 'text-green-400' : 'text-yellow-400'}>
                  {p.status}
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(p.id, p.status)}
                    className="text-yellow-400 hover:text-white mx-2"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => deletePatient(p.id)}
                    className="text-red-400 hover:text-white mx-2"
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
  );
}
