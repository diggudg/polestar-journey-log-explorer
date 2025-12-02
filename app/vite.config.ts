import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    base: '/polestar-journey-log-explorer/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
});
