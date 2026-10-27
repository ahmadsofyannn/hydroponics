'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      console.log('Mencoba menghubungi database Supabase...');
      
      const loginPromise = supabase
        .from('admins')
        .select('*')
        .eq('email', email.trim())
        .eq('password', password)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Koneksi ke server timeout. Periksa kembali file .env.local Anda.')), 6000)
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await Promise.race([loginPromise, timeoutPromise]);
      const { data, error: dbError } = res;

      console.log('Respons dari Supabase:', { data, dbError });

      if (dbError) {
        setErrorMessage('Gagal database: ' + dbError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage('Email atau Password salah!');
        setLoading(false);
        return;
      }

      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminEmail', data.email);
      
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      console.error('Error tertangkap di catch:', err);
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan koneksi ke server.';
      setErrorMessage(message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 hover:text-emerald-800 bg-white px-4 py-2.5 rounded-xl border border-slate-300 shadow-sm transition active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> Kembali ke Katalog
      </Link>

      <section className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-xl border border-slate-300">
        <header className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-300 shadow-sm">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-black text-2xl text-slate-900 tracking-tight">Login Admin</h2>
          <p className="text-xs font-bold text-slate-600 mt-1">Portal Manajemen HydroFresh</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Email Admin</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Masukkan email admin"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
              />
            </div>
            {errorMessage && (
              <p className="text-xs text-red-700 mt-2 font-bold bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-center">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-800 text-white rounded-xl font-extrabold text-sm hover:bg-emerald-900 transition flex items-center justify-center gap-2 shadow-md disabled:bg-slate-300 disabled:text-slate-500 active:scale-[0.99]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Masuk Dashboard'}
          </button>
        </form>
      </section>
    </main>
  );
}