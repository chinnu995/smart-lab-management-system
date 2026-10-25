const jwt = require('jsonwebtoken');
const registerKahootSocket = require('./kahootSocket');

module.exports = function initSockets(io) {
  // JWT handshake middleware with guest fallback for public Kahoot arena
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
      } catch (e) {
        console.warn(`Socket JWT verification failed, proceeding as guest for socket ${socket.id}`);
      }
    }
    // Fallback guest user for live Kahoot play
    socket.user = {
      id: `guest_${socket.id.slice(0, 6)}`,
      name: `Guest Player`,
      role: 'student'
    };
    next();
  });

  io.on('connection', socket => {
    const u = socket.user;
    if (u.id) socket.join(`user:${u.id}`);
    if (u.role) socket.join(`role:${u.role}`);
    if (u.semester) socket.join(`sem:${u.semester}`);
    
    // Auto-resolve semester room for student sockets
    if (u.id && u.role === 'student') {
      const db = require('../config/db');
      db.query(
        "SELECT COALESCE(s.semester, u.semester) AS semester FROM users u LEFT JOIN students s ON s.user_id = u.user_id WHERE u.user_id = ?",
        [u.id]
      ).then(([rows]) => {
        const sem = rows?.[0]?.semester;
        if (sem) {
          socket.join(`sem:${sem}`);
          console.log(`▶ Student joined sem:${sem} room`);
        }
      }).catch(() => {});
    }

    console.log(`▶ Socket connected: user=${u.id} role=${u.role} sem=${u.semester || 'auto'}`);

    // Register Kahoot Live Quiz socket listeners
    registerKahootSocket(io, socket);

    socket.on('disconnect', () => {
      console.log(`◀ Socket disconnected: user=${u.id}`);
    });
  });
};
