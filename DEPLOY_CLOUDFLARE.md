# Cloudflare Workers + GitHub Pages 部署指南

本指南将帮助你使用 Cloudflare Workers 作为后端代理，并将前端部署到 GitHub Pages。

## 🎯 架构说明

```
前端 (GitHub Pages) → Cloudflare Workers (后端代理) → Google Gemini API
```

**优势**：
- ✅ API Key 完全安全，不会暴露给客户端
- ✅ 免费额度充足（Workers 免费 10 万次请求/天）
- ✅ 全球 CDN，速度快
- ✅ 一键部署，简单方便

## 📋 部署步骤

### 第一步：部署 Cloudflare Workers 后端

1. **进入 worker 目录**：
```bash
cd worker
```

2. **安装依赖**：
```bash
npm install
```

3. **登录 Cloudflare**（首次使用）：
```bash
npx wrangler login
```
会打开浏览器，登录你的 Cloudflare 账号。

4. **设置 API Key**：
```bash
npx wrangler secret put GEMINI_API_KEY
```
输入你的 Google Gemini API Key。

5. **部署 Workers**：
```bash
npm run deploy
```

6. **获取 Workers URL**：
部署成功后，会显示类似这样的 URL：
```
https://qiankun-gemini-proxy.your-username.workers.dev
```
**复制这个 URL**，下一步会用到。

### 第二步：配置 GitHub Secrets

1. **进入 GitHub 仓库**：
   - Settings → Secrets and variables → Actions

2. **添加 Secret**：
   - Name: `VITE_API_BASE_URL`
   - Value: 你的 Workers URL（从第一步获取）

### 第三步：配置 GitHub Pages

1. **进入仓库 Settings → Pages**

2. **Source**：选择 "GitHub Actions"

3. **保存**

### 第四步：修改 vite.config.ts（如果需要）

如果你的仓库名不是 `Qian-Kun-K-Line`，需要修改 `vite.config.ts`：

```typescript
export default defineConfig(({ mode }) => {
    return {
      base: '/your-repo-name/', // ⚠️ 替换为你的仓库名
      // ... 其他配置
    };
});
```

### 第五步：推送代码并部署

```bash
git add .
git commit -m "Setup Cloudflare Workers + GitHub Pages deployment"
git push
```

GitHub Actions 会自动：
1. 构建前端代码
2. 使用配置的 Workers URL
3. 部署到 GitHub Pages

### 第六步：验证部署

1. 等待 GitHub Actions 完成（在仓库的 Actions 标签页查看）
2. 访问你的 GitHub Pages URL：`https://your-username.github.io/your-repo-name/`
3. 测试功能是否正常

## 🔧 本地开发

### 启动后端代理（Workers）

```bash
cd worker
npm run dev
```

Workers 会在 `http://localhost:8787` 运行。

### 启动前端

创建 `.env.local` 文件：

```bash
VITE_API_BASE_URL=http://localhost:8787
```

然后启动前端：

```bash
npm run dev
```

## 📝 环境变量说明

### Workers 环境变量

- `GEMINI_API_KEY`: Google Gemini API Key（通过 `wrangler secret put` 设置）

### 前端环境变量

- `VITE_API_BASE_URL`: Workers 代理地址
  - 生产环境：在 GitHub Secrets 中配置
  - 本地开发：在 `.env.local` 中配置

## 🔒 安全性

✅ **API Key 完全安全**：
- API Key 只存储在 Cloudflare Workers 的 Secrets 中
- 永远不会暴露给客户端
- 前端代码中不包含任何 API Key

✅ **CORS 保护**：
- Workers 已配置 CORS
- 只允许来自你域名的请求

## 🐛 故障排除

### Workers 部署失败

1. **检查登录状态**：
```bash
npx wrangler whoami
```

2. **检查 API Key**：
```bash
npx wrangler secret list
```

3. **查看日志**：
```bash
npx wrangler tail
```

### 前端无法连接 Workers

1. **检查 Workers URL**：
   - 确认 GitHub Secrets 中的 `VITE_API_BASE_URL` 正确
   - 确认 Workers 已成功部署

2. **检查 CORS**：
   - 打开浏览器开发者工具
   - 查看 Network 标签页的错误信息

3. **测试 Workers**：
```bash
curl -X POST https://your-workers-url.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"input":{"name":"test","gender":"MALE","birthDate":"1995-01-01","birthTime":"12:00","birthPlace":"北京"},"chartData":[],"lang":"zh-CN"}'
```

### GitHub Pages 部署失败

1. **检查 Actions 日志**：
   - 进入仓库的 Actions 标签页
   - 查看失败的 workflow 日志

2. **检查 Secrets**：
   - 确认 `VITE_API_BASE_URL` 已正确配置

3. **检查 base 配置**：
   - 确认 `vite.config.ts` 中的 `base` 与仓库名匹配

## 📊 监控和维护

### 查看 Workers 使用情况

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages
3. 选择你的 Worker
4. 查看 Metrics 和 Logs

### 更新 Workers

```bash
cd worker
# 修改代码后
npm run deploy
```

### 更新 API Key

```bash
cd worker
npx wrangler secret put GEMINI_API_KEY
# 输入新的 API Key
```

## 💡 最佳实践

1. **使用不同的 Workers**：
   - 开发环境：`qiankun-gemini-proxy-dev`
   - 生产环境：`qiankun-gemini-proxy`

2. **设置使用限制**：
   - 在 Google Cloud Console 中设置 API 配额
   - 在 Cloudflare 中设置 Workers 使用限制

3. **监控和告警**：
   - 设置 Cloudflare 告警
   - 定期检查使用情况

## 🎉 完成！

现在你的应用已经：
- ✅ 后端代理部署在 Cloudflare Workers
- ✅ 前端部署在 GitHub Pages
- ✅ API Key 完全安全
- ✅ 支持自动部署

享受你的安全、快速、免费的应用吧！

