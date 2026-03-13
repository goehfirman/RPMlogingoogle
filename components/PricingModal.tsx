import React from 'react';
import { Plan, SUBSCRIPTION_PLANS } from '../types';
import { Check, Zap, Star, ShieldCheck, X, Clock, Calendar } from 'lucide-react';


interface PricingModalProps {
  onSelectPlan: (plan: Plan) => void;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onSelectPlan, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-12">
          {/* Left Side: Info */}
          <div className="md:col-span-4 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <div className="inline-flex p-3 bg-purple-600/20 rounded-2xl mb-6">
                <Zap className="text-purple-400" size={32} />
              </div>
              <h3 className="text-3xl font-bold mb-4">Pilih Paket Premium</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Buka seluruh potensi kecerdasan buatan untuk membantu administrasi mengajar Anda menjadi lebih cepat dan profesional.
              </p>

              <div className="space-y-4">
                {[
                  'Generate RPM Tanpa Batas',
                  'Simpan & Edit Dokumen',
                  'Template Standar Nasional',
                  'Support 24/7'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Check size={12} className="text-purple-400" />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 relative z-10">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <ShieldCheck size={16} />
                <span>Pembayaran Aman & Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Right Side: Plans */}
          <div className="md:col-span-8 p-8 md:p-12 bg-slate-50">
            <div className="grid gap-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => onSelectPlan(plan)}
                  className={`group relative flex items-center justify-between p-6 bg-white border-2 rounded-2xl transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-1 ${
                    plan.id === 'lifetime' 
                      ? 'border-purple-600 shadow-lg shadow-purple-100' 
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {plan.id === 'lifetime' && (
                    <div className="absolute -top-3 right-6 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                      <Star size={10} fill="white" /> Best Value
                    </div>
                  )}
                  
                  <div className="flex gap-4 items-center">
                    <div className={`p-3 rounded-xl ${
                      plan.id === 'lifetime' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-500'
                    } transition-colors`}>
                      {plan.id === 'monthly' ? <Clock size={24} /> : plan.id === 'quarterly' ? <Calendar size={24} /> : <Zap size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{plan.name}</h4>
                      <p className="text-xs text-slate-500">{plan.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">
                      IDR {plan.price.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pembayaran Sekali</div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-8 leading-relaxed">
              Dengan memilih paket, Anda menyetujui Ketentuan Layanan. <br/>
              Akses premium akan langsung aktif setelah pembayaran dikonfirmasi oleh sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
