import { useState, useEffect } from 'react';

type MessageHandler = (data: any) => void;

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(handlers: Record<string, MessageHandler>, options: UseWebSocketOptions = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    // Connection opened
    ws.addEventListener('open', () => {
      setIsConnected(true);
      if (options.onOpen) options.onOpen();
    });

    // Connection closed
    ws.addEventListener('close', () => {
      setIsConnected(false);
      if (options.onClose) options.onClose();
    });

    // Connection error
    ws.addEventListener('error', (error) => {
      if (options.onError) options.onError(error);
    });

    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && handlers[data.type]) {
          handlers[data.type](data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  // Send message function
  const sendMessage = (type: string, data: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type,
        ...data,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return { isConnected, sendMessage };
}
