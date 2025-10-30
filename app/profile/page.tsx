'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user info
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login'); // redirect if not logged in
        return;
      }
      setUser(data.user);
      setLoading(false);
    };
    loadUser();
  }, [router]);

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <p className="animate-pulse text-white text-lg font-medium">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-700">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-2">Profile</h1>
          <p className="text-gray-400">Welcome back!</p>
        </div>

        <div className="text-left space-y-3 mb-8">
          <p className="flex justify-between">
            <span className="text-gray-400 font-medium">Email:</span> 
            <span className="text-white">{user.email}</span>
          </p>
          {user.user_metadata?.full_name && (
            <p className="flex justify-between">
              <span className="text-gray-400 font-medium">Name:</span> 
              <span className="text-white">{user.user_metadata.full_name}</span>
            </p>
          )}
          <p className="flex justify-between">
            <span className="text-gray-400 font-medium">ID:</span> 
            <span className="text-white">{user.id}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 hover:scale-105"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
