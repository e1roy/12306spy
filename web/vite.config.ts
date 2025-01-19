import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/query_any_seat': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});