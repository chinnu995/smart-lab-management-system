const jwt = require('jsonwebtoken');

module.exports = function initSockets(io) {
  // JWT handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (e) { next(new Error('Invalid token')); }
  });

  io.on('connection', socket => {
    const u = socket.user;
    socket.join(`user:${u.id}`);
    socket.join(`role:${u.role}`);
    console.log(`▶ socket connected: user=${u.id} role=${u.role}`);

    socket.on('disconnect', () => {
      console.log(`◀ socket disconnected: user=${u.id}`);
    });
  });
};
