# Cloudflare Workers 后端代理

这个 Worker 作为后端代理，安全地调用 Google Gemini API，避免在前端暴露 API Key。

## 🚀 快速部署

### 1. 安装依赖

```bash
cd worker
npm install
```

### 2. 配置 API Key

#### 方式一：使用 Wrangler Secret（推荐）

```bash
# 登录 Cloudflare（首次使用）
npx wrangler login

# 设置 API Key
npx wrangler secret put GEMINI_API_KEY
# 输入你的 Gemini API Key
```

#### 方式二：本地开发使用 .dev.vars

```bash
# 复制示例文件
cp .dev.vars.example .dev.vars

# 编辑 .dev.vars，填入你的 API Key
# GEMINI_API_KEY=your_api_key_here
```

### 3. 部署

```bash
# 一键部署
npm run deploy

# 或使用 wrangler 直接部署
npx wrangler deploy
```

### 4. 获取 Workers URL

部署成功后，Wrangler 会显示 Workers URL，格式类似：
```
https://qiankun-gemini-proxy.your-username.workers.dev
```

**重要**：复制这个 URL，需要在 GitHub Secrets 中配置 `VITE_API_BASE_URL`。

## 📝 配置前端

部署 Workers 后，需要在前端配置代理地址：

### GitHub Pages 部署

1. 进入 GitHub 仓库 Settings → Secrets and variables → Actions
2. 添加 Secret：
   - Name: `VITE_API_BASE_URL`
   - Value: 你的 Workers URL（如 `https://qiankun-gemini-proxy.your-username.workers.dev`）

### 本地开发

创建 `.env.local` 文件：

```bash
VITE_API_BASE_URL=https://qiankun-gemini-proxy.your-username.workers.dev
```

## 🔧 开发

```bash
# 本地开发（需要 .dev.vars 文件）
npm run dev

# 或使用 wrangler
npx wrangler dev
```

## 📋 环境变量

- `GEMINI_API_KEY`: Google Gemini API Key（必需）

## 🔒 安全性

- ✅ API Key 完全不会暴露给客户端
- ✅ 所有 API 调用都通过 Workers 代理
- ✅ 支持 CORS，允许前端跨域请求
- ✅ 错误处理和日志记录

## 📖 API 接口

### POST /

**请求体**：
```json
{
  "input": {
    "name": "张三",
    "gender": "MALE",
    "birthDate": "1995-01-01",
    "birthTime": "12:00",
    "birthPlace": "北京"
  },
  "chartData": [
    {
      "age": 0,
      "year": 1995,
      "ganZhi": "甲戌",
      "close": 100,
      "open": 100,
      "isTurningPoint": false
    }
  ],
  "lang": "zh-CN"
}
```

**响应**：
```json
{
  "overallDestiny": "...",
  "turningPoints": [...],
  "financialAdvice": "...",
  "luckyAssets": {
    "stock": {...},
    "crypto": {...}
  }
}
```

## 🐛 故障排除

### 部署失败

1. 确保已登录：`npx wrangler login`
2. 检查 API Key 是否正确设置：`npx wrangler secret list`
3. 查看日志：`npx wrangler tail`

### CORS 错误

Workers 已配置 CORS，如果仍有问题，检查：
1. 前端请求的 URL 是否正确
2. 请求方法是否为 POST
3. Content-Type 是否为 application/json

### API 调用失败

1. 检查 Gemini API Key 是否有效
2. 查看 Workers 日志：`npx wrangler tail`
3. 检查 API 配额是否用完

