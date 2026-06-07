require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set in .env. Login may still work in development, but set JWT_SECRET for production.');
}

const routes = require('./routes');
const initSockets = require('./sockets');

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: (origin, callback) => {
    // In development, allow any origin to facilitate local network testing on mobile devices
    callback(null, true);
  },
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

app.set('io', io);
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));
app.use('/api', routes);

// Central error handler
app.use((err, _req, res, _next) => {
  console.error('ERR:', err);
  res.status(500).json({ message: err.message || 'Server error' });
});

initSockets(io);

const PORT = parseInt(process.env.PORT, 10) || 5000;

function startServer(port) {
  server.listen(port)
    .once('listening', () => console.log(`🚀 Smart Lab API running on :${port}`))
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} already in use. Trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
}

startServer(PORT);
