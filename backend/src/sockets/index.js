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
    console.log(`▶ Socket connected: user=${u.id} role=${u.role}`);

    // Register Kahoot Live Quiz socket listeners
    registerKahootSocket(io, socket);

    socket.on('disconnect', () => {
      console.log(`◀ Socket disconnected: user=${u.id}`);
    });
  });
};
