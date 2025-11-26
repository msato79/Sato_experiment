import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Three.jsなどの大きなライブラリを含むため、チャンクサイズの警告閾値を上げる
    chunkSizeWarningLimit: 1000, // 1000KB (1MB) まで警告を出さない
    rollupOptions: {
      output: {
        // ライブラリを別チャンクに分割してキャッシュ効率を向上
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three'],
        },
      },
    },
  },
});

