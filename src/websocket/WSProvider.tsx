import React, { createContext, useContext, useEffect, useState } from 'react';
import WSClient from './WSClient';
import MockWSServer from './WSServer';

interface WebSocketContextType {
  socket: WSClient | null;
}

// create WebSocket context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WSProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WSClient | null>(null);

  useEffect(() => {
    const wsClient = new WSClient();
    const mockServer = new MockWSServer();
    wsClient.connect();

    wsClient.connection?.addEventListener('open', () => {
      setSocket(wsClient);
    });

    return () => {
      if (wsClient.connection) {
        wsClient.connection.close();
      }
      mockServer.stop();
    };
  }, [setSocket]);

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// add hook to use WebSocket
 export const useWebSocket = (): WSClient | null => {
    const context = useContext(WebSocketContext);
  
    if (!context) {
      throw new Error('useWebSocket must be used within a WSProvider');
    }
  
    return context.socket;
};
