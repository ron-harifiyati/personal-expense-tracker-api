import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When deploying to GitHub Pages under a project path (user.github.io/<repo>/),
// set BASE_PATH="/<repo>/". Locally and on root-hosted deploys it stays "/".
const base = process.env.BASE_PATH || '/';

// https://vite.dev/config/
export default defineConfig({
    base,
    plugins: [react()],
    server: {
        port: 5173,
    },
});
