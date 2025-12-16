import React, { useState } from 'react';
import { UserInput, Gender, Language } from '../types';
import { Sparkles, Lock, Key, Globe, Share2, CheckCircle2, Copy, X, ShoppingBag, ExternalLink } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { activateApp, addExtraTrial } from '../services/storageService';

interface Props {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
  lang: Language;
  setLang: (l: Language) => void;
  usageCount: number;
  extraTrials: number;
  isActivated: boolean;
  onActivateSuccess: () => void;
}

const InputForm: React.FC<Props> = ({ 
  onSubmit, 
  isLoading, 
  lang, 
  setLang,
  usageCount,
  extraTrials,
  isActivated,
  onActivateSuccess
}) => {
  const t = TRANSLATIONS[lang];
  const [showActivation, setShowActivation] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Invite state
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const [formData, setFormData] = useState<UserInput>({
    name: '',
    gender: Gender.MALE,
    birthDate: '1995-01-01',
    birthTime: '12:00',
    birthPlace: ''
  });

  const baseLimit = 3;
  const totalLimit = baseLimit + extraTrials;
  const remaining = Math.max(0, totalLimit - usageCount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActivated && remaining <= 0) {
      setShowActivation(true);
      return;
    }
    onSubmit(formData);
  };

  const handleActivate = () => {
    const success = activateApp(activationCode.trim());
    if (success) {
      onActivateSuccess();
      setShowActivation(false);
      setErrorMsg('');
      alert(t.activated);
    } else {
      setErrorMsg(t.invalidCode);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const text = lang === 'zh-CN' 
      ? `我正在使用《乾坤K线》推演人生运势，快来看看你的本命资产是什么！ https://qiankun-kline.app`
      : `我正在使用《乾坤K線》推演人生運勢，快來看看你的本命資產是什麼！ https://qiankun-kline.app`;
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.warn('Clipboard failed, ignoring', err);
    }

    // Simulate "Verification" delay
    setTimeout(() => {
        // Grant reward
        addExtraTrial();
        onActivateSuccess(); 
        
        setShareSuccess(true);
        setIsSharing(false);
        
        // Auto close after 2 seconds
        setTimeout(() => {
           setShareSuccess(false);
           setShowActivation(false);
        }, 2000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative">
      {/* Ancient Paper Container */}
      <div className="bg-[#FDFBF7] rounded-sm shadow-2xl border-2 border-[#8B7E74] p-1 relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(44,24,16,0.2)]">
        {/* Inner Border */}
        <div className="border border-[#8B7E74] p-8 border-dashed relative z-10">
          
          {/* Header & Lang Switch */}
          <div className="flex justify-between items-start mb-8">
             <div className="text-center w-full">
                <h2 className="text-3xl font-serif text-[#2C1810] font-bold tracking-widest mb-2">{t.title}</h2>
                <div className="w-16 h-1 bg-[#A93226] mx-auto mb-2"></div>
                <p className="text-[#5D4037] text-xs font-serif">{t.desc}</p>
             </div>
             <button 
                onClick={() => setLang(lang === 'zh-CN' ? 'zh-TW' : 'zh-CN')}
                className="absolute top-4 right-4 p-2 text-[#5D4037] hover:text-[#2C1810] transition-colors flex items-center gap-1 border border-[#D7CCC8] rounded hover:bg-[#EFEBE9] z-20"
             >
               <Globe size={14} />
               <span className="text-xs font-serif">{lang === 'zh-CN' ? '繁' : '简'}</span>
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 font-serif">
            {/* Name & Gender */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8B7E74] tracking-widest block text-center border-b border-[#D7CCC8] pb-1 mb-2">{t.name}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-2 py-2 text-center bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#A93226] outline-none transition-all text-[#2C1810] placeholder-[#D7CCC8]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8B7E74] tracking-widest block text-center border-b border-[#D7CCC8] pb-1 mb-2">{t.gender}</label>
                <div className="flex gap-2">
                  {[Gender.MALE, Gender.FEMALE].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, gender: g }))}
                      className={`flex-1 py-1 text-sm border transition-all ${
                        formData.gender === g 
                        ? 'border-[#A93226] bg-[#A93226] text-[#FDFBF7]' 
                        : 'border-[#D7CCC8] text-[#8B7E74] hover:border-[#8B7E74]'
                      }`}
                    >
                      {g === Gender.MALE ? t.male : t.female}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8B7E74] tracking-widest block text-center border-b border-[#D7CCC8] pb-1 mb-2">{t.birthDate}</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-2 text-center bg-[#F2F0E9] border border-[#D7CCC8] focus:border-[#A93226] outline-none text-[#2C1810]"
              />
            </div>

            {/* Time & Place */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-[#8B7E74] tracking-widest block text-center border-b border-[#D7CCC8] pb-1 mb-2">{t.birthTime}</label>
                 <input
                  type="time"
                  name="birthTime"
                  value={formData.birthTime}
                  onChange={handleChange}
                  className="w-full px-2 py-2 text-center bg-[#F2F0E9] border border-[#D7CCC8] focus:border-[#A93226] outline-none text-[#2C1810]"
                />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-[#8B7E74] tracking-widest block text-center border-b border-[#D7CCC8] pb-1 mb-2">{t.birthPlace}</label>
                 <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  className="w-full px-2 py-2 text-center bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#A93226] outline-none text-[#2C1810]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-8 bg-[#2C1810] text-[#FDFBF7] font-bold text-lg tracking-[0.2em] shadow-lg border border-[#5D4037] hover:bg-[#43291F] flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#ffffff10] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-[#A93226]" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 border-2 border-[#FDFBF7] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#FDFBF7] rounded-full"></div>
                  </div>
                  <span>{t.submit}</span>
                </>
              )}
            </button>

            {/* Usage Counter */}
            <div className="text-center pt-2">
               {!isActivated ? (
                 <p className="text-xs text-[#A93226]">
                   {t.freeLeft}: <span className="font-bold text-lg">{remaining}</span> / {totalLimit}
                 </p>
               ) : (
                 <p className="text-xs text-[#1D8348] flex items-center justify-center gap-1">
                   <Lock size={12} />
                   {t.activated}
                 </p>
               )}
            </div>
          </form>
        </div>
        
        {/* Decor Corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#2C1810]"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#2C1810]"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#2C1810]"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#2C1810]"></div>
      </div>

      {/* Activation/Limit Modal */}
      {showActivation && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#2C1810]/80 backdrop-blur-md pt-24 pb-8 px-4 animate-fade-in">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up border-2 border-[#D7CCC8] max-h-[90vh] overflow-y-auto">
             {/* Header */}
             <div className="bg-gradient-to-r from-[#2C1810] via-[#43291F] to-[#2C1810] text-[#FDFBF7] p-6 text-center relative">
               <button 
                 onClick={() => setShowActivation(false)}
                 className="absolute right-4 top-4 text-[#8B7E74] hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                 aria-label="关闭"
               >
                 <X size={22} />
               </button>
               <div className="flex items-center justify-center gap-3 mb-3">
                 <div className="p-3 bg-[#A93226]/20 rounded-full border-2 border-[#A93226]/30">
                   <Lock className="w-6 h-6 text-[#A93226]" />
                 </div>
                 <h3 className="text-2xl font-serif font-bold tracking-widest">{t.unlockTitle}</h3>
               </div>
               <p className="text-sm opacity-90 mt-2 font-sans">{t.limitDesc}</p>
             </div>

             <div className="p-6 space-y-4 bg-gradient-to-b from-[#FDFBF7] to-[#F7F5EB]">
               
               {/* Option 1: Share */}
               <div className="bg-white rounded-xl p-6 border-2 border-[#E0F2F1] shadow-md hover:shadow-lg transition-all hover:border-[#1D8348] group">
                 <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] rounded-xl flex items-center justify-center text-[#1D8348] shadow-sm group-hover:scale-110 transition-transform">
                      <Share2 size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#2C1810] mb-1 flex items-center gap-2">
                        {t.unlockOption1}
                        <span className="text-xs bg-[#1D8348]/10 text-[#1D8348] px-2 py-0.5 rounded-full font-normal">免费</span>
                      </h4>
                      <p className="text-sm text-[#5D4037] leading-relaxed">{t.unlockOption1Desc}</p>
                    </div>
                 </div>
                 
                 <button 
                   onClick={handleShare}
                   disabled={isSharing || shareSuccess}
                   className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                     shareSuccess 
                     ? 'bg-gradient-to-r from-[#1D8348] to-[#16A085] text-white cursor-default'
                     : 'bg-white border-2 border-[#1D8348] text-[#1D8348] hover:bg-gradient-to-r hover:from-[#1D8348] hover:to-[#16A085] hover:text-white hover:border-transparent hover:shadow-md'
                   }`}
                 >
                   {shareSuccess ? (
                     <>
                       <CheckCircle2 size={18} />
                       <span>{t.verified} (+1 次免费)</span>
                     </>
                   ) : (
                     <>
                       {isSharing ? <Sparkles className="animate-spin" size={18} /> : <Copy size={18} />}
                       <span>{isSharing ? '验证中...' : t.shareBtn}</span>
                     </>
                   )}
                 </button>
                 {shareSuccess && (
                   <p className="text-xs text-[#1D8348] mt-3 text-center animate-fade-in flex items-center justify-center gap-1">
                     <CheckCircle2 size={14} />
                     {t.shareToast}
                   </p>
                 )}
               </div>

               {/* Divider */}
               <div className="flex items-center gap-4 my-6">
                 <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D7CCC8] to-[#D7CCC8]"></div>
                 <span className="text-xs text-[#8B7E74] font-bold tracking-widest">或</span>
                 <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#D7CCC8] to-[#D7CCC8]"></div>
               </div>

               {/* Option 2: Xianyu */}
               <div className="bg-gradient-to-br from-[#FF6B35] via-[#F7931E] to-[#FF8C42] rounded-xl p-6 border-2 border-white/20 shadow-lg hover:shadow-xl transition-all group">
                 <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                       <ShoppingBag size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        {t.xianyuBuy}
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-normal">推荐</span>
                      </h4>
                      <p className="text-sm text-white/95 leading-relaxed">{t.xianyuBuyDesc}</p>
                    </div>
                 </div>
                 
                 <a
                   href="https://m.tb.cn/h.7dZbeyr?tk=sKQBfFIFuK8"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-3.5 bg-white text-[#FF6B35] rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:bg-gray-50 hover:shadow-xl hover:scale-[1.02] group"
                 >
                   <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                   <span>{t.xianyuLink}</span>
                 </a>
                 <p className="text-xs text-white/90 mt-3 text-center flex items-center justify-center gap-1">
                   <span>✨</span>
                   在闲鱼购买后自动发货激活码
                 </p>
               </div>

               {/* Activation Code Input Section */}
               <div className="mt-6 pt-6 border-t-2 border-[#D7CCC8]">
                 <div className="bg-white rounded-xl p-6 border-2 border-[#D7CCC8] shadow-md">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-gradient-to-br from-[#2C1810] to-[#43291F] rounded-lg flex items-center justify-center text-white">
                       <Key size={20} />
                     </div>
                     <div>
                       <h4 className="text-base font-bold text-[#2C1810]">已有激活码？</h4>
                       <p className="text-xs text-[#5D4037]">输入激活码立即解锁</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <input 
                       type="text"
                       placeholder={t.inputPlaceholder}
                       value={activationCode}
                       onChange={(e) => setActivationCode(e.target.value)}
                       className="flex-1 border-2 border-[#D7CCC8] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#A93226] focus:ring-2 focus:ring-[#A93226]/20 uppercase font-mono transition-all"
                     />
                     <button 
                       onClick={handleActivate}
                       className="bg-gradient-to-r from-[#2C1810] to-[#43291F] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all hover:scale-105"
                     >
                       {t.activate}
                     </button>
                   </div>
                   {errorMsg && (
                     <p className="text-xs text-[#A93226] mt-2 flex items-center gap-1">
                       <span>⚠️</span>
                       {errorMsg}
                     </p>
                   )}
                 </div>
               </div>

             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputForm;
