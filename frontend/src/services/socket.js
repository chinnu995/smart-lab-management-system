import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  const token = localStorage.getItem('token');
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
  let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';

  if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    apiHost = `${protocol}//${window.location.hostname}:5005`;
  }

  // Strip any trailing /api path so socket.io connects to root namespace
  try {
    const parsed = new URL(apiHost);
    apiHost = parsed.origin;
  } catch (_) {
    apiHost = apiHost.replace(/\/+$/, '').replace(/\/api$/, '');
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
    // If token changed on an existing socket, reconnect with new auth
    if (socket.auth?.token !== token) {
      socket.auth = { token };
      socket.disconnect().connect();
    } else if (!socket.connected) {
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
