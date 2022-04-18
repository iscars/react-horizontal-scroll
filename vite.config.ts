import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react';
// eslint-disable-next-line
const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
   build: {
    lib: {
      entry: path.resolve(__dirname, 'src/Slider.tsx'),
      name: 'Slider',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          ReactDom: 'ReactDom',
        },
      },
    },
  },
  plugins: [
    reactPlugin(),
  ],
})
