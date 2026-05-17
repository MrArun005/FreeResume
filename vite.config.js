import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['tslib', '@react-pdf/renderer', 'react', 'react-dom'],
    },
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    pdf: ['jspdf', 'html2canvas', '@react-pdf/renderer'],
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
