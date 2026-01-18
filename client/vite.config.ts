import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5174,
        proxy: {
            '/api': 'http://127.0.0.1:8080',
            '/avatars': 'http://127.0.0.1:8080',
            '/ws': {
                target: 'http://127.0.0.1:8080',
                ws: true,
                changeOrigin: true
            }
        }
    },
})
