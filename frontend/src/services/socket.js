import { io } from 'socket.io-client';
let socket;
export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token');
    let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      apiHost = `http://${window.location.hostname}:5005`;
    }
    socket = io(apiHost, {
      auth: { token }, autoConnect: !!token
    });
  }
  return socket;
}
export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
