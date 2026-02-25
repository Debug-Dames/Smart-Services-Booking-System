import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',          // Ensure root is the folder containing index.html
  build: {
    outDir: 'dist',
  },
})