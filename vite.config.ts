import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load .env files from the project root (where vite.config.ts is)
    const env = loadEnv(mode, '.', ''); 
    return {
      root: 'frontend', // Set the root to the 'frontend' directory
      base: '/',       // Serve from the root for local production
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
          // The previous '@': path.resolve(__dirname, '.') pointed to project root,
          // which might be confusing if frontend code expects it to be frontend root.
          // For vanilla JS with relative paths, complex aliases are often not necessary.
        }
      }
    };
});
