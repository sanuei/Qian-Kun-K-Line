/**
 * Cloudflare Workers 后端代理
 * 用于安全地调用 Google Gemini API，避免在前端暴露 API Key
 */

export interface Env {
  GEMINI_API_KEY: string;
  // Optional: persist admin data to GitHub via this Worker (server-side)
  GITHUB_TOKEN?: string; // fine-grained token with Contents:write for the repo
  GITHUB_REPO?: string; // e.g. "sanuei/Qian-Kun-K-Line"
  GITHUB_FILE_PATH?: string; // e.g. "data/admin_data.json"
  ADMIN_SYNC_TOKEN?: string; // shared secret to authorize sync calls from Admin UI
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
    const extractJsonString = (text: string): string | null => {
      if (!text) return null;
      // Strip common Markdown code fences
      let cleaned = text.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
      // If there are multiple fences, remove all occurrences
      cleaned = cleaned.replace(/```(?:json)?/gi, '').trim();

      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first === -1 || last === -1 || last <= first) return null;
      return cleaned.slice(first, last + 1);
    };

    const normalizePlainText = (text: string): string => {
      if (!text) return '';
      return text
        .replace(/```(?:json)?/gi, '')
        .replace(/```/g, '')
        .trim();
    };

    const normalizeToSchema = (raw: any, lang: 'zh-CN' | 'zh-TW', birthDate: string): GeminiResponse => {
      const fallbackText =
        lang === 'zh-CN'
          ? '天机混沌，暂无法批断。请稍后重试。'
          : '天機混沌，暫無法批斷。請稍後重試。';

      const birthYear = parseInt((birthDate || '2000-01-01').split('-')[0]) || 2000;

      const safeType = (t: any): 'BULL' | 'BEAR' | 'VOLATILE' => {
        if (t === 'BULL' || t === 'BEAR' || t === 'VOLATILE') return t;
        return 'VOLATILE';
      };

      const safeStr = (v: any, fb: string) => (typeof v === 'string' && v.trim() ? v.trim() : fb);
      const clampText = (s: string, max = 800) => (s.length > max ? s.slice(0, max).trimEnd() + '…' : s);

      let overall = safeStr(raw?.overallDestiny, fallbackText);
      // If model accidentally returned JSON string as text, strip it to a readable paragraph
      if (/^\s*\{/.test(overall) && overall.includes('"overallDestiny"')) {
        const js = extractJsonString(overall);
        if (js) {
          try {
            const parsedInner = JSON.parse(js);
            if (parsedInner?.overallDestiny) overall = String(parsedInner.overallDestiny);
          } catch {
            // ignore
          }
        }
      }
      overall = clampText(overall);

      const out: GeminiResponse = {
        overallDestiny: overall,
        turningPoints: [],
        financialAdvice: safeStr(raw?.financialAdvice, lang === 'zh-CN' ? '顺势而为，守正出奇。' : '順勢而為，守正出奇。'),
        luckyAssets: {
          stock: {
            symbol: safeStr(raw?.luckyAssets?.stock?.symbol, '600519'),
            name: safeStr(raw?.luckyAssets?.stock?.name, 'Kweichow Moutai'),
            reason: safeStr(raw?.luckyAssets?.stock?.reason, 'Stable as a mountain.'),
          },
          crypto: {
            symbol: safeStr(raw?.luckyAssets?.crypto?.symbol, 'BTC'),
            name: safeStr(raw?.luckyAssets?.crypto?.name, 'Bitcoin'),
            reason: safeStr(raw?.luckyAssets?.crypto?.reason, 'Digital gold for a golden destiny.'),
          },
        },
      };

      // turningPoints normalization:
      // - accept objects with age/year (description/type optional)
      // - dedupe by age
      // - keep first 3
      const tps: any[] = Array.isArray(raw?.turningPoints) ? raw.turningPoints : [];
      const seenAge = new Set<number>();
      for (const tp of tps) {
        const age = Number(tp?.age);
        if (!Number.isFinite(age)) continue;
        // Guard against garbage "year" like extremely long numbers/strings
        const yearNum = Number(tp?.year);
        const year = Number.isFinite(yearNum) && yearNum >= 1900 && yearNum <= 2100
          ? yearNum
          : birthYear + Math.round(age);
        if (seenAge.has(age)) continue;
        seenAge.add(age);
        out.turningPoints.push({
          age: Math.round(age),
          year: Math.round(year),
          description: safeStr(
            tp?.description,
            lang === 'zh-CN' ? '此岁为运势转折点，宜稳中求进。' : '此歲為運勢轉折點，宜穩中求進。'
          ),
          type: safeType(tp?.type),
        });
        if (out.turningPoints.length >= 3) break;
      }
      // If missing, synthesize 3 points
      if (out.turningPoints.length < 3) {
        const defaults = [10, 20, 35];
        for (const age of defaults) {
          if (out.turningPoints.length >= 3) break;
          if (seenAge.has(age)) continue;
          out.turningPoints.push({
            age,
            year: birthYear + age,
            description: lang === 'zh-CN' ? '此岁运势有变，宜积累筹码。' : '此歲運勢有變，宜積累籌碼。',
            type: 'VOLATILE',
          });
        }
      }
      return out;
    };

    const urlObj = new URL(request.url);
    const path = urlObj.pathname;

    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // --- Admin GitHub persistence endpoints ---
    // GET  /admin/data   -> load JSON from GitHub
    // POST /admin/data   -> write JSON to GitHub (requires X-Admin-Token)
    if (path === '/admin/data') {
      const ghRepo = env.GITHUB_REPO;
      const ghPath = env.GITHUB_FILE_PATH || 'data/admin_data.json';
      const ghToken = env.GITHUB_TOKEN;

      if (!ghRepo || !ghToken) {
        return new Response(
          JSON.stringify({ error: 'GitHub persistence not configured', need: ['GITHUB_REPO', 'GITHUB_TOKEN'] }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const apiBase = `https://api.github.com/repos/${ghRepo}/contents/${ghPath}`;
      const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${ghToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      };

      if (request.method === 'GET') {
        const r = await fetch(apiBase, { headers });
        if (!r.ok) {
          const t = await r.text();
          return new Response(JSON.stringify({ error: 'GitHub load failed', status: r.status, message: t }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        const json = await r.json() as any;
        const content = json?.content;
        if (!content) {
          return new Response(JSON.stringify({ error: 'GitHub file content missing' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        // content is base64 with newlines
        const b64 = String(content).replace(/\n/g, '');
        const decoded = atob(b64);
        return new Response(decoded, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      if (request.method === 'POST') {
        const adminToken = request.headers.get('X-Admin-Token') || '';
        if (!env.ADMIN_SYNC_TOKEN || adminToken !== env.ADMIN_SYNC_TOKEN) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        const bodyText = await request.text();

        // Fetch sha if file exists
        let sha: string | undefined;
        const existing = await fetch(apiBase, { headers });
        if (existing.ok) {
          const ex = await existing.json() as any;
          sha = ex?.sha;
        }

        const payload: any = {
          message: `Update admin data (${new Date().toISOString()})`,
          content: btoa(bodyText),
        };
        if (sha) payload.sha = sha;

        const wr = await fetch(apiBase, {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!wr.ok) {
          const t = await wr.text();
          return new Response(JSON.stringify({ error: 'GitHub write failed', status: wr.status, message: t }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Default analyze endpoint: only allow POST at '/'
    if (request.method !== 'POST' || path !== '/') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
    Role: You are a professional Chinese BaZi fortune-teller (命理师) AND a modern financial strategist.
    Style: concise, structured, persuasive, positive, no fear-mongering. Mix a little classical Chinese flavor with clear modern advice.

    Input:
    User: ${input.name} (${input.gender})
    Birth: ${input.birthDate} ${input.birthTime}
    Place: ${input.birthPlace}
    Trend Data:
    ${keyPoints}

    Output Language: ${langInstruction}

    Constraints:
    - MUST be helpful and positive. Down cycles = accumulation, reset, learning.
    - No medical/legal/guarantees. No extreme negativity.
    - Use specific and plausible assets; keep to 1 stock + 1 crypto.
    - DO NOT repeat fields, DO NOT output long numbers, DO NOT include any markdown.
    
    Task:
    Return ONLY valid JSON (no markdown, no code fences, no extra text). The JSON MUST strictly follow the schema below.
    turningPoints MUST be an array of EXACTLY 3 objects, each with: age, year, description, type.
    
    Content guidance (professional flow):
    - overallDestiny: 120-180 Chinese characters, include: 命格总论 + 财运节奏（早/中/晚）+ 一句话定性（如“蓝筹/成长/波动”）
    - turningPoints: 3 key ages that match the provided trend points; each description <= 28 Chinese chars, actionable.
    - financialAdvice: 1 sentence, concrete action (e.g. "30-35 定投技能与现金流，40 后加杠杆于确定性")
    - luckyAssets: pick 1 stock + 1 crypto, each reason <= 20 Chinese chars.
    
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
      // Gemini REST API does not reliably support responseSchema; keep request minimal and enforce via prompt + post-processing.
      const makeBody = () =>
        JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });

      for (const modelName of modelNames) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`;
        
        try {
          geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: makeBody(),
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
        const jsonStr = extractJsonString(responseText);
        if (!jsonStr) throw new Error('No JSON object found in model response');
        const parsed = JSON.parse(jsonStr);
        result = normalizeToSchema(parsed, lang, input.birthDate);
      } catch (e) {
        // 如果解析失败：尽量把原文塞进 overallDestiny，并补齐其余字段
        const rawText = normalizePlainText(responseText);
        result = normalizeToSchema({ overallDestiny: rawText }, lang, input.birthDate);
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

