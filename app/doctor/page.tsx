'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DoctorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newPatient, setNewPatient] = useState({
    full_name: '',
    phone_number: '',
    service: [] as string[],
    fee: '',
    location: '',
    date: '',
  });

  const [searchTicket, setSearchTicket] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<any>(null);

  // Available services
  const services = ['Gelin', 'Buuxin', 'Xirid', 'Dhaqid', 'Bedel'];

  // ✅ Check session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  // ✅ Toggle service checkboxes
  const toggleService = (service: string) => {
    if (newPatient.service.includes(service)) {
      setNewPatient({
        ...newPatient,
        service: newPatient.service.filter((s) => s !== service),
      });
    } else {
      setNewPatient({
        ...newPatient,
        service: [...newPatient.service, service],
      });
    }
  };

  // ✅ Add new patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('patients').insert([
      {
        full_name: newPatient.full_name,
        phone_number: newPatient.phone_number,
        service: newPatient.service.join(','),
        fee: newPatient.fee,
        location: newPatient.location,
        date: newPatient.date,
        doctor_email: user?.email,
      },
    ]);

    setSaving(false);

    if (error) {
      alert('Error saving patient: ' + error.message);
    } else {
      alert('Patient added successfully');
      setNewPatient({
        full_name: '',
        phone_number: '',
        service: [],
        fee: '',
        location: '',
        date: '',
      });
    }
  };

  // ✅ Search by ticket number
  const handleSearch = async () => {
    if (!searchTicket.trim()) return alert('Enter ticket number');
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('ticket', Number(searchTicket))
      .maybeSingle();

    if (error) {
      alert('Error searching patient: ' + error.message);
    } else if (!data) {
      alert('No patient found with that ticket number.');
      setSearchedPatient(null);
    } else {
      setSearchedPatient(data);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">Doctor Dashboard</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        <p className="mb-6 text-gray-300">Welcome, {user?.email}</p>

        {/* === Add Patient Form === */}
        <form
          onSubmit={handleAddPatient}
          className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4 mb-8"
        >
          <h2 className="text-xl font-semibold mb-2">Add New Patient</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="full_name"
              value={newPatient.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="px-3 py-2 bg-gray-700 rounded-lg outline-none w-full"
            />

            <input
              name="phone_number"
              value={newPatient.phone_number}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className="px-3 py-2 bg-gray-700 rounded-lg outline-none"
            />

            {/* Fee */}
            <input
              name="fee"
              value={newPatient.fee}
              onChange={handleChange}
              placeholder="Fee"
              type="number"
              required
              className="px-3 py-2 bg-gray-700 rounded-lg outline-none"
            />

            {/* Location */}
            <input
              name="location"
              value={newPatient.location}
              onChange={handleChange}
              placeholder="Location"
              required
              className="px-3 py-2 bg-gray-700 rounded-lg outline-none"
            />

            {/* Date */}
            <input
              name="date"
              value={newPatient.date}
              onChange={handleChange}
              type="date"
              required
              className="px-3 py-2 bg-gray-700 rounded-lg outline-none"
            />
          </div>

          {/* Service checkboxes */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Select Services:</h3>
            <div className="flex flex-wrap gap-3">
              {services.map((service) => (
                <label
                  key={service}
                  className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-yellow-500 hover:text-black transition"
                >
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
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded-lg transition mt-4"
          >
            {saving ? 'Saving...' : 'Add Patient'}
          </button>
        </form>

        {/* === Search Patient by Ticket === */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">Search Patient by Ticket</h2>
          <div className="flex gap-3">
            <input
              type="number"
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              placeholder="Enter ticket number"
              className="px-3 py-2 bg-gray-700 rounded-lg outline-none flex-1"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Search
            </button>
          </div>

           {searchedPatient && (
        <div className="mt-4 border border-gray-600 p-4 rounded-lg bg-gray-900">
            <p><strong>Name:</strong> {searchedPatient.full_name || searchedPatient.patient_name}</p>
            <p><strong>Service:</strong> {searchedPatient.service}</p>
        </div>
        )}


        </div>
      </div>
    </main>
  );
}
