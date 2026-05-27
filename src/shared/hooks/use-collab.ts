import { getPlanState } from '@apis/plan';
import { useAuthStore } from '@stores/auth-store';
import { useTripStore } from '@stores/trip-store';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';

const WS_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

// ─── 이벤트 타입 ──────────────────────────────────────────────────────────────

type CollabEventBase = {
  planId: number;
  memberId: number;
  nickname: string;
  timestamp: string;
};

type ParticipantsUpdatedEvent = CollabEventBase & {
  type: 'PARTICIPANTS_UPDATED';
  payload: { participants: Array<{ memberId: number; nickname: string }> };
};

type PlaceOrderChangedEvent = CollabEventBase & {
  type: 'PLACE_ORDER_CHANGED';
  payload: { dayId: number; placeOrders: Array<{ placeId: number; orderIndex: number }> };
};

type PlaceEditStartedEvent = CollabEventBase & {
  type: 'PLACE_EDIT_STARTED';
  payload: { placeId: number };
};

type PlaceEditEndedEvent = CollabEventBase & {
  type: 'PLACE_EDIT_ENDED';
  payload: { placeId: number };
};

type PlaceAddedEvent = CollabEventBase & {
  type: 'PLACE_ADDED';
  payload: {
    placeId: number;
    dayId: number;
    name: string;
    address: string;
    category: string;
    orderIndex: number;
    estimatedCost?: number;
    stayDurationMin?: number;
    latitude?: number;
    longitude?: number;
  };
};

type PlaceDeletedEvent = CollabEventBase & {
  type: 'PLACE_DELETED';
  payload: { placeId: number };
};

type PlaceDragStartedEvent = CollabEventBase & {
  type: 'PLACE_DRAG_STARTED';
  payload: { placeId: number };
};

type PlaceDragEndedEvent = CollabEventBase & {
  type: 'PLACE_DRAG_ENDED';
  payload: { placeId: number };
};

type CollabEvent =
  | ParticipantsUpdatedEvent
  | PlaceOrderChangedEvent
  | PlaceEditStartedEvent
  | PlaceEditEndedEvent
  | PlaceAddedEvent
  | PlaceDeletedEvent
  | PlaceDragStartedEvent
  | PlaceDragEndedEvent;

// ─── 이벤트 핸들러 ────────────────────────────────────────────────────────────

function handleCollabEvent(event: CollabEvent) {
  const store = useTripStore.getState();
  const currentMemberId = useAuthStore.getState().member?.id;

  // 드래그 이벤트는 자신이 보낸 것이면 무시 (로컬 상태로 처리)
  if (
    (event.type === 'PLACE_DRAG_STARTED' || event.type === 'PLACE_DRAG_ENDED') &&
    event.memberId === currentMemberId
  ) {
    return;
  }

  switch (event.type) {
    case 'PARTICIPANTS_UPDATED':
      store.setParticipants(event.payload.participants);
      break;
    case 'PLACE_ORDER_CHANGED':
      store.applyRemotePlaceOrderChanged(event.payload.dayId, event.payload.placeOrders);
      break;
    case 'PLACE_EDIT_STARTED':
      store.applyEditLock(event.payload.placeId, event.memberId, event.nickname);
      break;
    case 'PLACE_EDIT_ENDED':
      store.applyEditUnlock(event.payload.placeId);
      break;
    case 'PLACE_ADDED':
      store.applyRemotePlaceAdded(event.payload);
      break;
    case 'PLACE_DELETED':
      store.applyRemotePlaceDeleted(event.payload.placeId);
      break;
    case 'PLACE_DRAG_STARTED':
      store.applyRemoteDragStart(event.payload.placeId, event.memberId, event.nickname);
      break;
    case 'PLACE_DRAG_ENDED':
      store.applyRemoteDragEnd(event.payload.placeId, event.memberId);
      break;
  }
}

// ─── 훅 ───────────────────────────────────────────────────────────────────────

