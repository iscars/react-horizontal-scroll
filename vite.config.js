import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
// eslint-disable-next-line
var path = require('path');
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/Slider.tsx'),
            name: 'Slider',
            fileName: function (format) { return "index.".concat(format, ".js"); },
            sourcemap: true,
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    ReactDom: 'ReactDom'
                }
            }
        }
    },
    plugins: [
        reactPlugin(),
    ]
});
