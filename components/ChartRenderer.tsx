import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { CandleData, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  data: CandleData[];
  lang: Language;
}

const CustomTooltip = ({ active, payload, label, lang }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as CandleData;
    const isUp = d.close >= d.open;
    // Ancient colors: Red (Yang/Up), Green (Yin/Down) or traditional Red/Green stock logic
    // Prompt asked for ancient style. In Chinese stocks: Red = Up, Green = Down. 
    // In ancient context, Red is auspicious. Let's stick to Red = Up.
    
    return (
      <div className="bg-[#FDFBF7] border-2 border-[#8B7E74] p-3 shadow-xl text-xs font-serif min-w-[150px]">
        <div className="flex justify-between items-center mb-2 border-b border-[#D7CCC8] pb-1">
          <span className="font-bold text-[#2C1810] text-sm">{d.year} {d.ganZhi}</span>
          <span className="text-[#5D4037]">({d.age})</span>
        </div>
        <div className="space-y-1 text-[#2C1810]">
           <div className="flex justify-between">
             <span className="text-[#8B7E74]">运势:</span>
             <span className={`font-bold ${isUp ? 'text-[#A93226]' : 'text-[#1D8348]'}`}>{d.score.toFixed(0)}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-[#8B7E74]">吉凶:</span>
             <span>{isUp ? '吉 (阳)' : '凶 (阴)'}</span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

const ChartRenderer: React.FC<Props> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];
  
  const chartData = useMemo(() => {
    return data.map(d => {
      const bodyBottom = Math.min(d.open, d.close);
      const bodyTop = Math.max(d.open, d.close);
      const isUp = d.close >= d.open;
      
      return {
        ...d,
        bodyRange: [bodyBottom, bodyTop],
        isUp
      };
    });
  }, [data]);

  return (
    <div className="w-full h-[500px] bg-[#FDFBF7] shadow-lg border-2 border-[#8B7E74] p-4 relative">
       {/* Background Decoration */}
       <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
         <svg viewBox="0 0 200 200" className="w-64 h-64 text-[#2C1810] animate-spin-slow">
            <path fill="currentColor" d="M100 0 L120 50 L100 100 L80 50 Z" /> {/* Simple placeholder for Ba Gua geometry */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" />
         </svg>
       </div>

      <div className="flex justify-between items-center mb-6 px-4 border-b border-[#EFEBE9] pb-2 relative z-10">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#2C1810]">流年大运走势</h3>
        </div>
        <div className="flex gap-4 text-xs font-serif">
           <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#A93226]"></div>
              <span className="text-[#2C1810]">{t.bull}</span>
           </div>
           <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#1D8348]"></div>
              <span className="text-[#2C1810]">{t.bear}</span>
           </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE9" />
          <XAxis 
            dataKey="age" 
            tick={{ fontSize: 10, fill: '#8B7E74', fontFamily: 'Noto Serif SC' }} 
            axisLine={{ stroke: '#8B7E74' }}
            tickLine={false}
            interval={9}
          />
          <YAxis 
            domain={[0, 100]} 
            hide={false} 
            tick={{ fontSize: 10, fill: '#8B7E74', fontFamily: 'Noto Serif SC' }} 
            axisLine={false} 
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip lang={lang} />} cursor={{ fill: 'rgba(139, 126, 116, 0.1)' }} />
          
          {/* Da Yun Separation */}
          {[10, 20, 30, 40, 50, 60, 70, 80].map(age => (
             <ReferenceLine key={age} x={age} stroke="#D7CCC8" strokeDasharray="5 5" />
          ))}

          <Bar dataKey="bodyRange" shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              const { isUp } = payload;
              // Cinnabar Red for Up, Jade Green for Down
              const color = isUp ? '#A93226' : '#1D8348';
              
              return (
                <g>
                   {/* Shadow/Ink stroke */}
                  <rect x={x} y={y} width={width} height={Math.max(2, height)} fill={color} stroke="#2C1810" strokeWidth={0.5} />
                  {/* Central Wick Line (Simulated) */}
                  <line x1={x + width/2} y1={y - 5} x2={x + width/2} y2={y + height + 5} stroke={color} strokeWidth={1} />
                </g>
              );
          }}>
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;
