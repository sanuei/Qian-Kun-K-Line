import React, { useState, useEffect } from 'react';
import { APP_NAME_CN, APP_NAME_TW, TRANSLATIONS } from './constants';
import InputForm from './components/InputForm';
import ChartRenderer from './components/ChartRenderer';
import Report from './components/Report';
import AdminPanel from './components/AdminPanel';
import { UserInput, CandleData, AnalysisResult, Language } from './types';
import { generateLifeKLine } from './services/chartLogic';
import { analyzeDestiny } from './services/geminiService';
import { getUsageState, incrementUsage } from './services/storageService';
import { Compass, RefreshCw, Settings, Twitter, Lock, TrendingUp, Brain, Gem, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh-CN');
  const t = TRANSLATIONS[lang];
  
  const [step, setStep] = useState<'FORM' | 'RESULT'>('FORM');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInput | null>(null);
  
  // Usage State
  const [usageCount, setUsageCount] = useState(0);
  const [extraTrials, setExtraTrials] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  
  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    refreshUsage();
  }, []);

  const refreshUsage = () => {
    const state = getUsageState();
    setUsageCount(state.count);
    setExtraTrials(state.extraTrials || 0);
    setIsActivated(state.isActivated);
  };

  const handleFormSubmit = async (input: UserInput) => {
    setLoading(true);
    setCurrentUser(input);
    
    try {
      // Logic Check handled in Form, but double check here
      const state = getUsageState();
      // Calculate total limit dynamically
      const limit = 3 + (state.extraTrials || 0);
      
      if (!state.isActivated && state.count >= limit) {
        alert(t.limitReached);
        setLoading(false);
        return;
      }

      // Generate Data
      const data = generateLifeKLine(input);
      setChartData(data);
      
      // Analyze
      const analysisResult = await analyzeDestiny(input, data, lang);
      setAnalysis(analysisResult);
      
      // Increment Usage
      incrementUsage();
      refreshUsage();

      setStep('RESULT');
    } catch (e) {
      console.error(e);
      alert("Error calculating destiny.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('FORM');
    setChartData([]);
    setAnalysis(null);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'sonic666') {
      setShowAdmin(true);
      setShowAdminLogin(false);
      setAdminPasswordInput('');
      setAdminError('');
    } else {
      setAdminError(t.wrongPassword);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EB] text-[#2C1810] font-sans relative selection:bg-[#A93226] selection:text-white flex flex-col">
      {/* Background Ba Gua Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
        <svg viewBox="0 0 500 500" className="w-[800px] h-[800px] animate-spin-slow">
           <g fill="none" stroke="currentColor" strokeWidth="2">
             <circle cx="250" cy="250" r="200" />
             <circle cx="250" cy="250" r="100" />
             <path d="M250 50 L250 150 M250 350 L250 450 M50 250 L150 250 M350 250 L450 250" />
             <path d="M108 108 L179 179 M321 321 L392 392 M392 108 L321 179 M179 321 L108 392" />
           </g>
        </svg>
      </div>

      {/* Header */}
      <header className="w-full border-b-2 border-[#D7CCC8] py-4 px-6 sticky top-0 z-40 bg-[#F7F5EB]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#2C1810] text-[#F7F5EB] p-2 rounded-sm border border-[#A93226]">
              <Compass size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest font-serif">{lang === 'zh-CN' ? APP_NAME_CN : APP_NAME_TW}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Admin Toggle (Hidden/Small) */}
             <button onClick={() => setShowAdminLogin(true)} className="text-[#8B7E74] hover:text-[#2C1810] transition-colors p-2" title={t.admin}>
               <Settings size={18} />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col">
        
        {step === 'FORM' ? (
          <div className="animate-fade-in-up flex flex-col md:flex-row gap-12 items-start justify-center mt-4">
            
            {/* Left Column: Intro & Features */}
            <div className="flex-1 space-y-10 max-w-xl">
               <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2C1810] leading-tight drop-shadow-sm">
                    {t.subtitle}
                  </h1>
                  <p className="text-lg text-[#5D4037] font-serif leading-relaxed">
                    {t.desc}
                  </p>
                  <div className="w-24 h-1 bg-[#A93226]"></div>
               </div>

               {/* Features Grid */}
               <div className="space-y-6">
                 <h3 className="text-[#8B7E74] text-sm font-bold tracking-widest uppercase border-b border-[#D7CCC8] pb-2 mb-4">
                   {t.featuresTitle}
                 </h3>
                 
                 <div className="flex gap-4 items-start group">
                   <div className="p-3 bg-[#F2F0E9] rounded-sm border border-[#D7CCC8] text-[#A93226] group-hover:bg-[#A93226] group-hover:text-white transition-colors">
                     <TrendingUp size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-[#2C1810] text-lg">{t.feature1Title}</h4>
                     <p className="text-[#5D4037] text-sm leading-relaxed">{t.feature1Desc}</p>
                   </div>
                 </div>

                 <div className="flex gap-4 items-start group">
                   <div className="p-3 bg-[#F2F0E9] rounded-sm border border-[#D7CCC8] text-[#9A7D0A] group-hover:bg-[#9A7D0A] group-hover:text-white transition-colors">
                     <Brain size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-[#2C1810] text-lg">{t.feature2Title}</h4>
                     <p className="text-[#5D4037] text-sm leading-relaxed">{t.feature2Desc}</p>
                   </div>
                 </div>

                 <div className="flex gap-4 items-start group">
                   <div className="p-3 bg-[#F2F0E9] rounded-sm border border-[#D7CCC8] text-[#1D8348] group-hover:bg-[#1D8348] group-hover:text-white transition-colors">
                     <Gem size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-[#2C1810] text-lg">{t.feature3Title}</h4>
                     <p className="text-[#5D4037] text-sm leading-relaxed">{t.feature3Desc}</p>
                   </div>
                 </div>
               </div>

               {/* Sample Result Preview (Mini) */}
               <div className="bg-white/50 border border-[#D7CCC8] p-6 rounded-sm relative overflow-hidden group hover:shadow-lg transition-all cursor-default">
                  <div className="absolute top-2 right-2 text-[#D7CCC8] opacity-50">
                    <Sparkles size={40} />
                  </div>
                  <h4 className="text-xs text-[#8B7E74] font-bold tracking-widest uppercase mb-3">{t.sampleTitle}</h4>
                  <div className="space-y-3 font-serif">
                    <p className="text-[#2C1810] text-sm border-l-2 border-[#A93226] pl-3 italic">
                      "{t.sampleDestiny}"
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#5D4037] bg-[#F2F0E9] p-2 rounded">
                       <span className="font-bold">策略:</span>
                       <span>{t.sampleAdvice}</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full max-w-lg md:sticky md:top-24">
              <InputForm 
                onSubmit={handleFormSubmit} 
                isLoading={loading} 
                lang={lang}
                setLang={setLang}
                usageCount={usageCount}
                extraTrials={extraTrials}
                isActivated={isActivated}
                onActivateSuccess={refreshUsage}
              />
            </div>

          </div>
        ) : (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto w-full">
            {/* Toolbar */}
            <div className="flex justify-between items-center border-b-2 border-[#D7CCC8] pb-4">
              <div>
                 <h2 className="text-2xl font-serif font-bold text-[#2C1810]">{t.reportTitle}</h2>
                 <p className="text-sm text-[#5D4037] mt-1 font-serif">
                   {currentUser?.name || '---'} | {currentUser?.birthDate}
                 </p>
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-[#2C1810] hover:text-[#A93226] font-bold px-4 py-2 border border-[#D7CCC8] hover:border-[#A93226] transition-colors"
              >
                <RefreshCw size={16} />
                <span>{t.recalc}</span>
              </button>
            </div>

            {/* Chart */}
            <ChartRenderer data={chartData} lang={lang} />

            {/* Analysis */}
            <Report data={analysis} lang={lang} />
            
          </div>
        )}
      </main>

      <footer className="w-full py-8 text-center text-[#8B7E74] text-xs font-serif border-t border-[#D7CCC8] bg-[#F7F5EB] mt-auto">
        <div className="flex flex-col items-center gap-2">
          <p>乾坤K线 | 天机测算 | 仅供娱乐</p>
          <div className="flex items-center gap-2 mt-2">
            <a 
              href="https://x.com/sonic_yann" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#5D4037] hover:text-[#1DA1F2] transition-colors group"
            >
              <Twitter size={14} className="group-hover:text-[#1DA1F2]" />
              <span>{t.contact}: @sonic_yann</span>
            </a>
          </div>
        </div>
      </footer>

      {showAdmin && (
        <div className="fixed inset-0 z-[100]">
          <AdminPanel onClose={() => setShowAdmin(false)} />
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-[#2C1810]/60">
           <div className="bg-[#FDFBF7] p-8 w-80 rounded-sm border-2 border-[#A93226] shadow-2xl animate-fade-in-up">
              <div className="text-center mb-6">
                <Lock className="w-8 h-8 mx-auto text-[#A93226] mb-2" />
                <h3 className="text-xl font-serif font-bold text-[#2C1810]">{t.adminLoginTitle}</h3>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder={t.adminPasswordPlaceholder}
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-[#8B7E74] bg-transparent text-center focus:border-[#A93226] outline-none text-[#2C1810]"
                  autoFocus
                />
                {adminError && <p className="text-xs text-[#A93226] text-center">{adminError}</p>}
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {setShowAdminLogin(false); setAdminError(''); setAdminPasswordInput('');}}
                    className="flex-1 py-2 text-sm text-[#5D4037] border border-[#D7CCC8] hover:bg-[#EFEBE9]"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 text-sm text-[#FDFBF7] bg-[#A93226] hover:bg-[#922B21]"
                  >
                    {t.enter}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
