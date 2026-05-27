import type { GeneratedDay, GenerateItineraryResponse } from '@apis/itinerary';
import type { PlaceVoteSummary } from '@apis/place-vote';
import type { PlanStateResponse } from '@apis/plan';
import { create } from 'zustand';

export type Category = '관광' | '맛집' | '카페' | '쇼핑' | '숙소' | '교통' | '기타';
export type PlaceVote = 'like' | 'dislike';
export type PlaceVoteSelection = PlaceVote | null;

export type Participant = { memberId: number; nickname: string };
export type EditLock = { placeId: number; memberId: number; nickname: string };
export type DragState = { placeId: number; memberId: number; nickname: string };

export interface PlaceItem {
  id: string;
  serverId?: number;
  name: string;
  address?: string;
  category: Category;
  description: string;
  duration: string;
  price: string;
  reservationUrl?: string;
  memo?: string;
  likes: number;
  dislikes: number;
  vote?: PlaceVote | null;
  imageUrl: string;
}

export interface DayItem {
  dayId?: number;
  label: string;
  shortDate: string;
  fullDate: string;
  places: PlaceItem[];
}

interface TripStore {
  days: DayItem[];
  remoteVotes: Record<string, PlaceVoteSelection>;
  participants: Participant[];
  editLocks: EditLock[];
  dragStates: DragState[];
  setGeneratedItinerary: (itinerary: GenerateItineraryResponse) => void;
  syncFromState: (state: PlanStateResponse) => void;
  setParticipants: (participants: Participant[]) => void;
  applyEditLock: (placeId: number, memberId: number, nickname: string) => void;
  applyEditUnlock: (placeId: number) => void;
  applyRemotePlaceOrderChanged: (
    dayId: number,
    placeOrders: Array<{ placeId: number; orderIndex: number }>,
  ) => void;
  applyRemotePlaceAdded: (payload: {
    placeId: number;
    dayId: number;
    name: string;
    address: string;
    category: string;
    orderIndex: number;
    estimatedCost?: number;
    stayDurationMin?: number;
  }) => void;
  applyRemotePlaceDeleted: (placeId: number) => void;
  applyRemoteDragStart: (placeId: number, memberId: number, nickname: string) => void;
  applyRemoteDragEnd: (placeId: number, memberId: number) => void;
  /**
   * 로컬 드래그 완료 시 호출 — 낙관적 업데이트 후 broadcastReorder로 동기화
   */
  reorderPlaces: (dayIndex: number, fromIndex: number, toIndex: number) => void;
  /**
   * 다른 클라이언트의 reorder 이벤트 수신 시 호출
   * 추후 conflict resolution 로직을 여기에 추가
   */
  applyRemoteReorder: (dayIndex: number, fromIndex: number, toIndex: number) => void;
  /** 특정 장소에 좋아요/싫어요 투표를 반영 */
  votePlace: (dayIndex: number, placeId: string, vote: PlaceVote) => void;
  /** 서버 집계 응답으로 특정 장소의 투표 카운트와 내 선택 상태를 갱신 */
  setPlaceVoteSummary: (dayIndex: number, placeId: string, summary: PlaceVoteSummary) => void;
  /** 다른 클라이언트의 vote 이벤트 수신 시 호출 */
  applyRemoteVote: (
    dayIndex: number,
    placeId: string,
    clientId: string,
    vote: PlaceVoteSelection,
  ) => void;
  /** 특정 Day에 장소를 추가 */
  addPlace: (dayIndex: number, place: PlaceItem) => void;
  /** 특정 장소의 상세 편집 정보를 갱신 */
  updatePlaceDetails: (
    dayIndex: number,
    placeId: string,
    details: Pick<PlaceItem, 'duration' | 'price' | 'reservationUrl' | 'memo'>,
  ) => void;
  /** 특정 Day에서 장소를 삭제 */
  deletePlace: (dayIndex: number, placeId: string) => void;
}

