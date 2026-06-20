"use client";
import { useEffect, useCallback, useRef } from "react";
import { wsManager } from "@/lib/websocket";

export function useWebSocket(
  path: string | null,
  onMessage?: (data: any) => void,
) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  const send = useCallback(
    (data: any) => {
      if (path) wsManager.send(path, data);
    },
    [path],
  );

  useEffect(() => {
    if (!path) return;
    const handler = (data: any) => handlerRef.current?.(data);
    wsManager.connect(path, handler);
    return () => {
      wsManager.removeHandler(path, handler);
    };
  }, [path]);

  useEffect(() => {
    return () => {
      if (path) wsManager.disconnect(path);
    };
  }, [path]);

  return { send };
}
