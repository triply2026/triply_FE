import { useCallback, useEffect, useRef } from 'react';
import { useTripStore } from '@stores/trip-store';

type ReorderMessage = {
  type: 'place_reorder';
  clientId: string;
  dayIndex: number;
  fromIndex: number;
  toIndex: number;
  /** 서버에서 conflict resolution 시 사용할 타임스탬프 */
  timestamp: number;
};

/**
 * 백엔드 준비 시 .env에 VITE_WS_URL 설정
 * ex) VITE_WS_URL=wss://api.triply.app/ws
 */
const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? '';

/**
 * 실시간 협업 동기화 훅
 *
 * - WebSocket으로 drag-and-drop reorder 이벤트를 브로드캐스트
 * - 다른 클라이언트의 이벤트를 수신해 스토어에 반영
 * - WS_URL이 없으면 연결 시도 없이 로컬 전용으로 동작
 */
export function useTripSync(tripId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef(crypto.randomUUID());
  const applyRemoteReorder = useTripStore((s) => s.applyRemoteReorder);

  useEffect(() => {
    if (!WS_URL) return;

    const ws = new WebSocket(`${WS_URL}/trips/${tripId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ReorderMessage;
        // 자신이 보낸 메시지는 무시 (서버가 echo하는 경우 대비)
        if (msg.clientId === clientIdRef.current) return;
        if (msg.type === 'place_reorder') {
          applyRemoteReorder(msg.dayIndex, msg.fromIndex, msg.toIndex);
        }
      } catch {
        // 파싱 실패 무시
      }
    };

    return () => {
      ws.close();
    };
  }, [tripId, applyRemoteReorder]);

  /**
   * 로컬 reorder 완료 후 다른 클라이언트에 브로드캐스트
   * WebSocket 미연결 상태면 아무것도 하지 않음
   */
  const broadcastReorder = useCallback(
    (dayIndex: number, fromIndex: number, toIndex: number) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const msg: ReorderMessage = {
        type: 'place_reorder',
        clientId: clientIdRef.current,
        dayIndex,
        fromIndex,
        toIndex,
        timestamp: Date.now(),
      };
      ws.send(JSON.stringify(msg));
    },
    [],
  );

  return { broadcastReorder };
}