function moveItem(places: PlaceItem[], from: number, to: number): PlaceItem[] {
  const next = [...places];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function applyVoteTransition(
  place: PlaceItem,
  previousVote: PlaceVoteSelection,
  nextVote: PlaceVoteSelection,
  shouldUpdateOwnVote = false,
): PlaceItem {
  if (previousVote === nextVote) return place;

  const nextPlace = {
    ...place,
    likes: previousVote === 'like' ? Math.max(place.likes - 1, 0) : place.likes,
    dislikes: previousVote === 'dislike' ? Math.max(place.dislikes - 1, 0) : place.dislikes,
  };

  nextPlace.likes = nextVote === 'like' ? nextPlace.likes + 1 : nextPlace.likes;
  nextPlace.dislikes = nextVote === 'dislike' ? nextPlace.dislikes + 1 : nextPlace.dislikes;

  return shouldUpdateOwnVote ? { ...nextPlace, vote: nextVote } : nextPlace;
}

function updatePlaceVote(days: DayItem[], dayIndex: number, placeId: string, vote: PlaceVote) {
  return days.map((day, i) =>
    i === dayIndex
      ? {
          ...day,
          places: day.places.map((place) => {
            if (place.id !== placeId) return place;
            const previousVote = place.vote ?? null;
            const nextVote = previousVote === vote ? null : vote;

            return applyVoteTransition(place, previousVote, nextVote, true);
          }),
        }
      : day,
  );
}

function updateRemotePlaceVote(
  days: DayItem[],
  dayIndex: number,
  placeId: string,
  previousVote: PlaceVoteSelection,
  nextVote: PlaceVoteSelection,
) {
  return days.map((day, i) =>
    i === dayIndex
      ? {
          ...day,
          places: day.places.map((place) =>
            place.id === placeId
              ? applyVoteTransition(place, previousVote, nextVote, false)
              : place,
          ),
        }
      : day,
  );
}

function mapServerVote(voteType: PlaceVoteSummary['myVoteType']): PlaceVoteSelection {
  if (voteType === 'LIKE') return 'like';
  if (voteType === 'DISLIKE') return 'dislike';

  return null;
}

function formatShortDate(date: string): string {
  const dateValue = new Date(`${date}T00:00:00`);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return `${dateValue.getMonth() + 1}.${dateValue.getDate()}(${weekdays[dateValue.getDay()]})`;
}

function formatFullDate(date: string): string {
  const dateValue = new Date(`${date}T00:00:00`);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return `${dateValue.getMonth() + 1}월 ${dateValue.getDate()}일(${weekdays[dateValue.getDay()]})`;
}

function formatPrice(value: number): string {
  return value > 0 ? `${value.toLocaleString()}원` : '무료';
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `예상 ${minutes}분`;

  const hours = minutes / 60;
  return Number.isInteger(hours) ? `예상 ${hours}시간` : `예상 ${hours.toFixed(1)}시간`;
}

function mapGeneratedCategory(category: string): Category {
  switch (category) {
    case 'RESTAURANT':
      return '맛집';
    case 'CAFE':
      return '카페';
    case 'SHOPPING':
      return '쇼핑';
    case 'ACCOMMODATION':
      return '숙소';
    case 'ATTRACTION':
      return '관광';
    default:
      return '기타';
  }
}

function mapGeneratedDay(day: GeneratedDay): DayItem {
  return {
    label: `Day${day.dayNumber}`,
    shortDate: formatShortDate(day.date),
    fullDate: formatFullDate(day.date),
    places: day.places.map((place, index) => ({
      id: `${day.dayNumber}-${index}-${place.name}`,
      serverId: place.placeId ?? place.id,
      name: place.name,
      address: place.address,
      category: mapGeneratedCategory(place.category),
      description: place.description,
      duration: formatDuration(place.stayDurationMin),
      price: formatPrice(place.estimatedCost),
      likes: 0,
      dislikes: 0,
      vote: null,
      imageUrl: '',
    })),
  };
}

export const useTripStore = create<TripStore>((set) => ({
  days: [],
  remoteVotes: {},
  participants: [],
  editLocks: [],
  dragStates: [],

  setGeneratedItinerary: (itinerary) => {
    set({
      days: itinerary.days.map(mapGeneratedDay),
      remoteVotes: {},
    });
  },

  syncFromState: (state) => {
    set((current) => {
      const updatedDays = state.days.map((serverDay) => {
        const existingDay = current.days.find((d) => d.dayId === serverDay.dayId);
        return {
          dayId: serverDay.dayId,
          label: `Day${serverDay.dayNumber}`,
          shortDate: formatShortDate(serverDay.date),
          fullDate: formatFullDate(serverDay.date),
          places: [...serverDay.places]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((p) => {
              const existing = existingDay?.places.find((ep) => ep.serverId === p.placeId);
              return {
                id: existing?.id ?? String(p.placeId),
                serverId: p.placeId,
                name: p.name,
                address: p.address,
                category: mapGeneratedCategory(p.category),
                description: p.address ?? '',
                duration: formatDuration(p.stayDurationMin),
                price: formatPrice(p.estimatedCost),
                likes: existing?.likes ?? 0,
                dislikes: existing?.dislikes ?? 0,
                vote: existing?.vote ?? null,
                imageUrl: existing?.imageUrl ?? '',
              };
            }),
        };
      });

      return {
        days: updatedDays,
        participants: state.participants,
        editLocks: state.editLocks,
      };
    });
  },

  setParticipants: (participants) => {
    set({ participants });
  },

  applyEditLock: (placeId, memberId, nickname) => {
    set((state) => ({
      editLocks: [
        ...state.editLocks.filter((l) => l.placeId !== placeId),
        { placeId, memberId, nickname },
      ],
    }));
  },

  applyEditUnlock: (placeId) => {
    set((state) => ({
      editLocks: state.editLocks.filter((l) => l.placeId !== placeId),
    }));
  },

  applyRemotePlaceOrderChanged: (dayId, placeOrders) => {
    set((state) => ({
      days: state.days.map((day) => {
        if (day.dayId !== dayId) return day;
        const orderMap = new Map(placeOrders.map((o) => [o.placeId, o.orderIndex]));
        const sorted = [...day.places].sort((a, b) => {
          const orderA = a.serverId !== undefined ? (orderMap.get(a.serverId) ?? Infinity) : Infinity;
          const orderB = b.serverId !== undefined ? (orderMap.get(b.serverId) ?? Infinity) : Infinity;
          return orderA - orderB;
        });
        return { ...day, places: sorted };
      }),
    }));
  },

  applyRemotePlaceAdded: (payload) => {
    set((state) => ({
      days: state.days.map((day) => {
        if (day.dayId !== payload.dayId) return day;
        const newPlace: PlaceItem = {
          id: String(payload.placeId),
          serverId: payload.placeId,
          name: payload.name,
          address: payload.address,
          category: mapGeneratedCategory(payload.category),
          description: payload.address ?? '',
          duration: formatDuration(payload.stayDurationMin ?? 60),
          price: formatPrice(payload.estimatedCost ?? 0),
          likes: 0,
          dislikes: 0,
          vote: null,
          imageUrl: '',
        };
        const places = [...day.places];
        places.splice(payload.orderIndex, 0, newPlace);
        return { ...day, places };
      }),
    }));
  },

  applyRemotePlaceDeleted: (placeId) => {
    set((state) => ({
      days: state.days.map((day) => ({
        ...day,
        places: day.places.filter((p) => p.serverId !== placeId),
      })),
    }));
  },

  applyRemoteDragStart: (placeId, memberId, nickname) => {
    set((state) => ({
      dragStates: [
        ...state.dragStates.filter((d) => !(d.placeId === placeId && d.memberId === memberId)),
        { placeId, memberId, nickname },
      ],
    }));
  },

  applyRemoteDragEnd: (placeId, memberId) => {
    set((state) => ({
      dragStates: state.dragStates.filter(
        (d) => !(d.placeId === placeId && d.memberId === memberId),
      ),
    }));
  },

  reorderPlaces: (dayIndex, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    set((state) => ({
      days: state.days.map((day, i) =>
        i === dayIndex ? { ...day, places: moveItem(day.places, fromIndex, toIndex) } : day,
      ),
    }));
  },

  applyRemoteReorder: (dayIndex, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    set((state) => ({
      days: state.days.map((day, i) =>
        i === dayIndex ? { ...day, places: moveItem(day.places, fromIndex, toIndex) } : day,
      ),
    }));
  },

  votePlace: (dayIndex, placeId, vote) => {
    set((state) => ({
      days: updatePlaceVote(state.days, dayIndex, placeId, vote),
    }));
  },

  setPlaceVoteSummary: (dayIndex, placeId, summary) => {
    set((state) => ({
      days: state.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              places: day.places.map((place) =>
                place.id === placeId
                  ? {
                      ...place,
                      likes: summary.likeCount,
                      dislikes: summary.dislikeCount,
                      vote: mapServerVote(summary.myVoteType),
                    }
                  : place,
              ),
            }
          : day,
      ),
    }));
  },

  applyRemoteVote: (dayIndex, placeId, clientId, vote) => {
    set((state) => {
      const remoteVoteKey = `${clientId}:${placeId}`;
      const previousVote = state.remoteVotes[remoteVoteKey] ?? null;

      return {
        days: updateRemotePlaceVote(state.days, dayIndex, placeId, previousVote, vote),
        remoteVotes: {
          ...state.remoteVotes,
          [remoteVoteKey]: vote,
        },
      };
    });
  },

  addPlace: (dayIndex, place) => {
    set((state) => ({
      days: state.days.map((day, i) =>
        i === dayIndex ? { ...day, places: [...day.places, place] } : day,
      ),
    }));
  },

  updatePlaceDetails: (dayIndex, placeId, details) => {
    set((state) => ({
      days: state.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              places: day.places.map((place) =>
                place.id === placeId ? { ...place, ...details } : place,
              ),
            }
          : day,
      ),
    }));
  },

  deletePlace: (dayIndex, placeId) => {
    set((state) => ({
      days: state.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              places: day.places.filter((place) => place.id !== placeId),
            }
          : day,
      ),
    }));
  },
}));
