import React from 'react';
import { AnalysisResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import RatingSystem from './RatingSystem';
import { Bitcoin, TrendingUp } from 'lucide-react';

interface Props {
  data: AnalysisResult | null;
  lang: Language;
}

const Report: React.FC<Props> = ({ data, lang }) => {
  if (!data) return null;
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-8 animate-fade-in-up font-serif">
      {/* Scroll Container */}
      <div className="bg-[#FDFBF7] border-y-8 border-[#2C1810] shadow-2xl relative p-8">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 bg-yellow-50 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        {/* Header stamp */}
        <div className="flex items-center justify-center mb-8">
           <div className="w-12 h-12 border-2 border-[#A93226] rounded-sm flex items-center justify-center text-[#A93226] font-bold text-xl rotate-45 transform">
              <span className="-rotate-45">天机</span>
           </div>
           <h3 className="text-2xl text-[#2C1810] font-bold mx-4 tracking-[0.2em] border-b-2 border-[#2C1810] pb-2">{t.reportTitle}</h3>
           <div className="w-12 h-12 border-2 border-[#A93226] rounded-sm flex items-center justify-center text-[#A93226] font-bold text-xl rotate-45 transform">
              <span className="-rotate-45">秘测</span>
           </div>
        </div>

        {/* Overall Destiny */}
        <div className="mb-8 relative">
           <h4 className="text-[#8B7E74] text-sm font-bold tracking-widest mb-2 border-l-4 border-[#A93226] pl-2">{t.assetClass}</h4>
           <p className="text-[#2C1810] text-lg leading-loose text-justify indent-8">
             {data.overallDestiny}
           </p>
        </div>

        {/* Lucky Assets Card */}
        {data.luckyAssets && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Stock */}
             <div className="bg-[#F7F5EB] border border-[#D7CCC8] p-4 rounded-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#A93226] opacity-10 rounded-bl-full"></div>
                <div className="p-2 bg-[#2C1810] text-[#FDFBF7] rounded-full mb-3">
                  <TrendingUp size={20} />
                </div>
                <h5 className="text-[#8B7E74] text-xs font-bold tracking-widest uppercase mb-1">{t.stock}</h5>
                <p className="text-xl font-bold text-[#A93226] mb-2">{data.luckyAssets.stock.name} <span className="text-xs opacity-75">({data.luckyAssets.stock.symbol})</span></p>
                <p className="text-xs text-[#5D4037] italic leading-relaxed">"{data.luckyAssets.stock.reason}"</p>
             </div>

             {/* Crypto */}
             <div className="bg-[#F7F5EB] border border-[#D7CCC8] p-4 rounded-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#D4AF37] opacity-10 rounded-bl-full"></div>
                <div className="p-2 bg-[#2C1810] text-[#FDFBF7] rounded-full mb-3">
                  <Bitcoin size={20} />
                </div>
                <h5 className="text-[#8B7E74] text-xs font-bold tracking-widest uppercase mb-1">{t.crypto}</h5>
                <p className="text-xl font-bold text-[#D4AF37] mb-2">{data.luckyAssets.crypto.name} <span className="text-xs opacity-75">({data.luckyAssets.crypto.symbol})</span></p>
                <p className="text-xs text-[#5D4037] italic leading-relaxed">"{data.luckyAssets.crypto.reason}"</p>
             </div>
          </div>
        )}

        {/* Turning Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {data.turningPoints.map((tp, idx) => (
            <div key={idx} className="bg-[#F2F0E9] p-4 border border-[#D7CCC8] relative group hover:border-[#2C1810] transition-colors">
              <div className="absolute -top-3 left-4 bg-[#2C1810] text-[#FDFBF7] px-2 py-0.5 text-xs">
                {tp.year} ({tp.age}岁)
              </div>
              <h5 className={`mt-2 font-bold text-lg ${
                tp.type === 'BULL' ? 'text-[#A93226]' : 
                tp.type === 'BEAR' ? 'text-[#1D8348]' : 'text-[#9A7D0A]'
              }`}>
                {tp.type === 'BULL' ? t.bull : tp.type === 'BEAR' ? t.bear : t.volatile}
              </h5>
              <p className="text-sm text-[#5D4037] mt-2 leading-relaxed">
                {tp.description}
              </p>
            </div>
          ))}
        </div>

        {/* Strategy */}
        <div className="bg-[#2C1810] text-[#FDFBF7] p-6 rounded-sm relative overflow-hidden mb-8">
          <div className="absolute -right-4 -top-4 text-[#ffffff10]">
             <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.8l6.7 13.2H5.3L12 5.8z"/></svg>
          </div>
          <h4 className="text-[#9A7D0A] font-bold tracking-widest mb-3 border-b border-[#5D4037] pb-1 inline-block">{t.strategy}</h4>
          <p className="text-lg font-light italic opacity-90">
            "{data.financialAdvice}"
          </p>
        </div>

        {/* Rating System */}
        <RatingSystem lang={lang} />
        
      </div>
    </div>
  );
};

export default Report;
