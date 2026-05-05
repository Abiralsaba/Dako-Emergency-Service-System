import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// WebSocket client — connects to Spring's STOMP broker for live updates
let stompClient = null;

const websocketService = {
  // Connect to the WS server
  connect: (onConnected) => {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🔌 WebSocket connected');
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('WS error:', frame.headers['message']);
      }
    });
    stompClient.activate();
  },

  // Subscribe to a topic — returns the subscription for cleanup
  subscribe: (topic, callback) => {
    if (!stompClient || !stompClient.connected) {
      console.warn('WS not connected yet');
      return null;
    }
    return stompClient.subscribe(topic, (message) => {
      callback(JSON.parse(message.body));
    });
  },

  // Clean disconnect
  disconnect: () => {
    if (stompClient) {
      stompClient.deactivate();
      console.log('🔌 WebSocket disconnected');
    }
  },

  // Check connection state
  isConnected: () => stompClient && stompClient.connected,
};

export default websocketService;
