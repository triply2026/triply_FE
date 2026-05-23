import type { GeneratedDay, GenerateItineraryResponse } from '@apis/itinerary';
import type { PlaceVoteSummary } from '@apis/place-vote';
import { create } from 'zustand';

export type Category = '관광' | '맛집' | '카페' | '쇼핑' | '숙소' | '교통' | '기타';
export type PlaceVote = 'like' | 'dislike';
export type PlaceVoteSelection = PlaceVote | null;

export interface PlaceItem {
  id: string;
  serverId?: number;
  name: string;
  address?: string;
  category: Category;
  description: string;
  duration: string;
  price: string;
  likes: number;
  dislikes: number;
  vote?: PlaceVote | null;
  imageUrl: string;
}

export interface DayItem {
  label: string;
  shortDate: string;
  fullDate: string;
  places: PlaceItem[];
}

const CASTLE_IMAGE = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80';

const INITIAL_DAYS: DayItem[] = [
  {
    label: 'Day1',
    shortDate: '7.20(토)',
    fullDate: '7월 20일(토)',
    places: [
      {
        id: '1',
        name: '산탄젤로 성 1',
        category: '관광',
        description: '하드리아누스가 황제의 영묘로 60년 정도 사용한 원통형의 건축물',
        duration: '예상 1.5시간',
        price: '10,000원',
        likes: 3,
        dislikes: 3,
        imageUrl: CASTLE_IMAGE,
      },
      {
        id: '2',
        name: "Gelatio'0",
        category: '맛집',
        description: '로마 중심부에 위치한 인기 젤라또 가게',
        duration: '예상 0.5시간',
        price: '5,000원',
        likes: 3,
        dislikes: 3,
        imageUrl: CASTLE_IMAGE,
      },
      {
        id: '3',
        name: '산탄젤로 성 3',
        category: '관광',
        description: '하드리아누스가 황제의 영묘로 60년 정도 사용한 원통형의 건축물',
        duration: '예상 1.5시간',
        price: '10,000원',
        likes: 3,
        dislikes: 3,
        imageUrl: CASTLE_IMAGE,
      },
      {
        id: '4',
        name: '산탄젤로 성 4',
        category: '관광',
        description: '하드리아누스가 황제의 영묘로 60년 정도 사용한 원통형의 건축물',
        duration: '예상 1.5시간',
        price: '10,000원',
        likes: 3,
        dislikes: 3,
        imageUrl: CASTLE_IMAGE,
      },
    ],
  },
  { label: 'Day2', shortDate: '7.21(일)', fullDate: '7월 21일(일)', places: [] },
  { label: 'Day3', shortDate: '7.22(월)', fullDate: '7월 22일(월)', places: [] },
  { label: 'Day4', shortDate: '7.23(화)', fullDate: '7월 23일(화)', places: [] },
  { label: 'Day5', shortDate: '7.24(수)', fullDate: '7월 24일(수)', places: [] },
];

interface TripStore {
  days: DayItem[];
  remoteVotes: Record<string, PlaceVoteSelection>;
  setGeneratedItinerary: (itinerary: GenerateItineraryResponse) => void;
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
  days: INITIAL_DAYS,
  remoteVotes: {},

  setGeneratedItinerary: (itinerary) => {
    set({
      days: itinerary.days.map(mapGeneratedDay),
      remoteVotes: {},
    });
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
}));
