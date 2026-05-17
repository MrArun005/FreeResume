import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    build: {
        rollupOptions: {
            output: {
                // PDF generation is server-side via Puppeteer, so we no
                // longer ship a `pdf` chunk on the client. Keep React in
                // its own vendor chunk and lucide icons in `ui` so they
                // hit cache across deploys.
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ui: ['lucide-react'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
