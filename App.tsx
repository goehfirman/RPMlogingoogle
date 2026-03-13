import React, { useState, useEffect } from 'react';
import { FormData, RPMResult, Plan } from './types';
import { Cpu, Zap, Clock, Calendar, Lock, ArrowRight, ShieldCheck, FileText, Settings, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { initializeSnap, createPaymentTransaction } from './services/paymentService';
import { generateRPM } from './services/geminiService';

const App: React.FC = () => {
  const [rpmResult, setRpmResult] = useState<RPMResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [pendingApiKey, setPendingApiKey] = useState<string>('');

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth & Snap Initialization
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not configured. Auth features disabled.");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    initializeSnap();

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase) {
      alert("Supabase belum dikonfigurasi. Silakan hubungi pengembang.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setRpmResult(null);
    localStorage.removeItem('rpm_result');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900 relative">
      <header className="sticky top-0 z-40 border-b border-purple-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <FileText size={32} className="text-purple-600" />
            </div>
             <div>
               <h1 className="text-xl font-bold text-slate-800 tracking-wider">
                 RPM <span className="text-purple-600">GENERATOR</span>
               </h1>
             </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
               <button onClick={handleLogout} className="text-slate-500 hover:text-red-600">Logout</button>
            ) : (
               <button 
                onClick={handleGoogleLogin}
                className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold"
               >
                 Login Google
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-12 text-center">
        {!user ? (
          <div className="py-20">
            <h2 className="text-3xl font-bold mb-4">Mulai Cepat & Mudah</h2>
            <p className="text-slate-500 mb-8">Silakan login untuk mulai membuat dokumen RPM Anda.</p>
            <button 
              onClick={handleGoogleLogin}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl"
            >
              Mulai dengan Google
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold">Halo, {user.email}</h2>
            <p className="mt-4">Fitur generator akan segera aktif kembali...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;