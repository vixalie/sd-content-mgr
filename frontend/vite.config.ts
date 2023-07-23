import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function _resolve(dir: string) {
  return path.resolve(__dirname, dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': _resolve('src'),
      '@wails': _resolve('wailsjs')
    }
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ]
});
