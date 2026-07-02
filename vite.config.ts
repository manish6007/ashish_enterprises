import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('@mui')) return 'mui';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('xlsx') || id.includes('jspdf') || id.includes('qrcode') || id.includes('dayjs')) return 'utils';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
})
