const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

// Setup PostgreSQL pool if connection string exists
let pool = null;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Initialize DB tables
    initDb();
} else {
    console.log('No DATABASE_URL found. Running in offline/static mode.');
}

async function initDb() {
    try {
        const client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS user_data (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                data JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Postgres tables initialized successfully.');
        client.release();
    } catch (err) {
        console.error('Failed to initialize database tables:', err);
    }
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
    // Handle CORS preflight options
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // API Routing
    if (pathname.startsWith('/api/')) {
        if (!pool) {
            return sendJson(res, 503, { success: false, error: 'Database service unavailable' });
        }

        try {
            if (pathname === '/api/auth/signup' && req.method === 'POST') {
                const { email, password } = await parseJsonBody(req);
                if (!email || !password) {
                    return sendJson(res, 400, { success: false, error: 'Missing email or password' });
                }

                const hash = crypto.createHash('sha256').update(password).digest('hex');
                await pool.query(
                    'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
                    [email.toLowerCase(), hash]
                );
                return sendJson(res, 200, { success: true, message: 'User created' });
            }

            if (pathname === '/api/auth/login' && req.method === 'POST') {
                const { email, password } = await parseJsonBody(req);
                if (!email || !password) {
                    return sendJson(res, 400, { success: false, error: 'Missing email or password' });
                }

                const hash = crypto.createHash('sha256').update(password).digest('hex');
                const result = await pool.query(
                    'SELECT id, email, password_hash FROM users WHERE email = $1',
                    [email.toLowerCase()]
                );

                if (result.rows.length === 0 || result.rows[0].password_hash !== hash) {
                    return sendJson(res, 401, { success: false, error: 'Invalid email or password' });
                }

                const user = result.rows[0];
                return sendJson(res, 200, { success: true, userId: user.id, email: user.email });
            }

            if (pathname === '/api/sync/upload' && req.method === 'POST') {
                const { userId, data } = await parseJsonBody(req);
                if (!userId || !data) {
                    return sendJson(res, 400, { success: false, error: 'Missing userId or data payload' });
                }

                await pool.query(
                    `INSERT INTO user_data (user_id, data, updated_at) 
                     VALUES ($1, $2, NOW()) 
                     ON CONFLICT (user_id) 
                     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
                    [userId, data]
                );
                return sendJson(res, 200, { success: true });
            }

            if (pathname === '/api/sync/download' && req.method === 'GET') {
                const userId = parsedUrl.searchParams.get('userId');
                if (!userId) {
                    return sendJson(res, 400, { success: false, error: 'Missing userId query parameter' });
                }

                const result = await pool.query(
                    'SELECT data FROM user_data WHERE user_id = $1',
                    [userId]
                );

                if (result.rows.length === 0) {
                    return sendJson(res, 200, { success: true, data: null });
                }

                return sendJson(res, 200, { success: true, data: result.rows[0].data });
            }

            // Fallback for unknown API
            return sendJson(res, 404, { success: false, error: 'API endpoint not found' });
        } catch (e) {
            console.error('API Error:', e);
            let errMsg = 'Internal server error';
            if (e.code === '23505') errMsg = 'Email address already registered';
            return sendJson(res, 500, { success: false, error: errMsg });
        }
    }

    // Static Files Routing
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
