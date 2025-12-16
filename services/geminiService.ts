import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, CandleData, AnalysisResult, Language } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY not found in environment");
    }
    return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const analyzeDestiny = async (input: UserInput, chartData: CandleData[], lang: Language): Promise<AnalysisResult> => {
  const ai = getClient();
  
  const keyPoints = chartData
    .filter((d, i) => i % 10 === 0 || d.isTurningPoint)
    .map(d => `Age ${d.age} (${d.year} ${d.ganZhi}): Score ${Math.round(d.close)} (${d.close > d.open ? 'Up' : 'Down'})`)
    .join('\n');

  const langInstruction = lang === 'zh-CN' ? 'Simplified Chinese (zh-CN)' : 'Traditional Chinese (zh-TW)';

  const prompt = `
    Role: You are a legendary ancient Chinese fortune teller (BaZi master) who is also a modern financial visionary. You speak in a mix of profound ancient Chinese idioms (文言文/Chengyu) and modern financial technical analysis terms.

    Input:
    User: ${input.name} (${input.gender})
    Birth: ${input.birthDate} ${input.birthTime}
    Place: ${input.birthPlace}
    Trend Data:
    ${keyPoints}

    Output Language: ${langInstruction}

    Constraints:
    1. **EXTREMELY POSITIVE TONE**: The goal is to provide **Emotional Value** and make the user feel confident and happy. 
       - Even if the trend data is down, interpret it as "Accumulation", "Rest", or "Wisdom building" (Hidden Dragon/Qian Long). 
       - NEVER be negative. Always find the silver lining.
       - Use "Bear Market" only to mean a time for study and self-improvement, not loss.
    
    Task:
    Provide a JSON response.
    
    1. overallDestiny: A summary paragraph (approx 80 words) describing the person's "Destiny Asset Class". Use glowing metaphors like "Blue Chip", "High Growth Unicorn", "Digital Gold". 
    2. turningPoints: Identify 3 critical ages. 
       - Type: BULL (Auspicious), BEAR (Preparation/Rest), VOLATILE (Transformation).
       - Description: One sentence prediction that emphasizes OPPORTUNITY.
    3. financialAdvice: A short strategy sentence (e.g., "Hedge against emotional volatility in your 30s").
    4. luckyAssets: Recommend one specific Stock (Symbol/Name) and one Crypto (Symbol/Name) that "spiritually" matches this user. 
       - E.g. If they are fiery, maybe TSLA or SOL. If steady, maybe BRK.B or BTC.
       - Provide a "Reason" that sounds mystical yet financial (e.g., "Your fire element resonates with the volatility of Solana").

    Schema:
    {
      overallDestiny: string,
      turningPoints: [{ age: int, year: int, description: string, type: string }],
      financialAdvice: string,
      luckyAssets: {
        stock: { symbol: string, name: string, reason: string },
        crypto: { symbol: string, name: string, reason: string }
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallDestiny: { type: Type.STRING },
            turningPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  age: { type: Type.INTEGER },
                  year: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['BULL', 'BEAR', 'VOLATILE'] }
                }
              }
            },
            financialAdvice: { type: Type.STRING },
            luckyAssets: {
              type: Type.OBJECT,
              properties: {
                stock: {
                  type: Type.OBJECT,
                  properties: {
                    symbol: { type: Type.STRING },
                    name: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                },
                crypto: {
                  type: Type.OBJECT,
                  properties: {
                    symbol: { type: Type.STRING },
                    name: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    const fallbackText = lang === 'zh-CN' 
      ? "天机混沌，暂无法批断。请稍后重试。" 
      : "天機混沌，暫無法批斷。請稍後重試。";
      
    return {
      overallDestiny: fallbackText,
      turningPoints: [
        { age: 30, year: parseInt(input.birthDate.split('-')[0]) + 30, description: "...", type: "VOLATILE" }
      ],
      financialAdvice: "...",
      luckyAssets: {
        stock: { symbol: "600519", name: "Kweichow Moutai", reason: "Stable as a mountain." },
        crypto: { symbol: "BTC", name: "Bitcoin", reason: "Digital gold for a golden destiny." }
      }
    };
  }
};
