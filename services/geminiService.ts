import { UserInput, CandleData, AnalysisResult, Language } from '../types';

// Cloudflare Workers 后端代理地址
// 开发环境可以使用本地代理，生产环境使用部署后的 Workers URL
// 如果未配置，会使用默认值（需要替换为实际的 Workers URL）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://qiankun-gemini-proxy.your-username.workers.dev';

export const analyzeDestiny = async (
  input: UserInput,
  chartData: CandleData[],
  lang: Language
): Promise<AnalysisResult> => {
  try {
    // 准备请求数据
    const requestData = {
      input: {
        name: input.name,
        gender: input.gender,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        birthPlace: input.birthPlace,
      },
      chartData: chartData.map((d) => ({
        age: d.age,
        year: d.year,
        ganZhi: d.ganZhi,
        close: d.close,
        open: d.open,
        isTurningPoint: d.isTurningPoint,
      })),
      lang,
    };

    // 调用后端代理
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const result = (await response.json()) as AnalysisResult;
    return result;
  } catch (error) {
    console.error('Gemini Analysis Failed:', error);
    const fallbackText =
      lang === 'zh-CN'
        ? '天机混沌，暂无法批断。请稍后重试。'
        : '天機混沌，暫無法批斷。請稍後重試。';

    return {
      overallDestiny: fallbackText,
      turningPoints: [
        {
          age: 30,
          year: parseInt(input.birthDate.split('-')[0]) + 30,
          description: '...',
          type: 'VOLATILE',
        },
      ],
      financialAdvice: '...',
      luckyAssets: {
        stock: { symbol: '600519', name: 'Kweichow Moutai', reason: 'Stable as a mountain.' },
        crypto: { symbol: 'BTC', name: 'Bitcoin', reason: 'Digital gold for a golden destiny.' },
      },
    };
  }
};
