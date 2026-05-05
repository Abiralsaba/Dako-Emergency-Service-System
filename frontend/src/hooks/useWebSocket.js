import { useEffect, useRef, useCallback } from 'react';
import websocketService from '../services/websocketService';

// Manages WebSocket lifecycle and topic subscriptions
export default function useWebSocket() {
  const subscriptionsRef = useRef([]);
  const connectedRef = useRef(false);
  const pendingRef = useRef([]);

  useEffect(() => {
    websocketService.connect(() => {
      connectedRef.current = true;
      // Process any subscriptions that were queued before connection
      pendingRef.current.forEach(({ topic, callback }) => {
        const sub = websocketService.subscribe(topic, callback);
        if (sub) subscriptionsRef.current.push(sub);
      });
      pendingRef.current = [];
    });

    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to a topic — queues if not connected yet
  const subscribe = useCallback((topic, callback) => {
    if (connectedRef.current) {
      const sub = websocketService.subscribe(topic, callback);
      if (sub) subscriptionsRef.current.push(sub);
      return sub;
    } else {
      pendingRef.current.push({ topic, callback });
      return null;
    }
  }, []);

  return { subscribe };
}
