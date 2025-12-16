import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // GitHub Pages 需要设置 base 路径
      // 如果你的仓库名是 Qian-Kun-K-Line，则 base 应该是 '/Qian-Kun-K-Line/'
      // 如果是其他名称，请修改为 '/your-repo-name/'
      base: process.env.GITHUB_REPOSITORY 
        ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
        : '/Qian-Kun-K-Line/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // 不再需要注入 API Key，因为现在使用后端代理
      // VITE_API_BASE_URL 环境变量会自动通过 import.meta.env.VITE_API_BASE_URL 访问
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
