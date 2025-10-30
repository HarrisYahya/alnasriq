'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';


export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'staff',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (!form.full_name || !form.username || !form.email || !form.password) {
      return alert('All fields are required.');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            username: form.username,
            role: form.role,
          },
        },
      });

      if (error) throw error;

      alert('Signup successful! Please verify your email.');
      router.push('/login');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>


      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Signup</h1>
          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            className="input w-full p-2 rounded text-black"
          />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="input w-full p-2 rounded text-black"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            onChange={handleChange}
            className="input w-full p-2 rounded text-black"
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            onChange={handleChange}
            className="input w-full p-2 rounded text-black"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input w-full p-2 rounded text-black"
          >
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
          </select>
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-yellow-500 py-2 rounded font-semibold"
          >
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </div>
      </main>
    </>
  );
}
