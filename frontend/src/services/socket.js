import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  const token = localStorage.getItem('token');
  let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';

  if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    apiHost = `http://${window.location.hostname}:5005`;
  }

  if (!socket) {
    socket = io(apiHost, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  } else {
    // Update token on existing socket connection if token changed or was added
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
