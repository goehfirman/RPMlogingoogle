import React from 'react';
import { Plan, SUBSCRIPTION_PLANS } from '../types';
import { Check, Zap, Star, ShieldCheck, X, Clock, Calendar } from 'lucide-react';

interface PricingModalProps {
  onSelectPlan: (plan: Plan) => void;
  onClose: () => void;
  theme: 'dark' | 'light';
}

const PricingModal: React.FC<PricingModalProps> = ({ onSelectPlan, onClose, theme }) => {
  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in transition-all ${
      theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-500/30'
    }`}>
      <div className={`border rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden relative animate-scale-in transition-all ${
        theme === 'dark' ? 'bg-[#1E293B] border-slate-700/50' : 'bg-white border-slate-200'
      }`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-all z-10 ${
            theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-12 min-h-[500px]">
          {/* Left Side: Info */}
          <div className="md:col-span-5 bg-slate-900/50 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden border-r border-slate-700/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <div className={`inline-flex p-4 rounded-3xl mb-8 border transition-all ${
                theme === 'dark' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200'
              }`}>
                <Zap className="text-orange-500" size={32} />
              </div>
              <h3 className={`text-3xl font-bold mb-4 tracking-tight transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Pilih Paket Premium</h3>
              <p className={`text-sm leading-relaxed mb-10 transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Buka seluruh potensi kecerdasan buatan untuk membantu administrasi mengajar Anda menjadi lebih cepat dan profesional.
              </p>

              <div className="space-y-5">
                {[
                  'Generate RPM Tanpa Batas',
                  'Simpan & Edit Dokumen',
                  'Simpan Otomatis di Cloud',
                  'Prioritas Fitur Baru'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <Check size={12} className="text-green-500" strokeWidth={3} />
                    </div>
                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-700/50 relative z-10">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <ShieldCheck size={16} className="text-green-500" />
                <span>Pembayaran Aman & Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Right Side: Plans */}
          <div className="md:col-span-7 p-8 md:p-12 bg-transparent overflow-y-auto max-h-[90vh] md:max-h-none">
            <div className="grid gap-5">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => onSelectPlan(plan)}
                  className={`group relative flex items-center justify-between p-6 rounded-3xl transition-all duration-300 text-left border-2 ${
                    plan.id === 'lifetime' 
                      ? (theme === 'dark' ? 'bg-orange-500/5 border-orange-500/40 shadow-lg shadow-orange-500/5 hover:bg-orange-500/10' : 'bg-orange-50 border-orange-500/40 shadow-xl shadow-orange-500/5 hover:bg-orange-100')
                      : (theme === 'dark' ? 'bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-slate-200/50')
                  }`}
                >
                  {plan.id === 'lifetime' && (
                    <div className="absolute -top-3 right-8 bg-orange-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-widest shadow-lg shadow-orange-900/20">
                      <Star size={10} fill="white" /> Best Value
                    </div>
                  )}
                  
                  <div className="flex gap-5 items-center">
                    <div className={`p-3.5 rounded-2xl transition-all border border-white/5 ${
                      plan.id === 'lifetime' 
                        ? 'bg-orange-500/20 text-orange-500' 
                        : (theme === 'dark' ? 'bg-slate-700/50 text-slate-400 group-hover:text-slate-200' : 'bg-slate-100 text-slate-500 group-hover:text-slate-900')
                    }`}>
                      {plan.id === 'monthly' ? <Clock size={22} /> : plan.id === 'quarterly' ? <Calendar size={22} /> : <Zap size={22} />}
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg transition-colors tracking-tight ${
                        theme === 'dark' ? 'text-white group-hover:text-orange-400' : 'text-slate-900 group-hover:text-orange-600'
                      }`}>{plan.name}</h4>
                      <p className={`text-xs font-medium transition-all ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{plan.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-black transition-colors ${
                      theme === 'dark' ? 'text-white group-hover:text-orange-500' : 'text-slate-900 group-hover:text-orange-600'
                    }`}>
                      <span className={`text-sm font-bold mr-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>IDR</span>
                      {plan.price.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">Pembayaran Sekali</div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] font-bold text-slate-600 mt-10 leading-relaxed uppercase tracking-wider">
              Dengan memilih paket, Anda menyetujui Ketentuan Layanan. <br/>
              Akses premium otomatis aktif setelah konfirmasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
