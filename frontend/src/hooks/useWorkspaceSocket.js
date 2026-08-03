import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getToken, SOCKET_URL } from '../services/api';

export function useWorkspaceSocket(workspaceId, handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const events = [
      'task:created',
      'task:updated',
      'task:deleted',
      'comment:created',
      'comment:deleted',
      'activity:created',
      'notification:created',
    ];

    events.forEach((event) => {
      socket.on(event, (payload) => handlersRef.current[event]?.(payload));
    });

    socket.on('connect', () => {
      if (workspaceId) socket.emit('workspace:join', workspaceId);
      handlersRef.current.connect?.();
    });

    return () => {
      if (workspaceId) socket.emit('workspace:leave', workspaceId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [workspaceId]);

  return socketRef;
}
