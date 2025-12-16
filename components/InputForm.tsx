import React, { useState } from 'react';
import { UserInput, Gender, Language } from '../types';
import { Sparkles, Lock, Key, Globe, Share2, CheckCircle2, Copy, X } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1810]/70 backdrop-blur-sm p-4">
          <div className="bg-[#FDFBF7] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up border border-[#D7CCC8]">
             {/* Header */}
             <div className="bg-[#2C1810] text-[#FDFBF7] p-6 text-center relative">
               <button 
                 onClick={() => setShowActivation(false)}
                 className="absolute right-4 top-4 text-[#8B7E74] hover:text-white"
               >
                 <X size={20} />
               </button>
               <Lock className="w-8 h-8 mx-auto text-[#A93226] mb-2" />
               <h3 className="text-2xl font-serif font-bold tracking-widest">{t.unlockTitle}</h3>
               <p className="text-sm opacity-80 mt-1 font-sans">{t.limitDesc}</p>
             </div>

             <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#D7CCC8]">
               
               {/* Option 1: Share */}
               <div className="flex-1 p-8 text-center bg-[#F7F5EB] flex flex-col justify-between">
                 <div>
                    <div className="w-12 h-12 bg-[#E0F2F1] rounded-full flex items-center justify-center mx-auto mb-4 text-[#1D8348]">
                      <Share2 size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-[#2C1810] mb-2">{t.unlockOption1}</h4>
                    <p className="text-sm text-[#5D4037] mb-6">{t.unlockOption1Desc}</p>
                 </div>
                 
                 <button 
                   onClick={handleShare}
                   disabled={isSharing || shareSuccess}
                   className={`w-full py-3 rounded font-bold transition-all flex items-center justify-center gap-2 ${
                     shareSuccess 
                     ? 'bg-[#1D8348] text-white cursor-default'
                     : 'bg-white border-2 border-[#1D8348] text-[#1D8348] hover:bg-[#1D8348] hover:text-white'
                   }`}
                 >
                   {shareSuccess ? (
                     <>
                       <CheckCircle2 size={18} />
                       <span>{t.verified} (+1)</span>
                     </>
                   ) : (
                     <>
                       {isSharing ? <Sparkles className="animate-spin" size={18} /> : <Copy size={18} />}
                       <span>{isSharing ? '验证中...' : t.shareBtn}</span>
                     </>
                   )}
                 </button>
                 {shareSuccess && <p className="text-xs text-[#1D8348] mt-2 animate-fade-in">{t.shareToast}</p>}
               </div>

               {/* Option 2: Pay */}
               <div className="flex-1 p-8 text-center bg-white relative">
                 <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4 text-[#A93226]">
                    <Key size={24} />
                 </div>
                 <h4 className="text-lg font-bold text-[#2C1810] mb-2">{t.unlockOption2}</h4>
                 <p className="text-sm text-[#5D4037] mb-4">{t.unlockOption2Desc}</p>
                 
                 <div className="mb-4 bg-white p-2 rounded border border-gray-200 inline-block shadow-inner">
                    {/* QR Code Container */}
                    <div className="w-32 h-32 bg-[#2C1810] flex items-center justify-center text-white relative overflow-hidden group cursor-pointer">
                        {/* 
                           Display the local QR code image. 
                           User must place 'payment_qr.png' in the public folder.
                           If not found, it shows alt text which is accessible.
                        */}
                       <img 
                          src="/payment_qr.png" 
                          alt="WeChat Pay QR" 
                          className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                          onError={(e) => {
                            // Fallback if image missing
                            e.currentTarget.style.display = 'none';
                          }}
                       />
                       {/* Fallback Text if image fails to load or while loading */}
                       <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gray-100 text-gray-400 text-xs">
                          <span>Loading...</span>
                       </div>
                    </div>
                 </div>
                 
                 <p className="text-2xl font-bold text-[#A93226] mb-2">{t.price}</p>
                 <p className="text-xs text-[#8B7E74] mb-4">{t.scanToPay}</p>

                 <div className="text-xs text-[#5D4037] bg-[#F2F0E9] p-3 rounded">
                    <p className="mb-1">{t.contactSupport}:</p>
                    <div className="flex items-center justify-center gap-2 font-mono font-bold text-[#2C1810]">
                       <span>sonic_yann</span>
                       <button onClick={() => navigator.clipboard.writeText('sonic_yann')} className="text-[#A93226]">
                         <Copy size={12} />
                       </button>
                    </div>
                 </div>

                 {/* Code Input */}
                 <div className="mt-4 pt-4 border-t border-gray-100">
                   <div className="flex gap-2">
                     <input 
                       type="text"
                       placeholder={t.inputPlaceholder}
                       value={activationCode}
                       onChange={(e) => setActivationCode(e.target.value)}
                       className="flex-1 border border-[#D7CCC8] rounded px-3 py-2 text-sm outline-none focus:border-[#A93226] uppercase font-mono"
                     />
                     <button 
                       onClick={handleActivate}
                       className="bg-[#2C1810] text-white px-4 py-2 rounded text-sm hover:bg-[#43291F]"
                     >
                       {t.activate}
                     </button>
                   </div>
                   {errorMsg && <p className="text-xs text-[#A93226] mt-2 text-left">{errorMsg}</p>}
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
