# Workers 故障排除指南

## 错误：Gemini API 404

如果遇到 `Gemini API error: 404`，可能的原因和解决方案：

### 1. 检查 API Key

确保 API Key 正确设置：

```bash
cd worker
npx wrangler secret list
```

如果看不到 `GEMINI_API_KEY`，需要设置：

```bash
npx wrangler secret put GEMINI_API_KEY
```

### 2. 检查 API Key 权限

在 [Google Cloud Console](https://console.cloud.google.com/) 中：

1. 进入 **APIs & Services** → **Credentials**
2. 找到你的 API Key
3. 确保 **API restrictions** 中启用了 **Generative Language API**
4. 或者暂时设置为 **Don't restrict key**（仅用于测试）

### 3. 检查模型名称

当前使用的模型是 `gemini-1.5-flash`。如果这个模型不可用，可以尝试：

- `gemini-1.5-pro`
- `gemini-pro`
- `gemini-1.5-flash-latest`

修改 `worker/index.ts` 中的模型名称：

```typescript
const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`;
```

### 4. 检查 API 版本

当前使用 `v1beta`。如果不行，可以尝试：

- `v1`（稳定版）
- `v1beta`（测试版，功能更多）

### 5. 查看 Workers 日志

```bash
cd worker
npx wrangler tail
```

这会显示实时的 Workers 日志，包括错误详情。

### 6. 测试 API Key

使用 curl 测试 API Key 是否有效：

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello"
      }]
    }]
  }'
```

如果返回 404，说明：
- API Key 无效
- 模型名称不正确
- API 未启用

### 7. 常见错误码

- **400**: 请求格式错误
- **401**: API Key 无效或未设置
- **403**: API Key 权限不足
- **404**: 模型不存在或 API 端点错误
- **429**: 请求过多，达到配额限制
- **500**: Google 服务器错误

### 8. 重新部署

修改代码后，记得重新部署：

```bash
cd worker
npm run deploy
```

## 调试技巧

1. **添加日志**：在 `worker/index.ts` 中添加 `console.log` 查看变量值
2. **查看日志**：使用 `npx wrangler tail` 查看实时日志
3. **测试本地**：使用 `npm run dev` 在本地测试

## 获取帮助

如果问题仍然存在：
1. 检查 [Google Gemini API 文档](https://ai.google.dev/docs)
2. 查看 Workers 日志获取详细错误信息
3. 确认 API Key 在 Google Cloud Console 中正确配置

