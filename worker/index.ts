/**
 * Cloudflare Workers 后端代理
 * 用于安全地调用 Google Gemini API，避免在前端暴露 API Key
 */

export interface Env {
  GEMINI_API_KEY: string;
}

interface GeminiRequest {
  input: {
    name: string;
    gender: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  };
  chartData: Array<{
    age: number;
    year: number;
    ganZhi: string;
    close: number;
    open: number;
    isTurningPoint: boolean;
  }>;
  lang: 'zh-CN' | 'zh-TW';
}

interface GeminiResponse {
  overallDestiny: string;
  turningPoints: Array<{
    age: number;
    year: number;
    description: string;
    type: 'BULL' | 'BEAR' | 'VOLATILE';
  }>;
  financialAdvice: string;
  luckyAssets: {
    stock: { symbol: string; name: string; reason: string };
    crypto: { symbol: string; name: string; reason: string };
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      // 检查 API Key
      if (!env.GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // 解析请求体
      const body: GeminiRequest = await request.json();
      const { input, chartData, lang } = body;

      // 构建提示词
      const keyPoints = chartData
        .filter((d, i) => i % 10 === 0 || d.isTurningPoint)
        .map(
          (d) =>
            `Age ${d.age} (${d.year} ${d.ganZhi}): Score ${Math.round(d.close)} (${
              d.close > d.open ? 'Up' : 'Down'
            })`
        )
        .join('\n');

      const langInstruction =
        lang === 'zh-CN' ? 'Simplified Chinese (zh-CN)' : 'Traditional Chinese (zh-TW)';

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

      // 调用 Gemini API
      // 使用 Gemini 2 Flash 模型（从 AI Studio 创建的 API Key）
      // 尝试多个可能的模型名称，按优先级排序
      const modelNames = [
        'gemini-2.0-flash-exp',  // Gemini 2 Flash 实验版
        'gemini-2.0-flash',      // Gemini 2 Flash 稳定版
        'gemini-2.5-flash',      // Gemini 2.5 Flash
        'gemini-1.5-flash',      // 回退到 1.5 Flash
      ];
      
      let geminiResponse: Response | null = null;
      let lastError: string = '';
      
      // 尝试每个模型名称
      for (const modelName of modelNames) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`;
        
        try {
          geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: 'object',
                  properties: {
                    overallDestiny: { type: 'string' },
                    turningPoints: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          age: { type: 'integer' },
                          year: { type: 'integer' },
                          description: { type: 'string' },
                          type: {
                            type: 'string',
                            enum: ['BULL', 'BEAR', 'VOLATILE'],
                          },
                        },
                      },
                    },
                    financialAdvice: { type: 'string' },
                    luckyAssets: {
                      type: 'object',
                      properties: {
                        stock: {
                          type: 'object',
                          properties: {
                            symbol: { type: 'string' },
                            name: { type: 'string' },
                            reason: { type: 'string' },
                          },
                        },
                        crypto: {
                          type: 'object',
                          properties: {
                            symbol: { type: 'string' },
                            name: { type: 'string' },
                            reason: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            }),
          });
          
          // 如果成功，跳出循环
          if (geminiResponse.ok) {
            console.log(`Successfully used model: ${modelName}`);
            break;
          } else {
            const errorText = await geminiResponse.text();
            lastError = `Model ${modelName}: ${geminiResponse.status} - ${errorText}`;
            console.warn(`Model ${modelName} failed:`, lastError);
            geminiResponse = null;
          }
        } catch (error) {
          lastError = `Model ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.warn(`Model ${modelName} error:`, lastError);
          geminiResponse = null;
        }
      }
      
      // 如果所有模型都失败
      if (!geminiResponse || !geminiResponse.ok) {
        console.error('All models failed. Last error:', lastError);
        return new Response(
          JSON.stringify({
            error: 'Gemini API error',
            status: geminiResponse?.status || 500,
            message: lastError || 'All model attempts failed',
            triedModels: modelNames,
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      const geminiData = await geminiResponse.json();
      const responseText =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      let result: GeminiResponse;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // 如果解析失败，返回默认值
        result = {
          overallDestiny:
            lang === 'zh-CN'
              ? '天机混沌，暂无法批断。请稍后重试。'
              : '天機混沌，暫無法批斷。請稍後重試。',
          turningPoints: [
            {
              age: 30,
              year: parseInt(input.birthDate.split('-')[0]) + 30,
              description: '...',
              type: 'VOLATILE' as const,
            },
          ],
          financialAdvice: '...',
          luckyAssets: {
            stock: {
              symbol: '600519',
              name: 'Kweichow Moutai',
              reason: 'Stable as a mountain.',
            },
            crypto: {
              symbol: 'BTC',
              name: 'Bitcoin',
              reason: 'Digital gold for a golden destiny.',
            },
          },
        };
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

