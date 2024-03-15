import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = {
    ...process.env,
    ...loadEnv(mode, `${process.cwd()}/env/`, ''),
    ...loadEnv('deploy', `${process.cwd()}/env/`, ''),
    ...loadEnv('git', `${process.cwd()}/env/`, ''),
  };
  return defineConfig({
    plugins: [vue()],
    envDir: 'env',
    base: process.env.VITE_BASE_URL,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        vue: 'vue/dist/vue.esm-bundler.js',
      },
    },
  });
};
