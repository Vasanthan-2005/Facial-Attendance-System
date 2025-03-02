import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000, // Change this to your desired port
  },
  esbuild: {
    loader: {
      '.js': 'jsx',  // Tell esbuild to treat `.js` files as `.jsx`
    },
  },
  plugins: [tailwindcss(),react()],
})
