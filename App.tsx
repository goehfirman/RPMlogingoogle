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
  theme: 'dark' | 'light';
}> = ({ onStart, onLogin, onViewPlans, user, theme }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Promo Banner */}
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all group ${
          theme === 'dark' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
        }`}>
          <Zap size={14} className={theme === 'dark' ? 'fill-orange-400' : 'fill-orange-600'} />
          <span>DISKON hingga 40% khusus Ramadan</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-8 relative">
        <h2 className={`text-5xl md:text-7xl font-bold tracking-tight transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Mau ngapain hari ini?
        </h2>
        
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto pt-10 text-center md:text-left">
          {/* Card 1: Bikin RPM */}
          <div 
            onClick={onStart}
            className={`backdrop-blur-xl border p-8 rounded-[2.5rem] transition-all cursor-pointer group relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600' : 'bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-orange-200'
            }`}
          >
            <div className="bg-orange-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/30 group-hover:scale-110 transition-transform">
              <FileText className="text-orange-500" size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Bikin RPM</h3>
            <p className={`text-sm leading-relaxed transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Dari ide jadi rencana pembelajaran yang siap dipake AI.
            </p>
          </div>

          {/* Card 2: Tools Ranking (Plans) */}
          <div 
            onClick={onViewPlans}
            className={`backdrop-blur-xl border p-8 rounded-[2.5rem] transition-all cursor-pointer group ${
              theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600' : 'bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-green-200'
            }`}
          >
            <div className="bg-green-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30 group-hover:scale-110 transition-transform">
              <LayoutGrid className="text-green-500" size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Pilih Paket</h3>
            <p className={`text-sm leading-relaxed transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Aktivasi akses premium untuk fitur generator tanpa batas.
            </p>
          </div>

          {/* Card 3: Coaching */}
          <div className={`backdrop-blur-xl border p-8 rounded-[2.5rem] transition-all cursor-pointer group ${
            theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600' : 'bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200'
          }`}>
            <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Users className="text-blue-500" size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Coaching</h3>
            <p className={`text-sm leading-relaxed transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Ngobrol langsung sama Kang Guru Corp, mau belajar atau konsultasi.
            </p>
          </div>

          {/* Card 4: Belajar */}
          <div className={`backdrop-blur-xl border p-8 rounded-[2.5rem] transition-all opacity-60 relative group ${
            theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50 hover:opacity-100' : 'bg-white border-slate-200 hover:opacity-100'
          }`}>
            <span className="absolute top-4 right-4 bg-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">Coming Soon</span>
            <div className="bg-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
              <BookOpen className="text-purple-500" size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Belajar</h3>
            <p className={`text-sm leading-relaxed transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
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
  const [view, setView] = useState<'landing' | 'form' | 'settings'>('landing');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [subscriptionUntil, setSubscriptionUntil] = useState<Date | null>(null);

  // Sync theme with body class
  useEffect(() => {
    if (theme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [theme]);

  // Auth & Snap Initialization
  useEffect(() => {
    if (!supabase) return;

    initializeSnap();

    // Set up Realtime listener for profile changes
    let profileSubscription: any = null;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPremiumStatus(session.user);
        profileSubscription = supabase
          .channel(`profile-${session.user.id}`)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${session.user.id}`
          }, (payload) => {
            console.log('Real-time update received:', payload.new);
            handleProfileUpdate(payload.new);
          })
          .subscribe();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPremiumStatus(session.user);
        if (!profileSubscription) {
          profileSubscription = supabase
            .channel(`profile-${session.user.id}`)
            .on('postgres_changes', { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'profiles',
              filter: `id=eq.${session.user.id}`
            }, (payload) => {
              handleProfileUpdate(payload.new);
            })
            .subscribe();
        }
      } else {
        setIsPremium(false);
        setUserPlan(null);
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription);
          profileSubscription = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileSubscription) supabase.removeChannel(profileSubscription);
    };
  }, []);

  const handleProfileUpdate = (profile: any) => {
    const now = new Date();
    const expiry = profile.subscription_until ? new Date(profile.subscription_until) : null;
    const active = profile.is_premium && (!expiry || expiry > now);
    setIsPremium(active);
    setUserPlan(profile.plan_type || null);
    setSubscriptionUntil(expiry);
  };

  const checkPremiumStatus = async (authUser: any) => {
    if (!supabase || !authUser) return;
    const userId = authUser.id;
    console.log('Checking premium status for:', userId);
    const { data, error } = await supabase.from('profiles').select('is_premium, subscription_until, plan_type').eq('id', userId).single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Single row not found
        console.log('Profile missing, creating for user:', userId);
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name,
          avatar_url: authUser.user_metadata?.avatar_url
        });
        if (insertError) console.error('Failed to create profile:', insertError);
      } else {
        console.error('Error fetching profile:', error);
      }
      return;
    }
    
    if (data) {
      console.log('Profile data found:', data);
      handleProfileUpdate(data);
    } else {
      console.warn('No profile data found for user ID:', userId);
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
      const { token } = await createPaymentTransaction(orderId, plan.price, user.email || '', plan.id, user.id);
      (window as any).snap.pay(token, {
        onSuccess: async () => {
          console.log('Payment success callback triggered');
          
          const now = new Date();
          const expiry = plan.id === 'lifetime' 
            ? new Date('2099-12-31T23:59:59Z') 
            : plan.id === 'quarterly' 
              ? new Date(now.setMonth(now.getMonth() + 3))
              : new Date(now.setMonth(now.getMonth() + 1));

          // Fallback: Update profile directly from client-side if webhook fails (Sandbox/Dev)
          if (user) {
            const { error: updateError } = await supabase.from('profiles').upsert({
              id: user.id,
              is_premium: true,
              subscription_until: expiry.toISOString(),
              plan_type: plan.id,
              updated_at: new Date().toISOString()
            });

            if (updateError) console.error('Failed to update premium status client-side:', updateError);
            else console.log('Premium status updated successfully in DB (client-side)');
          }

          setIsPremium(true);
          setUserPlan(plan.id);
          setSubscriptionUntil(expiry);
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
    setIsPremium(false);
    setUserPlan(null);
    setSubscriptionUntil(null);
    localStorage.removeItem('rpm_result');
    setView('landing');
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-purple-500/30 relative overflow-x-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0F172A] text-slate-200' : 'bg-[#F1F5F9] text-slate-900'
    }`}>
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-opacity duration-1000 ${
          theme === 'dark' ? 'bg-purple-600/10 opacity-100' : 'bg-purple-600/5 opacity-0'
        }`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-opacity duration-1000 ${
          theme === 'dark' ? 'bg-blue-600/10 opacity-100' : 'bg-blue-600/5 opacity-0'
        }`}></div>
      </div>

      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all ${
        theme === 'dark' ? 'border-slate-800/50 bg-[#0F172A]/80' : 'border-slate-200 bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setView('landing')}>
              <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                RPMGenerator<span className="text-orange-500">SD</span>
              </h1>
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold transition-all ${
                theme === 'dark' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-green-50/50 border-green-500/20 text-green-600'
              }`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <Users size={14} />
                <span>2.5K <span className="font-normal opacity-60">User</span></span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                theme === 'dark' ? 'text-orange-500/80' : 'text-orange-600'
              }`}>
                <FileText size={14} />
                <span>{isPremium && subscriptionUntil ? `${Math.ceil((subscriptionUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} H` : '1.7K'} <span className={`font-normal opacity-60 uppercase transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{isPremium ? 'Sisa' : 'PRD'}</span></span>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} className="text-slate-600" />}
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
                  className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all shadow-lg ${
                    theme === 'dark' ? 'border-slate-700/50 hover:border-orange-500' : 'border-slate-200 hover:border-orange-500'
                  }`}
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
                    <div className={`absolute right-0 top-full mt-3 w-64 border rounded-2xl shadow-2xl z-20 overflow-hidden animate-fade-in-up transition-all ${
                      theme === 'dark' ? 'bg-[#1E293B] border-slate-700/50' : 'bg-white border-slate-200'
                    }`}>
                      {/* User Info */}
                      <div className={`p-4 border-b transition-all ${
                        theme === 'dark' ? 'border-slate-700/50 bg-slate-800/20 text-white' : 'border-slate-100 bg-slate-50 text-slate-900'
                      }`}>
                        <p className="text-sm font-bold truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                        <p className={`text-[11px] truncate transition-all ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button 
                          onClick={() => { setView('settings'); setShowUserMenu(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-all rounded-xl ${
                            theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          }`}
                        >
                          <Settings size={16} />
                          Pengaturan
                        </button>
                        <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-all rounded-xl ${
                          theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                        }`}>
                          <HelpCircle size={16} />
                          Bantuan
                        </button>
                        <button 
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-all rounded-xl ${
                            theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          }`}
                        >
                          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
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
          <RPMPreview theme={theme} data={rpmResult} onReset={() => { setRpmResult(null); localStorage.removeItem('rpm_result'); setView('landing'); }} />
        ) : view === 'settings' && user ? (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-4 mb-10">
              <button 
                onClick={() => setView('landing')}
                className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <h2 className="text-3xl font-bold text-white tracking-tight">Pengaturan</h2>
            </div>
            
            <div className="space-y-8">
              {/* Plan & Usage */}
              <div className={`border rounded-[2rem] p-8 md:p-10 transition-all ${
                theme === 'dark' ? 'bg-slate-800/20 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-xl font-bold uppercase tracking-tight transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Plan & Penggunaan</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${
                    isPremium 
                      ? 'bg-orange-500 text-white' 
                      : (theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')
                  }`}>
                    {isPremium ? (userPlan === 'lifetime' ? 'Lifetime' : userPlan === 'quarterly' ? 'Quarterly' : 'Monthly') : 'Free'}
                  </span>
                </div>
                <p className={`text-sm mb-8 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{isPremium ? 'Sisa waktu berlangganan' : 'Dapatkan akses premium untuk fitur tak terbatas.'}</p>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-bold uppercase tracking-widest transition-all ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{isPremium ? 'Hari Tersisa' : 'Upgrade Sekarang'}</span>
                      <span className={`text-xs font-bold transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {subscriptionUntil && isPremium ? (
                          userPlan === 'lifetime' ? 'Selamanya' : `${Math.ceil((subscriptionUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Hari`
                        ) : '0 Hari'}
                      </span>
                    </div>
                    <div className={`h-1.5 w-full rounded-lg overflow-hidden border transition-all ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700/50' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <div 
                        className="h-full bg-orange-500 transition-all duration-1000" 
                        style={{ 
                          width: !isPremium ? '0%' : (userPlan === 'lifetime' ? '100%' : `${(() => {
                            const days = Math.ceil((subscriptionUntil!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            const total = userPlan === 'quarterly' ? 90 : 30;
                            return Math.min(100, Math.max(0, (days / total) * 100));
                          })()}%`) 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className={`flex justify-between items-center py-6 border-t transition-all ${theme === 'dark' ? 'border-slate-700/30' : 'border-slate-100'}`}>
                    <span className={`text-xs font-bold uppercase tracking-widest transition-all ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Chat</span>
                    <span className={`text-xs font-medium italic transition-all ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Tidak tersedia di plan ini — upgrade untuk menggunakan fitur ini</span>
                  </div>
                  
                  <div className={`pt-4 border-t text-xs font-bold uppercase tracking-widest leading-relaxed transition-all ${
                    theme === 'dark' ? 'border-slate-700/30 text-slate-600' : 'border-slate-100 text-slate-400'
                  }`}>
                    {isPremium ? 'Langganan Aktif' : 'Tidak ada langganan aktif'}
                  </div>
                </div>
              </div>

              {/* Upgrade Plan */}
              <div className={`border rounded-[2rem] p-8 md:p-10 transition-all ${
                theme === 'dark' ? 'bg-slate-800/20 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-xl font-bold mb-4 tracking-tight transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Upgrade Plan</h3>
                <p className={`text-sm mb-8 leading-relaxed transition-all ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Upgrade untuk mendapatkan lebih banyak PRD, chat, dan fitur premium lainnya.
                </p>
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-orange-900/20 transition-all hover:-translate-y-1 block"
                >
                  Lihat Plan & Upgrade
                </button>
              </div>

              {/* Profile */}
              <div className={`border rounded-[2rem] p-8 md:p-10 transition-all ${
                theme === 'dark' ? 'bg-slate-800/20 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-xl font-bold mb-2 tracking-tight transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Profil</h3>
                <p className={`text-sm mb-10 transition-all ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Informasi akun kamu.</p>
                
                <div className="flex items-center gap-5 mb-12">
                  <div className={`w-20 h-20 rounded-3xl border-2 overflow-hidden shadow-2xl transition-all ${
                    theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'
                  }`}>
                    <img 
                      src={user.user_metadata?.avatar_url || "https://i.ibb.co.com/1fQ81J6v/LOGO-PEKAYON-09.jpg"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className={`text-xl font-bold tracking-tight transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                    <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className={`space-y-8 py-10 border-t transition-all ${theme === 'dark' ? 'border-slate-700/30' : 'border-slate-100'}`}>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Nama</label>
                    <div className={`border px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Email</label>
                    <div className={`border px-6 py-4 rounded-2xl font-bold text-sm italic transition-all ${
                      theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {user.email}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">Email tidak dapat diubah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'landing' ? (
          <LandingPage 
            user={user} 
            theme={theme}
            onStart={() => {
              if (!user) handleGoogleLogin();
              else setView('form');
            }} 
            onLogin={handleGoogleLogin}
            onViewPlans={() => setShowPricingModal(true)}
          />
        ) : view === 'form' ? (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setView('landing')}
                className={`p-2 border rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'
                }`}
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <h2 className={`text-2xl font-bold transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Buat Dokumen RPM Baru</h2>
            </div>
            <InputForm theme={theme} onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        ) : null}
      </main>

      {showPricingModal && (
        <PricingModal 
          theme={theme}
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