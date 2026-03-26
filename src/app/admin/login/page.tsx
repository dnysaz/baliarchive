'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email: email.trim(),
      password: password.trim(),
      redirect: false,
    });

    if (res?.error) {
      console.error('Login error:', res.error);
      setError('Email atau password salah');
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/70 backdrop-blur-xl p-10 border border-black/5 rounded-3xl shadow-2xl shadow-zinc-300/30">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
              <span className="text-white text-4xl font-bold">W</span>
            </div>
            <h1 className="text-3xl font-bold text-zinc-800 tracking-tight">Wiki Bali</h1>
            <p className="text-zinc-400 text-xs mt-2 font-semibold tracking-widest">Security Gateway</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-semibold flex items-center gap-3 rounded-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@wikibali.com"
                className="w-full px-5 py-4 bg-black/5 border-2 border-transparent rounded-xl outline-none focus:border-amber-500/50 focus:bg-white transition-all text-zinc-800 font-semibold placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 ml-1">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-black/5 border-2 border-transparent rounded-xl outline-none focus:border-amber-500/50 focus:bg-white transition-all text-zinc-800 font-semibold placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-amber-500 text-white font-semibold text-base hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 disabled:bg-zinc-300 disabled:shadow-none active:scale-[0.98] mt-4 flex items-center justify-center gap-3 rounded-xl"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Authorize"
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-10 text-xs font-semibold text-zinc-400 tracking-widest">
          Wiki Bali Secure Engine
        </p>
      </div>
    </div>
  );
}
