# 🚀 快速开始 - Cloudflare Workers + GitHub Pages

## 一键部署步骤

### 1️⃣ 部署后端代理（Cloudflare Workers）

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

**复制部署后的 Workers URL**（类似：`https://qiankun-gemini-proxy.xxx.workers.dev`）

### 2️⃣ 配置 GitHub

1. **添加 Secret**：
   - GitHub 仓库 → Settings → Secrets and variables → Actions
   - 添加 `VITE_API_BASE_URL`，值为你的 Workers URL

2. **启用 Pages**：
   - GitHub 仓库 → Settings → Pages
   - Source: GitHub Actions

### 3️⃣ 推送代码

```bash
git add .
git commit -m "Setup deployment"
git push
```

GitHub Actions 会自动部署前端到 GitHub Pages！

## 📝 详细文档

- **后端部署**：查看 `worker/README.md`
- **完整指南**：查看 `DEPLOY_CLOUDFLARE.md`
- **API 安全性**：查看 `API_KEY_SECURITY.md`

## ✅ 验证

部署完成后，访问你的 GitHub Pages URL，测试功能是否正常。

**现在 API Key 完全安全，不会暴露给客户端！** 🎉

