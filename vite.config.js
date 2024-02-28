import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

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
  });
};
