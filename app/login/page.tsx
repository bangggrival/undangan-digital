'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh(); // Refresh to ensure middleware state is updated
      } else {
        setError(data.message || 'Login gagal. Periksa kembali username dan password Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-inner">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Akses</h1>
            <p className="text-sm text-gray-500">Masukkan kredensial Anda untuk mengelola undangan digital.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></div>
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-secondary transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  Masuk Dashboard <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
          
          <div className="mt-8 text-center">
            <a href="/" className="text-xs font-medium text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-1">
              &larr; Kembali ke Undangan
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
