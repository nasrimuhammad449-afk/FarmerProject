const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve static files (HTML, CSS, JS, images) from the project root
app.use(express.static(__dirname));

// Proxy all other /api requests to Flask backend on port 5000
app.use(createProxyMiddleware({
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  filter: (pathname, req) => {
    return pathname.startsWith('/api') && pathname !== '/api/hello';
  }
}));

// Simple API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node!' });
});

const PORT = process.env.PORT || 3000;
// Bind to all network interfaces for accessibility from other devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
