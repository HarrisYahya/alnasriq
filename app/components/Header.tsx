'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [homeLink, setHomeLink] = useState('/'); // Default home link

  useEffect(() => {
    // ✅ Fetch session safely
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userData = session?.user || null;
        setUser(userData);

        if (userData) {
          // ✅ Check the user's role and set Home link accordingly
          const role = userData.user_metadata?.role;
          if (role === 'doctor') setHomeLink('/doctor');
          else if (role === 'staff') setHomeLink('/');
          else setHomeLink('/');
        }
      } catch (err) {
        console.warn('Header session fetch error:', err);
      }
    };

    getSession();

    // ✅ Real-time auth listener (auto-update)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const userData = session?.user || null;
      setUser(userData);
      if (userData) {
        const role = userData.user_metadata?.role;
        if (role === 'doctor') setHomeLink('/doctor');
        else if (role === 'staff') setHomeLink('/');
        else setHomeLink('/');
      } else {
        setHomeLink('/');
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="w-full bg-gray-800/60 backdrop-blur-sm p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400 mb-3 sm:mb-0">
          Alnasri Patient List
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* ✅ Dynamic Home link */}
          <Link
            href={homeLink}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Home
          </Link>

          <Link
            href="/components/all-patients"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            View All Patients
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
