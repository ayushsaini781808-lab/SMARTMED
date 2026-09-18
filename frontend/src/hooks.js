import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from './api/client';

const SOCKET_URL = API_BASE.replace(/\/api$/, '');

// FR-C2: subscribes to a doctor+date queue room and re-fetches on any update event.
export function useQueueSocket(doctorId, date, onUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!doctorId || !date) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('queue:join', { doctorId, date });
    socket.on('queue:update', () => onUpdate?.());

    return () => {
      socket.emit('queue:leave', { doctorId, date });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date]);

  return socketRef;
}

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
