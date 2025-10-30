'use client';
import { useState, useRef, useEffect } from 'react';
import { NewPatient } from '../types';

interface Props {
  newPatient: NewPatient;
  setNewPatient: React.Dispatch<React.SetStateAction<NewPatient>>;
  addPatient: () => void;
}

const services = ['Gelin', 'Buuxin', 'Xirid', 'Dhaqid', 'Bedel'];

export default function PatientInput({ newPatient, setNewPatient, addPatient }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleService = (service: string) => {
    if (newPatient.service.includes(service)) {
      setNewPatient({
        ...newPatient,
        service: newPatient.service.filter(s => s !== service),
      });
    } else {
      setNewPatient({ ...newPatient, service: [...newPatient.service, service] });
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-[#1a1f2e] w-full max-w-6xl rounded-2xl p-6 mb-6 shadow-lg flex flex-col sm:flex-row flex-wrap items-center gap-4 relative">
      <input
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
        <option>Bedel</option>
        <option>Soolabtay</option>
      </select>

      {/* Service popup */}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="bg-[#0f172a] border border-yellow-500 text-yellow-400 rounded-lg px-4 py-2 hover:bg-yellow-500 hover:text-black transition"
        >
          Service {newPatient.service.length > 0 ? `(${newPatient.service.length})` : ''}
        </button>

        {open && (
          <div className="absolute mt-2 w-48 bg-[#1a1f2e] border border-yellow-500 rounded-lg shadow-lg z-10 p-3 flex flex-col gap-2">
            {services.map((service) => (
              <label key={service} className="flex items-center gap-2 cursor-pointer hover:bg-yellow-500 hover:text-black px-2 py-1 rounded-lg transition">
                <input
                  type="checkbox"
                  checked={newPatient.service.includes(service)}
                  onChange={() => toggleService(service)}
                  className="w-4 h-4"
                />
                {service}
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={addPatient}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg transition-all duration-200"
      >
        Add
      </button>
    </div>
  );
}
