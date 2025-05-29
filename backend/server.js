
// backend/server.js - SIMPLIFIED FOR VERCEL DIAGNOSTICS
console.log('[MINIMAL_SERVER_LOG] server.js script started. NODE_ENV:', process.env.NODE_ENV);
console.log('[MINIMAL_SERVER_LOG] Checking PORT from env:', process.env.PORT);

const express = require('express');
const path = require('path'); // Keep for static serving, though API is simpler now

const app = express();
const PORT = process.env.PORT || 3001;

console.log('[MINIMAL_SERVER_LOG] Express app initialized.');

// Serve static files from the frontend build directory (still needed)
// The path is relative from 'backend/server.js' to the 'dist' folder in the project root
const staticPath = path.join(__dirname, '../dist');
console.log(`[MINIMAL_SERVER_LOG] Attempting to serve static files from: ${staticPath}`);
app.use(express.static(staticPath));

app.get('/api/health', (req, res) => {
    console.log('[MINIMAL_SERVER_LOG] /api/health endpoint hit.');
    res.status(200).json({ status: 'ok', message: 'Minimal server is running!' });
});

// Catch-all for API routes not matched (simple version)
app.all('/api/*', (req, res) => {
  console.log(`[MINIMAL_SERVER_LOG] Unmatched API route: ${req.method} ${req.path}`);
  res.status(404).json({ message: `Minimal API server: Endpoint ${req.method} ${req.path} not found.` });
});

// The "catchall" handler for frontend SPA routing
app.get('*', (req, res) => {
  console.log(`[MINIMAL_SERVER_LOG] Catchall route hit for: ${req.path}, serving index.html`);
  const indexPath = path.join(__dirname, '../dist/index.html');
  res.sendFile(indexPath, (err) => {
      if (err) {
          console.error('[MINIMAL_SERVER_LOG] Error sending index.html:', err);
          // Don't send 500 if it's just a client closing connection, etc.
          // but log it for Vercel.
          if (!res.headersSent) {
            res.status(500).send('Error serving frontend application.');
          }
      }
  });
});

app.listen(PORT, () => {
    console.log(`[MINIMAL_SERVER_LOG] Minimal backend server listening on port ${PORT}`);
    console.log('[MINIMAL_SERVER_LOG] If you see this, basic Vercel function execution and logging are working.');
    console.log('[MINIMAL_SERVER_LOG] Next, check if environment variables (like MONGODB_URI) are correctly set in Vercel project settings.');
});

// Optional: Catch unhandled errors to ensure they are logged on Vercel
process.on('unhandledRejection', (reason, promise) => {
  console.error('[MINIMAL_SERVER_LOG] Unhandled Rejection at:', promise, 'reason:', reason);
  // Vercel should handle process termination, but logging is key
});

process.on('uncaughtException', (error) => {
  console.error('[MINIMAL_SERVER_LOG] Uncaught Exception:', error);
  // Vercel should handle process termination
});
