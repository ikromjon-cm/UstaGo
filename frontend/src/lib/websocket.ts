import { useAuthStore } from "@/store/auth";

type MessageHandler = (data: any) => void;

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private maxRetries = 5;

  connect(path: string, onMessage?: MessageHandler): string {
    const token = useAuthStore.getState().accessToken;
    if (!token) return "";

    const wsUrl = `${WS_BASE}/${path}/?token=${token}`;
    const key = path;

    if (this.connections.has(key)) {
      if (onMessage) this.addHandler(key, onMessage);
      return key;
    }

    const ws = new WebSocket(wsUrl);
    let retryCount = 0;

    ws.onopen = () => {
      retryCount = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handlers = this.handlers.get(key);
        if (handlers) handlers.forEach((h) => h(data));
      } catch {}
    };

    ws.onclose = () => {
      this.connections.delete(key);
      if (retryCount < this.maxRetries) {
        retryCount++;
        const timer = setTimeout(() => {
          this.connect(path);
        }, Math.min(1000 * Math.pow(2, retryCount), 30000));
        this.reconnectTimers.set(key, timer);
      }
    };

    ws.onerror = () => ws.close();
    this.connections.set(key, ws);
    if (onMessage) this.addHandler(key, onMessage);

    return key;
  }

  send(path: string, data: any) {
    const ws = this.connections.get(path);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  addHandler(path: string, handler: MessageHandler) {
    if (!this.handlers.has(path)) {
      this.handlers.set(path, new Set());
    }
    this.handlers.get(path)!.add(handler);
  }

  removeHandler(path: string, handler: MessageHandler) {
    this.handlers.get(path)?.delete(handler);
  }

  disconnect(path: string) {
    const ws = this.connections.get(path);
    ws?.close();
    this.connections.delete(path);
    this.handlers.delete(path);
    const timer = this.reconnectTimers.get(path);
    if (timer) clearTimeout(timer);
    this.reconnectTimers.delete(path);
  }

  disconnectAll() {
    this.connections.forEach((ws, key) => this.disconnect(key));
  }
}

export const wsManager = new WebSocketManager();