export function useCollab(planId: number | null) {
  const clientRef = useRef<Client | null>(null);
  const member = useAuthStore((s) => s.member);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [planId]);

  useEffect(() => {
    if (!planId || !WS_BASE_URL || !member) {
      console.warn('[collab] WebSocket 연결 건너뜀 —', { planId, hasUrl: !!WS_BASE_URL, member: member?.nickname });
      setIsLoading(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
      reconnectDelay: 5000,
      onDisconnect: () => {
        console.warn('[collab] ❌ WebSocket 연결 끊김');
      },
      onStompError: (frame) => {
        console.error('[collab] 🚨 STOMP 에러:', frame.headers['message'], frame.body);
      },
      onWebSocketError: (event) => {
        console.error('[collab] 🚨 WebSocket 에러:', event);
      },
      onConnect: () => {
        console.log('[collab] ✅ WebSocket 연결됨, planId:', planId, 'member:', member?.nickname);

        // 플랜 이벤트 구독
        client.subscribe(`/topic/plan/${planId}`, ({ body }) => {
          try {
            const event = JSON.parse(body) as CollabEvent;
            console.log('[collab] 📨 이벤트 수신:', event.type, event);
            handleCollabEvent(event);
          } catch {
            // 파싱 실패 무시
          }
        });

        // 잠금 실패 에러 구독
        client.subscribe('/user/queue/error', ({ body }) => {
          try {
            const err = JSON.parse(body) as { message: string; lockedBy: string };
            toast.error(`편집 실패: ${err.lockedBy}님이 편집 중입니다.`);
          } catch {
            // 무시
          }
        });

        // 상태 동기화 후 입장 알림
        const sendJoin = () => {
          client.publish({
            destination: `/app/plan/${planId}/join`,
            body: JSON.stringify({ memberId: member.id, nickname: member.nickname }),
          });
        };
        getPlanState(planId)
          .then((state) => useTripStore.getState().syncFromState(state))
          .catch(() => {
            /* 동기화 실패 시 기존 상태 유지 */
          })
          .then(
            () => { setIsLoading(false); sendJoin(); },
            () => { setIsLoading(false); sendJoin(); },
          );
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      void client.deactivate();
      clientRef.current = null;
    };
  }, [planId, member]);

  // 드래그앤드롭 완료 후 순서 발행 (dayIndex → 현재 store에서 placeOrders 구성)
  const broadcastReorder = useCallback(
    (dayIndex: number) => {
      const client = clientRef.current;
      if (!client?.connected || !planId || !member) return;

      const days = useTripStore.getState().days;
      const day = days[dayIndex];
      if (!day?.dayId) return;

      const placeOrders = day.places
        .filter((p) => p.serverId !== undefined)
        .map((p, idx) => ({ placeId: p.serverId!, orderIndex: idx }));

      client.publish({
        destination: `/app/plan/${planId}/place/reorder`,
        body: JSON.stringify({
          memberId: member.id,
          nickname: member.nickname,
          dayId: day.dayId,
          placeOrders,
        }),
      });
    },
    [planId, member],
  );

  // 카드 편집 시작
  const broadcastEditStart = useCallback(
    (placeId: number) => {
      const client = clientRef.current;
      if (!client?.connected || !planId || !member) return;
      client.publish({
        destination: `/app/plan/${planId}/place/edit/start`,
        body: JSON.stringify({ memberId: member.id, nickname: member.nickname, placeId }),
      });
    },
    [planId, member],
  );

  // 카드 편집 종료
  const broadcastEditEnd = useCallback(
    (placeId: number) => {
      const client = clientRef.current;
      if (!client?.connected || !planId || !member) return;
      client.publish({
        destination: `/app/plan/${planId}/place/edit/end`,
        body: JSON.stringify({ memberId: member.id, nickname: member.nickname, placeId }),
      });
    },
    [planId, member],
  );

  // 장소 추가
  const broadcastAddPlace = useCallback(
    (
      dayId: number,
      placeData: {
        name: string;
        address: string;
        estimatedCost: number;
        stayDurationMin: number;
        latitude: number;
        longitude: number;
        mapPlaceId?: string;
        category: string;
      },
    ) => {
      const client = clientRef.current;
      if (!client?.connected || !planId || !member) return;
      client.publish({
        destination: `/app/plan/${planId}/place/add`,
        body: JSON.stringify({ memberId: member.id, nickname: member.nickname, dayId, ...placeData }),
      });
    },
    [planId, member],
  );

  // 장소 삭제
  const broadcastDeletePlace = useCallback(
    (placeId: number) => {
      const client = clientRef.current;
      if (!client?.connected || !planId || !member) return;
      client.publish({
        destination: `/app/plan/${planId}/place/delete`,
        body: JSON.stringify({ memberId: member.id, nickname: member.nickname, placeId }),
      });
    },
    [planId, member],
  );

  // 드래그 시작 — /topic에 직접 발행해 서버 엔드포인트 없이 피어 릴레이
  const broadcastDragStart = useCallback(
    (placeId: number) => {
      const client = clientRef.current;
      if (!client?.connected || !planId || !member) {
        console.warn('[collab] broadcastDragStart 스킵 — connected:', client?.connected, 'planId:', planId, 'member:', member?.nickname);
        return;
      }
      console.log('[collab] 📤 drag/start 발행, placeId:', placeId);
      client.publish({
        destination: `/topic/plan/${planId}`,
        body: JSON.stringify({
          type: 'PLACE_DRAG_STARTED',
          planId,
          memberId: member.id,
          nickname: member.nickname,
          payload: { placeId },
          timestamp: new Date().toISOString(),
        }),
      });
    },
    [planId, member],
  );

  // 드래그 종료
  const broadcastDragEnd = useCallback(
    (placeId: number) => {
      const client = clientRef.current;
      if (!client?.connected || !planId || !member) return;
      console.log('[collab] 📤 drag/end 발행, placeId:', placeId);
      client.publish({
        destination: `/topic/plan/${planId}`,
        body: JSON.stringify({
          type: 'PLACE_DRAG_ENDED',
          planId,
          memberId: member.id,
          nickname: member.nickname,
          payload: { placeId },
          timestamp: new Date().toISOString(),
        }),
      });
    },
    [planId, member],
  );

  return {
    isLoading,
    broadcastReorder,
    broadcastEditStart,
    broadcastEditEnd,
    broadcastAddPlace,
    broadcastDeletePlace,
    broadcastDragStart,
    broadcastDragEnd,
  };
}
