
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load .env files from the project root (where vite.config.ts is)
    const env = loadEnv(mode, '.', ''); 

    // Base path logic for deployment
    // From your package.json: "homepage": "https://TaherShaik75.github.io/taher-shaik-LMS/"
    const ghPagesRepoName = '/taher-shaik-LMS/'; 
    const base = mode === 'production' ? ghPagesRepoName : '/';

    return {
      root: 'frontend', // Set the root to the 'frontend' directory
      base: base,       // Dynamically set base path
      define: {
        // Make environment variables available to frontend code
        // Ensure GEMINI_API_KEY is present in your root .env file if needed by frontend
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        outDir: '../dist', // Output to a 'dist' folder in the project root
        emptyOutDir: true, // Ensure the dist directory is cleaned before build
        // manifest: true, // Optional: if you need a manifest for advanced server integration
      },
      resolve: {
        alias: {
          // Aliases can be defined here if needed, e.g.:
          // '@components': path.resolve(__dirname, 'frontend/components'),
        }
      }
    };
});
