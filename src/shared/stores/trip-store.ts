import type { GeneratedDay, GenerateItineraryResponse } from '@apis/itinerary';
import { create } from 'zustand';

export type Category = '관광' | '맛집' | '카페' | '쇼핑' | '숙소' | '교통' | '기타';

export interface PlaceItem {
  id: string;
  name: string;
  address?: string;
  category: Category;
  description: string;
  duration: string;
  price: string;
  likes: number;
  dislikes: number;
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
  /** 특정 Day에 장소를 추가 */
  addPlace: (dayIndex: number, place: PlaceItem) => void;
}

function moveItem(places: PlaceItem[], from: number, to: number): PlaceItem[] {
  const next = [...places];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
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
      name: place.name,
      address: place.address,
      category: mapGeneratedCategory(place.category),
      description: place.description,
      duration: formatDuration(place.stayDurationMin),
      price: formatPrice(place.estimatedCost),
      likes: 0,
      dislikes: 0,
      imageUrl: '',
    })),
  };
}

export const useTripStore = create<TripStore>((set) => ({
  days: INITIAL_DAYS,

  setGeneratedItinerary: (itinerary) => {
    set({
      days: itinerary.days.map(mapGeneratedDay),
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

  addPlace: (dayIndex, place) => {
    set((state) => ({
      days: state.days.map((day, i) =>
        i === dayIndex ? { ...day, places: [...day.places, place] } : day,
      ),
    }));
  },
}));
