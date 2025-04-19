type MessageHandler = (data: any) => void;

interface WSMessage {
  event_type: string;
  queue_id: string;
  data?: any;
  timestamp: number;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  connect(queueId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.disconnect();
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/queues/${queueId}/ws`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`WebSocket connected for queue ${queueId}`);
        this.reconnectAttempts = 0;
        resolve(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket closed for queue ${queueId}:`, event.code, event.reason);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Attempting to reconnect in ${timeout}ms...`);
          
          this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(queueId);
          }, timeout);
        }
        
        resolve(false);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        resolve(false);
      };
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(eventType: string, handler: MessageHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
  }

  off(eventType: string, handler: MessageHandler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private handleMessage(message: WSMessage) {
    const { event_type } = message;
    
    const handlers = this.eventHandlers.get(event_type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
    
    const allHandlers = this.eventHandlers.get('all');
    if (allHandlers) {
      allHandlers.forEach(handler => handler(message));
    }
  }
}

export const websocketService = new WebSocketService();
