
// backend/server.js - PURE NODE.JS HANDLER FOR VERCEL DIAGNOSTICS
console.log('[PURE_NODE_INIT_LOG] Pure Node.js script initializing at:', new Date().toISOString());
console.log('[PURE_NODE_INIT_LOG] Script path (__filename):', __filename);
console.log('[PURE_NODE_INIT_LOG] Directory path (__dirname):', __dirname);
console.log('[PURE_NODE_INIT_LOG] NODE_ENV from env:', process.env.NODE_ENV);
console.log('[PURE_NODE_INIT_LOG] PORT from env:', process.env.PORT);
console.log('[PURE_NODE_INIT_LOG] VERCEL_URL from env:', process.env.VERCEL_URL);

const fs = require('fs');
const path = require('path');

try {
    console.log('[PURE_NODE_INIT_LOG] Attempting to list files in current directory (__dirname):');
    const filesInDirname = fs.readdirSync(__dirname);
    console.log('[PURE_NODE_INIT_LOG] Files in __dirname:', filesInDirname.join(', ') || 'No files found');
} catch (e) {
    console.error('[PURE_NODE_INIT_LOG] Error listing files in __dirname:', e.message);
}

try {
    console.log('[PURE_NODE_INIT_LOG] Attempting to list files in parent directory (../):');
    const parentDir = path.join(__dirname, '../');
    const filesInParentDir = fs.readdirSync(parentDir);
    console.log('[PURE_NODE_INIT_LOG] Files in parentDir (project root):', filesInParentDir.join(', ') || 'No files found');

    const distPath = path.join(__dirname, '../dist');
    console.log(`[PURE_NODE_INIT_LOG] Checking existence of dist folder at: ${distPath}`);
    const distExists = fs.existsSync(distPath);
    console.log('[PURE_NODE_INIT_LOG] Does ../dist exist?', distExists);

    if (distExists) {
        console.log('[PURE_NODE_INIT_LOG] Attempting to list files in ../dist:');
        const filesInDist = fs.readdirSync(distPath);
        console.log('[PURE_NODE_INIT_LOG] Files in ../dist:', filesInDist.join(', ') || 'No files found');
    } else {
        console.warn('[PURE_NODE_INIT_LOG] ../dist directory NOT FOUND.');
    }
} catch (e) {
    console.error('[PURE_NODE_INIT_LOG] Error listing files in parent or dist:', e.message);
}

console.log('[PURE_NODE_INIT_LOG] Initialization logs complete.');

module.exports = (req, res) => {
    const requestTimestamp = new Date().toISOString();
    console.log(`[PURE_NODE_HANDLER_LOG] Request received at: ${requestTimestamp} for URL: ${req.url}`);
    console.log(`[PURE_NODE_HANDLER_LOG] Request method: ${req.method}`);
    
    const body = [];
    req.on('data', chunk => {
        body.push(chunk);
    });
    req.on('end', () => {
        const requestBody = Buffer.concat(body).toString();
        if (requestBody) {
            console.log('[PURE_NODE_HANDLER_LOG] Request body:', requestBody);
        } else {
            console.log('[PURE_NODE_HANDLER_LOG] Request body: empty');
        }

        if (req.url === '/api/test-error') {
            console.error('[PURE_NODE_HANDLER_LOG] Simulating an error for /api/test-error');
            res.status(500).send('Simulated Server Error at ' + requestTimestamp);
            return;
        }
        
        // Check if the request is for a static file likely from the frontend
        if (req.url.startsWith('/assets/') || req.url === '/index.html' || req.url === '/favicon.ico' || req.url === '/') {
            const distPath = path.join(__dirname, '../dist');
            const filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);
            
            console.log(`[PURE_NODE_HANDLER_LOG] Attempting to serve static file: ${filePath}`);
            if (fs.existsSync(filePath)) {
                const fileExtension = path.extname(filePath).toLowerCase();
                let contentType = 'text/plain';
                if (fileExtension === '.html') contentType = 'text/html';
                else if (fileExtension === '.css') contentType = 'text/css';
                else if (fileExtension === '.js') contentType = 'application/javascript';
                else if (fileExtension === '.svg') contentType = 'image/svg+xml';
                
                console.log(`[PURE_NODE_HANDLER_LOG] Serving ${filePath} with Content-Type: ${contentType}`);
                res.setHeader('Content-Type', contentType);
                fs.createReadStream(filePath).pipe(res);
                return; // Important: end response after piping file
            } else {
                console.warn(`[PURE_NODE_HANDLER_LOG] Static file NOT FOUND: ${filePath}`);
                res.status(404).send(`Static file not found: ${req.url} (Resolved to: ${filePath}) at ${requestTimestamp}`);
                return;
            }
        }

        // Default response for other API-like paths
        res.status(200).json({ 
            message: 'Pure Node Handler Test OK!', 
            timestamp: requestTimestamp,
            url: req.url,
            method: req.method,
            envInfo: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                VERCEL_URL: process.env.VERCEL_URL
            }
        });
    });
};

// Optional: Catch unhandled errors to ensure they are logged on Vercel
process.on('unhandledRejection', (reason, promise) => {
  console.error('[PURE_NODE_PROCESS_LOG] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[PURE_NODE_PROCESS_LOG] Uncaught Exception:', error);
  // Vercel might terminate, but log it.
});
