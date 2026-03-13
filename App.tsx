import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import RPMPreview from './components/RPMPreview';
import PricingModal from './components/PricingModal';
import { FormData, RPMResult, Plan } from './types';
import { generateRPM } from './services/geminiService';
import { Cpu, Zap, Clock, Calendar, Lock, ArrowRight, ShieldCheck, FileText, Settings, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { initializeSnap, createPaymentTransaction } from './services/paymentService';

const App: React.FC = () => {
  const [rpmResult, setRpmResult] = useState<RPMResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [pendingApiKey, setPendingApiKey] = useState<string>('');
  
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

    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium, subscription_until')
      .eq('id', userId)
      .single();
    
    if (data) {
      const now = new Date();
      const expiry = data.subscription_until ? new Date(data.subscription_until) : null;
      setIsPremium(data.is_premium && (!expiry || expiry > now));
    }
  };

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (data: FormData, apiKey: string) => {
    if (!user) {
      alert("Silakan login terlebih dahulu.");
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
    if (!user || !pendingFormData) return;
    
    setIsLoading(true);
    setShowPricingModal(false);

    try {
      const orderId = `RPM-${Date.now()}`;
      const { token } = await createPaymentTransaction(orderId, plan.price, user.email || '', plan.id);

      (window as any).snap.pay(token, {
        onSuccess: async () => {
          setIsPremium(true);
          await proceedWithGeneration(pendingFormData, pendingApiKey);
        },
        onPending: () => {
          alert("Pembayaran tertunda.");
          setIsLoading(false);
        },
        onError: () => {
          alert("Pembayaran gagal.");
          setIsLoading(false);
        },
        onClose: () => {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error(error);
      alert("Gagal memproses pembayaran.");
      setIsLoading(false);
    }
  };

  const proceedWithGeneration = async (data: FormData, apiKey: string) => {
    setIsLoading(true);
    try {
      const generatedContent = await generateRPM(data, apiKey);
      const fullResult: RPMResult = {
        ...data,
        ...generatedContent
      };
      setRpmResult(fullResult);
      localStorage.setItem('rpm_result', JSON.stringify(fullResult));
    } catch (error: any) {
      console.error(error);
      alert("Terjadi kesalahan teknis saat pembuatan RPM.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedResult = localStorage.getItem('rpm_result');
    if (savedResult) {
      setRpmResult(JSON.parse(savedResult));
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase) {
      alert("Konfigurasi database belum diatur.");
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
    setRpmResult(null);
    localStorage.removeItem('rpm_result');
  };

  // Komponen Tombol WA (Reusable)
  const WhatsAppButton = () => (
    <a 
      href="https://wa.me/6283816186000?text=Halo,%20saya%20ingin%20menanyakan%20terkait%20RPM%20Generator."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur border border-green-200 py-1.5 pl-1.5 pr-4 rounded-full shadow-xl hover:shadow-green-200/50 hover:-translate-y-1 transition-all duration-300 no-print group"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 group-hover:opacity-50 transition-opacity duration-300"></div>
        <img 
          src="https://pngimg.com/d/whatsapp_PNG21.png" 
          alt="WhatsApp" 
          className="w-8 h-8 relative z-10"
        />
      </div>
      <span className="font-bold text-slate-700 text-xs group-hover:text-green-700 transition-colors">
        Tanya Pengembang
      </span>
    </a>
  );

  // Main App Render
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900 relative">
      <style>
        {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent">
        
        {/* Modern White Glossy Header */}
        <header className="sticky top-0 z-40 border-b border-purple-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <FileText size={32} className="text-purple-600 animate-float" />
                <Settings size={16} className="text-fuchsia-500 absolute -bottom-1 -right-1 animate-spin-slow" />
              </div>
               <div>
                 <h1 className="text-xl font-bold text-slate-800 tracking-wider flex items-center gap-2">
                   RPM <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600">GENERATOR</span>
                 </h1>
                 <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mt-0.5">SISTEM DIGITAL GURU</p>
               </div>
            </div>

            {/* Auth Button */}
            <div className="flex items-center gap-3">
              {/* Date & Time Display (Desktop) */}
              <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600 bg-white/50 px-4 py-1.5 rounded-full border border-purple-100 shadow-sm mr-2">
                 <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                    <Calendar size={14} className="text-purple-500" />
                    <span>{dateTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                 </div>
                 <div className="flex items-center gap-2 pl-1">
                    <Clock size={14} className="text-purple-500" />
                    <span className="tabular-nums font-bold text-purple-900">{dateTime.toLocaleTimeString('id-ID')}</span>
                 </div>
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-700">{user.user_metadata?.full_name || user.email}</span>
                    <span className="text-[10px] text-purple-600 font-medium">Verified Teacher</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 group"
                    title="Logout"
                  >
                    <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <LogIn size={18} />
                  <span>Login Google</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 md:p-12 max-w-6xl mx-auto">
          {!user ? (
            <div className="max-w-4xl mx-auto py-20 text-center space-y-12">
               <div className="relative">
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                 <div className="pt-12">
                   <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-purple-100 mb-8 animate-float">
                     <Lock size={48} className="text-purple-600" />
                   </div>
                   <h2 className="text-4xl font-bold text-slate-900 mb-4">AKSES TERBATAS</h2>
                   <p className="text-slate-500 text-lg max-w-lg mx-auto mb-10">
                     Silakan login menggunakan akun Google Anda untuk mengakses fitur Generator RPM dan mengelola dokumen Anda.
                   </p>
                   <button 
                    onClick={handleGoogleLogin}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-slate-800"
                   >
                     Mulai dengan Google
                     <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                   </button>
                 </div>
               </div>
            </div>
          ) : !rpmResult ? (
            <div className="animate-fade-in-up">
               {/* Hero Section */}
               <div className="text-center space-y-6 mb-16 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/30 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="inline-flex items-center justify-center p-4 mb-2 relative group">
                    <div className="absolute inset-0 bg-purple-100 rounded-full blur-md group-hover:bg-purple-200 transition-all duration-500"></div>
                    <Cpu size={48} strokeWidth={1.5} className="text-purple-600 relative z-10" />
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight uppercase">
                    Rencana <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 animate-gradient-x">Pembelajaran</span>
                  </h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                    Selamat datang kembali, <span className="font-bold text-purple-700">{user.user_metadata?.full_name || 'Bapak/Ibu Guru'}</span>! <br/>
                    Hasilkan dokumen RPM terstruktur dengan kecerdasan buatan.
                  </p>
               </div>
               
               <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <RPMPreview data={rpmResult} onReset={() => { setRpmResult(null); localStorage.removeItem('rpm_result'); }} />
            </div>
          )}
        </main>

        {showPricingModal && (
          <PricingModal 
            onSelectPlan={handleSelectPlan} 
            onClose={() => setShowPricingModal(false)} 
          />
        )}

        {/* Footer */}
        <footer className="mt-20 py-8 text-center no-print border-t border-purple-100 bg-white/40 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
            <Zap size={16} className="text-purple-400" />
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
               &copy; {new Date().getFullYear()} Sistem Digital Guru
            </p>
            <p className="text-slate-400 text-[10px] font-medium tracking-wide">
               Dikembangkan untuk Guru Indonesia
            </p>
          </div>
        </footer>
      </div>

      {/* Floating WhatsApp Button on Main App */}
      <WhatsAppButton />
    </div>
  );
};

export default App;