# 乾坤K线 - 快速部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js >= 18.x
- npm 或 yarn 或 pnpm

### 2. 配置环境变量
创建 `.env` 文件（如果还没有）：
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 准备支付二维码图片
将微信支付二维码图片保存为 `payment_qr.png`，放置在 `public/` 目录下。

## 🚀 快速部署方案

### 方案一：Vercel（推荐，最快最简单）

1. **安装 Vercel CLI**（如果还没有）：
```bash
npm i -g vercel
```

2. **登录 Vercel**：
```bash
vercel login
```

3. **部署**：
```bash
vercel
```
按照提示操作，Vercel 会自动检测项目配置。

4. **配置环境变量**：
   - 在 Vercel 项目设置中添加 `GEMINI_API_KEY`
   - 重新部署

5. **自定义域名**（可选）：
   - 在 Vercel 项目设置中添加自定义域名

**优点**：
- ✅ 免费额度充足
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（连接 GitHub）
- ✅ 零配置

---

### 方案二：Netlify

1. **安装 Netlify CLI**：
```bash
npm i -g netlify-cli
```

2. **登录**：
```bash
netlify login
```

3. **初始化并部署**：
```bash
npm run build
netlify deploy --prod
```

4. **配置环境变量**：
   - 在 Netlify 控制台添加 `GEMINI_API_KEY`

**优点**：
- ✅ 免费额度
- ✅ 自动 HTTPS
- ✅ 简单易用

---

### 方案三：GitHub Pages（静态部署）

#### ⚠️ 重要：API Key 安全性说明

**GitHub Pages 是静态网站托管，所有代码都会暴露给客户端。**

**当前实现的问题**：
- API Key 在构建时通过 `vite.config.ts` 注入到客户端代码中
- 部署后，任何人都可以在浏览器开发者工具中查看源代码，找到 API Key
- **这意味着 API Key 会完全暴露！**

#### 解决方案

**方案 A：使用 GitHub Actions + 环境变量（推荐）**

1. **在 GitHub 仓库设置中添加 Secrets**：
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加 `GEMINI_API_KEY` secret

2. **创建 GitHub Actions 工作流**（`.github/workflows/deploy.yml`）：
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. **修改 `vite.config.ts`**，添加 `base` 配置：
```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/your-repo-name/', // ⚠️ 重要：替换为你的 GitHub 仓库名
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

**⚠️ 重要**：`base` 必须设置为你的 GitHub 仓库名。例如，如果仓库名是 `Qian-Kun-K-Line`，则设置为 `/Qian-Kun-K-Line/`。

4. **启用 GitHub Pages**：
   - 仓库 Settings → Pages
   - Source: GitHub Actions

**优点**：API Key 不会暴露在代码仓库中，只在构建时使用

**缺点**：仍然会在客户端代码中暴露（这是前端应用的固有问题）

---

**方案 B：使用后端代理（最安全）**

创建一个后端服务来代理 API 请求，API Key 只存储在后端：

1. 创建简单的 Node.js 后端（如使用 Express）
2. 后端存储 API Key，前端只调用后端接口
3. 前端代码中不包含 API Key

**这是最安全的方案，但需要额外的后端服务。**

---

**方案 C：使用 Vercel/Netlify（推荐替代方案）**

这些平台支持服务端环境变量，虽然前端代码仍然会暴露 API Key，但：
- 环境变量管理更方便
- 可以设置环境变量访问限制
- 部署更简单

---

#### 如果必须使用 GitHub Pages

如果坚持使用 GitHub Pages，请：

1. **限制 API Key 权限**：
   - 在 Google Cloud Console 中设置 API Key 限制
   - 限制只能从特定域名访问
   - 设置使用配额限制

2. **监控 API 使用**：
   - 定期检查 API 使用情况
   - 如果发现异常，立即撤销并更换 API Key

3. **使用环境变量（虽然仍会暴露）**：
   - 至少不要硬编码在代码中
   - 使用 GitHub Secrets 管理

#### 快速部署步骤（方案 A）

1. **修改 `vite.config.ts`**，添加 `base` 配置（见上方）

2. **在 GitHub 仓库中添加 Secret**：
   - 进入仓库 Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `GEMINI_API_KEY`
   - Value: 你的 Gemini API Key
   - 点击 "Add secret"

3. **启用 GitHub Pages**：
   - 进入仓库 Settings → Pages
   - Source: 选择 "GitHub Actions"
   - 保存

4. **推送代码**（工作流文件已创建在 `.github/workflows/deploy.yml`）：
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push
```

5. **等待部署完成**：
   - 进入仓库的 Actions 标签页
   - 查看部署进度
   - 部署成功后，访问 `https://your-username.github.io/your-repo-name/`

**⚠️ 再次提醒**：
- 即使使用 GitHub Actions，API Key 仍然会在构建后的客户端代码中暴露
- 这是所有前端应用的固有问题
- **必须**在 Google Cloud Console 中设置 API Key 限制（见 `API_KEY_SECURITY.md`）
- 最安全的方案是使用后端代理

---

### 方案四：Cloudflare Pages

1. **连接 GitHub 仓库**到 Cloudflare Pages

2. **构建配置**：
   - Build command: `npm run build`
   - Build output directory: `dist`

3. **环境变量**：
   - 在 Cloudflare Pages 设置中添加 `GEMINI_API_KEY`

**优点**：
- ✅ 免费且快速
- ✅ 全球 CDN
- ✅ 自动部署

---

### 方案五：自建服务器（VPS）

#### 使用 Nginx + PM2

1. **构建项目**：
```bash
npm install
npm run build
```

2. **安装 PM2**：
```bash
npm i -g pm2
```

3. **使用 PM2 运行预览服务器**（或使用 Nginx 静态文件服务）：
```bash
pm2 serve dist 3000 --spa
```

4. **配置 Nginx**（推荐）：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/your/project/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

5. **配置 SSL**（使用 Let's Encrypt）：
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📝 部署检查清单

- [ ] 环境变量 `GEMINI_API_KEY` 已配置
- [ ] 支付二维码图片 `payment_qr.png` 已放置在 `public/` 目录
- [ ] 已运行 `npm run build` 测试构建
- [ ] 已测试生产环境预览 `npm run preview`
- [ ] 域名已配置（如需要）
- [ ] HTTPS 已启用
- [ ] 已测试所有功能（表单提交、激活码等）

---

## 🔧 常见问题

### 1. 构建失败
- 检查 Node.js 版本是否 >= 18
- 清除缓存：`rm -rf node_modules package-lock.json && npm install`

### 2. 环境变量未生效
- 确保在部署平台正确配置环境变量
- 重新部署项目

### 3. 图片不显示
- 确保 `payment_qr.png` 在 `public/` 目录
- 检查图片路径是否正确（应为 `/payment_qr.png`）

### 4. 路由问题（SPA）
- 确保服务器配置了 SPA 回退到 `index.html`
- Vercel/Netlify 通常自动处理

---

## 🎯 推荐部署流程（最快）

1. **准备代码**：
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. **使用 Vercel**（最快）：
   - 访问 https://vercel.com
   - 点击 "Import Project"
   - 连接 GitHub 仓库
   - 添加环境变量 `GEMINI_API_KEY`
   - 点击 "Deploy"
   - 完成！🎉

**预计时间：5-10 分钟**

---

## 📞 需要帮助？

如有问题，请联系：@sonic_yann

