import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import RPMPreview from './components/RPMPreview';
import PricingModal from './components/PricingModal';
import { FormData, RPMResult, Plan } from './types';
import { generateRPM } from './services/geminiService';
import { 
  Cpu, Zap, Clock, Calendar, Lock, ArrowRight, ShieldCheck, 
  FileText, Settings, LogIn, LogOut, User as UserIcon,
  LayoutGrid, BookOpen, Star, MessageSquare, Sun, Users, HelpCircle, Moon
} from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { initializeSnap, createPaymentTransaction } from './services/paymentService';

const LandingPage: React.FC<{ 
  onStart: () => void; 
  onLogin: () => void; 
  onViewPlans: () => void;
  user: any;
}> = ({ onStart, onLogin, onViewPlans, user }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Promo Banner */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-orange-400 cursor-pointer hover:bg-orange-500/20 transition-all group">
          <Zap size={14} className="fill-orange-400" />
          <span>DISKON hingga 40% khusus Ramadan</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-8 relative">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          Mau ngapain hari ini?
        </h2>
        
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto pt-10">
          {/* Card 1: Bikin RPM */}
          <div 
            onClick={onStart}
            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl text-left hover:bg-slate-800/60 hover:border-slate-600 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="bg-orange-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/30 group-hover:scale-110 transition-transform">
              <FileText className="text-orange-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Bikin RPM</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dari ide jadi rencana pembelajaran yang siap dipake AI.
            </p>
          </div>

          {/* Card 2: Tools Ranking (Plans) */}
          <div 
            onClick={onViewPlans}
            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl text-left hover:bg-slate-800/60 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="bg-green-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30 group-hover:scale-110 transition-transform">
              <LayoutGrid className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Pilih Paket</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Aktivasi akses premium untuk fitur generator tanpa batas.
            </p>
          </div>

          {/* Card 3: Coaching */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl text-left hover:bg-slate-800/60 hover:border-slate-600 transition-all cursor-pointer group">
            <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Users className="text-blue-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Coaching</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ngobrol langsung sama Kang Guru Corp, mau belajar atau konsultasi.
            </p>
          </div>

          {/* Card 4: Belajar */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl text-left opacity-60 relative group">
            <span className="absolute top-4 right-4 bg-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">Coming Soon</span>
            <div className="bg-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
              <BookOpen className="text-purple-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Belajar</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Konsep dasar bikin aplikasi dan cara menerapkan AI tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [rpmResult, setRpmResult] = useState<RPMResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [pendingApiKey, setPendingApiKey] = useState<string>('');
  const [view, setView] = useState<'landing' | 'form'>('landing');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Auth & Snap Initialization
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkPremiumStatus(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkPremiumStatus(session.user.id);
      else setIsPremium(false);
    });

    initializeSnap();

    return () => subscription.unsubscribe();
  }, []);

  const checkPremiumStatus = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('is_premium, subscription_until').eq('id', userId).single();
    if (data) {
      const now = new Date();
      const expiry = data.subscription_until ? new Date(data.subscription_until) : null;
      setIsPremium(data.is_premium && (!expiry || expiry > now));
    }
  };

  const handleSubmit = async (data: FormData, apiKey: string) => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!isPremium) {
      setPendingFormData(data);
      setPendingApiKey(apiKey);
      setShowPricingModal(true);
      return;
    }
    await proceedWithGeneration(data, apiKey);
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) return;
    setIsLoading(true);
    setShowPricingModal(false);
    try {
      const orderId = `RPM-${Date.now()}`;
      const { token } = await createPaymentTransaction(orderId, plan.price, user.email || '', plan.id);
      (window as any).snap.pay(token, {
        onSuccess: async () => {
          setIsPremium(true);
          if (pendingFormData) await proceedWithGeneration(pendingFormData, pendingApiKey);
          else alert("Pembayaran sukses! Anda sekarang member Premium.");
        },
        onPending: () => alert("Pembayaran tertunda."),
        onError: () => alert("Pembayaran gagal."),
        onClose: () => setIsLoading(false)
      });
    } catch (error: any) {
      alert("Gagal memproses pembayaran: " + (error.message || "Domain tidak diizinkan atau sesi berakhir."));
      setIsLoading(false);
    }
  };

  const proceedWithGeneration = async (data: FormData, apiKey: string) => {
    setIsLoading(true);
    try {
      const generatedContent = await generateRPM(data, apiKey);
      const fullResult: RPMResult = { ...data, ...generatedContent };
      setRpmResult(fullResult);
      localStorage.setItem('rpm_result', JSON.stringify(fullResult));
    } catch (error: any) {
      alert("Terjadi kesalahan teknis saat pembuatan RPM.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setRpmResult(null);
    localStorage.removeItem('rpm_result');
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-slate-200 selection:bg-purple-500/30 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-[#0F172A]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setView('landing')}>
              <h1 className="text-xl font-bold text-white tracking-tight">
                RPMGenerator<span className="text-orange-500">SD</span>
              </h1>
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-bold text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Users size={14} />
                <span>2.5K <span className="font-normal opacity-60">User</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold text-orange-500/80">
                <FileText size={14} />
                <span>1.7K <span className="font-normal opacity-60 text-slate-400 uppercase">PRD</span></span>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Sun size={20} />
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 relative">
                {/* Status Badges */}
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isPremium ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </div>
                  {!isPremium && (
                    <button 
                      onClick={() => setShowPricingModal(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      Upgrade
                    </button>
                  )}
                </div>

                {/* Avatar / Trigger */}
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full border-2 border-slate-700/50 overflow-hidden hover:border-orange-500 transition-all shadow-lg"
                >
                  <img 
                    src={user.user_metadata?.avatar_url || "https://i.ibb.co.com/1fQ81J6v/LOGO-PEKAYON-09.jpg"} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 top-full mt-3 w-64 bg-[#1E293B] border border-slate-700/50 rounded-2xl shadow-2xl z-20 overflow-hidden animate-fade-in-up">
                      {/* User Info */}
                      <div className="p-4 border-b border-slate-700/50 bg-slate-800/20">
                        <p className="text-sm font-bold text-white truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all">
                          <Settings size={16} />
                          Pengaturan
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all">
                          <HelpCircle size={16} />
                          Bantuan
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all">
                          <Sun size={16} />
                          Light mode
                        </button>
                      </div>

                      <div className="p-2 border-t border-slate-700/50">
                        <button 
                          onClick={() => { handleLogout(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={handleGoogleLogin}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-900/20 transition-all hover:-translate-y-0.5"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        {rpmResult ? (
          <RPMPreview data={rpmResult} onReset={() => { setRpmResult(null); localStorage.removeItem('rpm_result'); setView('landing'); }} />
        ) : view === 'landing' ? (
          <LandingPage 
            user={user} 
            onStart={() => {
              if (!user) handleGoogleLogin();
              else setView('form');
            }} 
            onLogin={handleGoogleLogin}
            onViewPlans={() => setShowPricingModal(true)}
          />
        ) : (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setView('landing')}
                className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <h2 className="text-2xl font-bold text-white">Buat Dokumen RPM Baru</h2>
            </div>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}
      </main>

      {showPricingModal && (
        <PricingModal 
          onSelectPlan={handleSelectPlan} 
          onClose={() => setShowPricingModal(false)} 
        />
      )}

      <footer className="relative z-10 pt-20 pb-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <span>Product by</span>
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-full">
            <img src="https://i.ibb.co.com/1fQ81J6v/LOGO-PEKAYON-09.jpg" className="w-5 h-5 rounded-full" alt="Kang Guru Corp" />
            <span className="text-slate-300">Kang Guru Corp</span>
            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded ml-1">15.1K</span>
          </div>
        </div>
        <p className="text-slate-600 text-[10px] font-medium tracking-[0.2em] uppercase pt-4">
          &copy; {new Date().getFullYear()} RPMGENERATORSD - SISTEM DIGITAL GURU
        </p>
      </footer>
    </div>
  );
};

export default App;