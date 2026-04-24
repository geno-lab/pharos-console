import { useEffect, useRef } from "react";
import { useRun, type StreamMessage } from "./store";
import { wsUrl } from "./api";

export function useEventStream() {
  const applyMessage = useRun((s) => s.applyMessage);
  const setConnected = useRun((s) => s.setConnected);
  const retryRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let sock: WebSocket | null = null;
    let retryTimer: number | undefined;

    const connect = () => {
      if (cancelled) return;
      sock = new WebSocket(wsUrl());

      sock.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
      };

      sock.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as StreamMessage;
          applyMessage(msg);
        } catch {
          // ignore non-JSON frames (ping/pong are handled by the browser)
        }
      };

      sock.onclose = () => {
        setConnected(false);
        if (cancelled) return;
        const delay = Math.min(30_000, 1_000 * 2 ** retryRef.current);
        retryRef.current += 1;
        retryTimer = window.setTimeout(connect, delay);
      };

      sock.onerror = () => sock?.close();
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      sock?.close();
    };
  }, [applyMessage, setConnected]);
}
