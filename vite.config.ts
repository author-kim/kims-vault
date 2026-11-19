import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { bookCatalogPlugin } from './scripts/book-catalog.ts'

// https://vite.dev/config/
export default defineConfig({
  base: '/kims-vault/',
  build: {
    outDir: 'docs',
  },
  plugins: [react(), tailwindcss(), bookCatalogPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
