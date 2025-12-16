# API Key 安全性说明

## ⚠️ 重要警告

**当前应用是纯前端应用，API Key 会在客户端代码中暴露！**

## 为什么 API Key 会暴露？

1. **前端应用的本质**：
   - 所有前端代码都会发送到用户的浏览器
   - 用户可以在浏览器开发者工具中查看所有代码
   - 包括环境变量和 API Key

2. **当前实现方式**：
   - API Key 通过 `vite.config.ts` 在构建时注入
   - 构建后的代码包含 API Key
   - 部署后，任何人都可以查看源代码找到 API Key

## 🔒 安全措施

### 1. 在 Google Cloud Console 中限制 API Key

**必须做的安全设置**：

1. **访问限制**：
   - 进入 [Google Cloud Console](https://console.cloud.google.com/)
   - 选择你的项目 → APIs & Services → Credentials
   - 点击你的 API Key
   - 在 "Application restrictions" 中选择 "HTTP referrers"
   - 添加你的网站域名（如：`https://yourdomain.com/*`）

2. **API 限制**：
   - 在 "API restrictions" 中选择 "Restrict key"
   - 只允许 "Generative Language API"
   - 不要选择 "Don't restrict key"

3. **配额限制**：
   - 在 "Quotas" 中设置每日/每月使用限制
   - 防止恶意使用导致费用过高

### 2. 监控 API 使用

- 定期检查 Google Cloud Console 中的 API 使用情况
- 如果发现异常使用，立即撤销 API Key
- 设置告警通知

### 3. 使用不同的 API Key

- 开发环境使用一个 API Key
- 生产环境使用另一个 API Key
- 如果生产环境的 Key 泄露，可以单独撤销

## 🛡️ 更安全的方案

### 方案 1：后端代理（最安全）

创建一个后端服务来代理所有 API 请求：

```
前端 → 后端 API → Google Gemini API
```

**优点**：
- API Key 完全不会暴露给客户端
- 可以在后端添加更多安全控制（限流、验证等）
- 可以缓存请求，节省 API 调用

**缺点**：
- 需要额外的服务器和维护成本
- 需要开发后端代码

### 方案 2：使用 Vercel/Netlify 的 Serverless Functions

使用这些平台的无服务器函数：

```javascript
// api/gemini.js (Vercel)
export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY; // 只在服务端可用
  // 调用 Gemini API
}
```

**优点**：
- API Key 不会暴露给客户端
- 免费额度通常足够
- 无需维护服务器

**缺点**：
- 需要重构代码
- 有冷启动延迟

### 方案 3：使用 Firebase Functions / Cloud Functions

类似方案 2，但使用 Google 自己的服务。

## 📋 当前部署方案的安全建议

### 如果使用 GitHub Pages / Vercel / Netlify

1. ✅ **必须**在 Google Cloud Console 中设置 API Key 限制
2. ✅ **必须**设置使用配额
3. ✅ **必须**定期监控使用情况
4. ✅ **建议**使用不同的 API Key 用于不同环境
5. ⚠️ **注意**：API Key 仍然会在客户端代码中暴露

### 如果使用后端代理

1. ✅ API Key 完全安全
2. ✅ 可以添加更多安全控制
3. ⚠️ 需要额外的服务器成本

## 🔍 如何检查 API Key 是否暴露？

1. 部署后，打开浏览器开发者工具（F12）
2. 查看 Sources 或 Network 标签
3. 搜索你的 API Key（或部分字符）
4. 如果找到了，说明已经暴露

## 💡 最佳实践

1. **永远不要**在代码仓库中提交 `.env` 文件
2. **永远不要**在代码中硬编码 API Key
3. **必须**在 `.gitignore` 中包含 `.env*`
4. **必须**在 Google Cloud Console 中设置限制
5. **建议**定期轮换 API Key
6. **建议**使用环境变量管理工具（如 Vercel/Netlify 的环境变量）

## 📞 如果 API Key 泄露了怎么办？

1. **立即**在 Google Cloud Console 中撤销泄露的 API Key
2. **创建**新的 API Key
3. **更新**所有使用该 Key 的环境
4. **检查**是否有异常使用，如有必要联系 Google 支持
5. **审查**代码，确保不再泄露

---

**总结**：对于纯前端应用，API Key 暴露是不可避免的。关键是通过 Google Cloud Console 的限制来保护它，或者使用后端代理来完全避免暴露。

