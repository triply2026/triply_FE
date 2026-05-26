import type {
  GeneratedDay,
  GenerateItineraryRequest,
  GenerateItineraryResponse,
} from '@apis/itinerary';
import { cancelPlaceVote, createOrChangePlaceVote, getPlaceVoteSummary } from '@apis/place-vote';
import EditIcon from '@assets/icons/edit.svg?react';
import KebabIcon from '@assets/icons/kebab.svg?react';
import MenuIcon from '@assets/icons/menu.svg?react';
import PlusIcon from '@assets/icons/plus.svg?react';
import ShareIcon from '@assets/icons/share.svg?react';
import { DraftActionsDropdown } from '@components/dropdown/draft-actions-dropdown';
import { LandingHeader } from '@components/landing/landing-header';
import { TripTitleEditModal } from '@components/modal/trip-title-edit-modal';
import { AddPlaceModal, type PlaceResult } from '@components/trip/add-place-modal';
import { TripMap } from '@components/trip/google-map';
import { PlaceDetailPanel } from '@components/trip/place-detail-panel';
import { useCollab } from '@hooks/use-collab';
import { usePlaceSearch } from '@hooks/use-place-search';
import { useAuthStore } from '@stores/auth-store';
import {
  type Category,
  type DayItem,
  type DragState,
  type EditLock,
  type Participant,
  type PlaceItem,
  type PlaceVote,
  useTripStore,
} from '@stores/trip-store';
import { Fragment, type MouseEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

// ─── 상수 ────────────────────────────────────────────────────────────────────

const CATEGORY_CLASSES: Record<Category, string> = {
  관광: 'bg-[#eff6ff] text-primary-500',
  맛집: 'bg-[#f0fdf4] text-[#16a34a]',
  카페: 'bg-[#fff7ed] text-[#ea580c]',
  쇼핑: 'bg-[#fdf2f8] text-[#db2777]',
  숙소: 'bg-[#fef3c7] text-[#d97706]',
  교통: 'bg-[#f3f4f6] text-[#374151]',
  기타: 'bg-[#f3f4f6] text-[#374151]',
};

const AVATAR_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#ef4444',
  '#f59e0b',
];

function getAvatarColor(memberId: number): string {
  return AVATAR_COLORS[memberId % AVATAR_COLORS.length];
}

const MAX_VISIBLE_AVATARS = 3;

function ParticipantAvatars({ participants }: { participants: Participant[] }) {
  const visible = participants.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = participants.length - MAX_VISIBLE_AVATARS;

  if (participants.length === 0) return null;

  return (
    <div className="flex-items-center">
      {visible.map((p, i) => (
        <div
          key={p.memberId}
          className={`h-[42px] w-[42px] shrink-0 flex-row-center rounded-full border-2 border-white font-bold text-base text-white ${i > 0 ? '-ml-2' : ''}`}
          style={{ backgroundColor: getAvatarColor(p.memberId) }}
          title={p.nickname}
        >
          {p.nickname.slice(0, 1)}
        </div>
      ))}
      {overflow > 0 && (
        <div className="body ml-1 h-8 flex-items-center shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-[#fbfcfe] px-[10px] text-gray-500">
          +{overflow}
        </div>
      )}
    </div>
  );
}

const DEFAULT_TRIP_META = {
  title: '여행 제목을 입력해주세요',
  destination: '이탈리아',
  dateRange: '2026.05.20 ~ 05.28',
  memberCount: 4,
  budget: 300000,
};

type TripMeta = typeof DEFAULT_TRIP_META;

const TRIP_TITLE_STORAGE_KEY = 'triplyTripTitle';

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function formatDateWithDots(date: string): string {
  return date.split('-').join('.');
}

function formatTripDateRange(days: GeneratedDay[], request?: GenerateItineraryRequest): string {
  const startDate = request?.startDate ?? days[0]?.date;
  const endDate = request?.endDate ?? days[days.length - 1]?.date;

  if (!startDate || !endDate) return DEFAULT_TRIP_META.dateRange;

  return `${formatDateWithDots(startDate)} ~ ${formatDateWithDots(endDate).slice(5)}`;
}

function getTripMeta(
  itinerary: GenerateItineraryResponse | null,
  request: GenerateItineraryRequest | null,
): TripMeta {
  if (!itinerary && !request) return DEFAULT_TRIP_META;

  return {
    title: localStorage.getItem(TRIP_TITLE_STORAGE_KEY) ?? DEFAULT_TRIP_META.title,
    destination: request?.destination ?? DEFAULT_TRIP_META.destination,
    dateRange: formatTripDateRange(itinerary?.days ?? [], request ?? undefined),
    memberCount: request?.memberCount ?? DEFAULT_TRIP_META.memberCount,
    budget: request?.budget ?? DEFAULT_TRIP_META.budget,
  };
}

function findSelectedPlace(days: DayItem[], selectedPlaceId: string | null): PlaceItem | null {
  if (!selectedPlaceId) return null;

  for (const day of days) {
    const place = day.places.find((currentPlace) => currentPlace.id === selectedPlaceId);
    if (place) return place;
  }

  return null;
}

function getDayMapCenterQuery(day: DayItem | undefined, fallbackDestination: string): string {
  const firstPlace = day?.places[0];

  return firstPlace?.address ?? firstPlace?.name ?? fallbackDestination;
}

// ─── 작은 UI 컴포넌트 ─────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex h-[26px] shrink-0 items-center whitespace-nowrap rounded-[13px] px-2 pt-1 pb-[3px] font-bold text-body-sm leading-[1.6] ${CATEGORY_CLASSES[category]}`}
    >
      {category}
    </span>
  );
}

function ReactionBadge({
  emoji,
  count,
  label,
  isSelected = false,
  onClick,
}: {
  emoji: string;
  count: number;
  label: string;
  isSelected?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      className={`reaction-badge cursor-pointer gap-1 px-2 transition-colors ${
        isSelected ? 'border-primary-500 bg-primary-100 text-primary-500' : ''
      }`}
      onClick={onClick}
    >
      <span className="text-[11px]">{emoji}</span>
      <span className={`body-lg ${isSelected ? 'text-primary-500' : 'text-black'}`}>{count}</span>
    </button>
  );
}

// ─── PlaceCard ────────────────────────────────────────────────────────────────

function UserLabel({
  nickname,
  memberId,
  suffix,
}: {
  nickname: string;
  memberId?: number;
  suffix?: string;
}) {
  const color = memberId !== undefined ? getAvatarColor(memberId) : '#374151';
  return (
    <div
      className="absolute -top-[22px] left-0 z-20 flex h-[22px] items-center gap-1.5 rounded-full px-2 shadow-md"
      style={{ backgroundColor: color }}
    >
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/30 text-[9px] font-bold text-white">
        {nickname.slice(0, 1)}
      </span>
      <span className="whitespace-nowrap text-[11px] font-semibold leading-none text-white">
        {nickname}
        {suffix && ` · ${suffix}`}
      </span>
    </div>
  );
}

function PlaceCard({
  place,
  isDragging,
  isSelected,
  lock,
  remoteDrag,
  draggingNickname,
  onSelect,
  onVote,
}: {
  place: PlaceItem;
  isDragging: boolean;
  isSelected: boolean;
  lock?: EditLock;
  remoteDrag?: DragState;
  draggingNickname?: string;
  onSelect: () => void;
  onVote: (vote: PlaceVote) => void;
}) {
  const lockColor = lock ? getAvatarColor(lock.memberId) : null;
  const dragColor = remoteDrag ? getAvatarColor(remoteDrag.memberId) : null;

  return (
    <div className="relative flex-1">
      {/* 편집 잠금 레이블 (Figma 스타일) */}
      {lock && <UserLabel nickname={lock.nickname} memberId={lock.memberId} />}

      {/* 다른 사람 드래그 레이블 */}
      {!lock && remoteDrag && (
        <UserLabel nickname={remoteDrag.nickname} memberId={remoteDrag.memberId} suffix="이동 중" />
      )}

      {/* 내 드래그 레이블 */}
      {!lock && !remoteDrag && isDragging && draggingNickname && (
        <UserLabel nickname={draggingNickname} suffix="이동 중" />
      )}

      <button
        type="button"
        className={`itinerary-card w-full cursor-pointer px-[14px] py-4 text-left transition-[border-color,background-color,box-shadow] duration-150 ${
          isDragging ? 'itinerary-card--dragging' : ''
        } ${isSelected && !lock && !remoteDrag ? 'itinerary-card--selected' : ''} ${lock ? 'pointer-events-none' : ''}`}
        style={
          lockColor
            ? { outline: `2px solid ${lockColor}`, outlineOffset: '-1px' }
            : dragColor
              ? { outline: `2px dashed ${dragColor}`, outlineOffset: '-1px' }
              : undefined
        }
        onClick={onSelect}
      >
      {/* Thumbnail */}
      {place.imageUrl ? (
        <img className="itinerary-card__image" src={place.imageUrl} alt={place.name} />
      ) : (
        <div className="itinerary-card__image flex-row-center bg-primary-100 text-primary-500">
          {place.name.slice(0, 1)}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-col justify-between gap-1">
        <div className="flex-items-center gap-[9px]">
          <span className="heading-1 min-w-0 truncate text-black">{place.name}</span>
          <CategoryBadge category={place.category} />
        </div>
        <p className="body-lg overflow-hidden text-ellipsis whitespace-nowrap text-gray-700">
          {place.description}
        </p>
        <div className="flex-items-center gap-2">
          <span className="body whitespace-nowrap text-gray-700">{place.duration}</span>
          <div className="h-[18px] w-px shrink-0 bg-gray-100" />
          <span className="body whitespace-nowrap text-gray-700">{place.price}</span>
          <div className="ml-auto flex-items-center gap-[6px]">
            <ReactionBadge
              emoji="👍"
              count={place.likes}
              label={`${place.name} 좋아요`}
              isSelected={place.vote === 'like'}
              onClick={(event) => {
                event.stopPropagation();
                onVote('like');
              }}
            />
            <ReactionBadge
              emoji="👎"
              count={place.dislikes}
              label={`${place.name} 싫어요`}
              isSelected={place.vote === 'dislike'}
              onClick={(event) => {
                event.stopPropagation();
                onVote('dislike');
              }}
            />
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex-col justify-between self-stretch pl-1">
        {/* 드래그 핸들 — 부모의 draggable 속성으로 실제 드래그 시작 */}
        <div className="drag-handle icon-button" aria-hidden="true">
          <MenuIcon className="text-gray-700" />
        </div>
        <button type="button" className="icon-button" aria-label="더 보기">
          <KebabIcon className="text-gray-500" />
        </button>
      </div>
    </button>

    </div>
  );
}

// ─── DropZoneIndicator ────────────────────────────────────────────────────────

function DropZoneIndicator() {
  return (
    <li className="flex items-center gap-[14px] py-2">
      {/* order badge 너비와 맞춤 */}
      <div className="w-7 shrink-0" />
      <div className="itinerary-drop-zone flex-1">여기에 놓으면 순서가 변경돼요</div>
    </li>
  );
}

// ─── DayContent (드래그앤드랍 로직 담당) ──────────────────────────────────────

type DnDState = {
  /** 현재 드래그 중인 카드의 인덱스 */
  draggedIndex: number | null;
  /**
   * 드롭 존 위치 (0 = 첫 번째 카드 위, n = 마지막 카드 아래)
   * 두 유저가 동시에 드래그해도 각자의 로컬 상태이므로 독립적으로 동작
   */
  overZone: number | null;
};

type DayContentProps = {
  day: DayItem;
  dayIndex: number;
  selectedPlaceId: string | null;
  editLocks: EditLock[];
  dragStates: DragState[];
  onReorder: (dayIndex: number, fromIndex: number, toIndex: number) => void;
  onAddPlace: (dayIndex: number, place: PlaceItem) => void;
  onSelectPlace: (place: PlaceItem) => void;
  onVotePlace: (dayIndex: number, place: PlaceItem, vote: PlaceVote) => void;
  onDragStart: (placeId: number | undefined) => void;
  onDragEnd: (placeId: number | undefined) => void;
};

function DayContent({
  day,
  dayIndex,
  selectedPlaceId,
  editLocks,
  dragStates,
  onReorder,
  onAddPlace,
  onSelectPlace,
  onVotePlace,
  onDragStart,
  onDragEnd,
}: DayContentProps) {
  const member = useAuthStore((s) => s.member);
  const [{ draggedIndex, overZone }, setDnD] = useState<DnDState>({
    draggedIndex: null,
    overZone: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { results: placeResults, isLoading: isSearching, search: searchPlaces } = usePlaceSearch();

  const handlePlaceConfirm = (result: PlaceResult) => {
    const newPlace: PlaceItem = {
      id: crypto.randomUUID(),
      name: result.name,
      category: '관광',
      description: result.address,
      duration: '예상 1시간',
      price: '무료',
      likes: 0,
      dislikes: 0,
      imageUrl: result.imageUrl ?? '',
    };
    onAddPlace(dayIndex, newPlace);
    setIsModalOpen(false);
  };

  // 해당 존이 유효한 드롭 위치인지 (드래그 중인 카드에 인접한 zone은 무효)
  const isValidZone = (zone: number) => {
    if (draggedIndex === null) return false;
    return zone !== draggedIndex && zone !== draggedIndex + 1;
  };

  const resetDnD = () => setDnD({ draggedIndex: null, overZone: null });

  // 카드 위에서 dragOver 시 커서 위치에 따라 zone 계산
  const handleCardDragOver = (e: React.DragEvent<HTMLElement>, cardIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const zone = e.clientY < rect.top + rect.height / 2 ? cardIndex : cardIndex + 1;
    setDnD((prev) => ({ ...prev, overZone: zone }));
  };

  // 리스트 컨테이너에서 drop 처리
  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || overZone === null || !isValidZone(overZone)) {
      resetDnD();
      return;
    }
    // zone → 실제 삽입 인덱스 변환
    // ex) 4개 중 index 1을 zone 3으로 드롭 → toIndex = 3 - 1 = 2
    const toIndex = overZone > draggedIndex ? overZone - 1 : overZone;
    onReorder(dayIndex, draggedIndex, toIndex);
    resetDnD();
  };

  // 컨테이너 밖으로 나갈 때만 overZone 초기화 (자식 간 이동 시 오발 방지)
  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDnD((prev) => ({ ...prev, overZone: null }));
    }
  };

  const isDragging = draggedIndex !== null;

  return (
    <ul
      className="flex list-none flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleContainerDrop}
      onDragLeave={handleContainerDragLeave}
    >
      {day.places.map((place, i) => {
        const showZoneAbove = isDragging && overZone === i && isValidZone(i);

        return (
          <Fragment key={place.id}>
            {/* 카드 위 드롭존 */}
            {showZoneAbove && <DropZoneIndicator />}

            {/* 카드 행 (드래그 소스) */}
            <li
              className={`relative flex items-center gap-[14px] pt-6 transition-opacity duration-150 ${
                draggedIndex === i ? 'opacity-40' : 'opacity-100'
              }`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(place.serverId);
                // setTimeout: 브라우저가 ghost 이미지를 캡처한 뒤 opacity 변경
                setTimeout(() => setDnD({ draggedIndex: i, overZone: null }), 0);
              }}
              onDragEnd={() => {
                resetDnD();
                onDragEnd(place.serverId);
              }}
              onDragOver={(e) => handleCardDragOver(e, i)}
            >
              {/* 순서 뱃지 */}
              <div className="heading-2 h-6 w-6 flex-row-center shrink-0 rounded-full bg-primary-500 text-white">
                {i + 1}
              </div>

              <PlaceCard
                place={place}
                isDragging={draggedIndex === i}
                isSelected={place.id === selectedPlaceId}
                lock={place.serverId !== undefined ? editLocks.find((l) => l.placeId === place.serverId) : undefined}
                remoteDrag={
                  place.serverId !== undefined
                    ? dragStates.find((d) => d.placeId === place.serverId && d.memberId !== member?.id)
                    : undefined
                }
                draggingNickname={member?.nickname}
                onSelect={() => onSelectPlace(place)}
                onVote={(vote) => onVotePlace(dayIndex, place, vote)}
              />
            </li>
          </Fragment>
        );
      })}

      {/* 마지막 카드 아래 드롭존 */}
      {isDragging && overZone === day.places.length && isValidZone(day.places.length) && (
        <DropZoneIndicator />
      )}

      {/* 장소 추가 버튼 */}
      <li
        className="flex items-center gap-[14px] pt-4"
        // 드래그 중 이 영역으로 넘어오면 마지막 zone으로 처리
        onDragOver={(e) => {
          e.preventDefault();
          setDnD((prev) => ({ ...prev, overZone: day.places.length }));
        }}
      >
        <div className="w-7 shrink-0" />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="body-lg h-[68px] flex-1 flex-row-center cursor-pointer gap-[9px] rounded-[10px] bg-white text-primary-400 outline outline-dashed outline-primary-400"
        >
          <PlusIcon className="text-primary-500" />
          <span>여기에 장소를 추가하세요</span>
        </button>
      </li>

      {/* 장소 추가 모달 */}
      {isModalOpen && (
        <AddPlaceModal
          results={placeResults}
          isLoading={isSearching}
          onSearch={searchPlaces}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handlePlaceConfirm}
        />
      )}
    </ul>
  );
}

// ─── TripEditPage ─────────────────────────────────────────────────────────────

export function TripEditPage() {
  const { id } = useParams<{ id: string }>();
  const planId = id ? parseInt(id, 10) : null;
  const validPlanId = planId && !isNaN(planId) ? planId : null;

  const [activeDay, setActiveDay] = useState(0);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [tripMeta, setTripMeta] = useState<TripMeta>(DEFAULT_TRIP_META);
  const [isTitleEditModalOpen, setIsTitleEditModalOpen] = useState(false);
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const [, setIsConfirmModalOpen] = useState(false);
  const loadedVoteSummaryKeyRef = useRef('');

  const days = useTripStore((s) => s.days);
  const participants = useTripStore((s) => s.participants);
  const editLocks = useTripStore((s) => s.editLocks);
  const dragStates = useTripStore((s) => s.dragStates);
  const setGeneratedItinerary = useTripStore((s) => s.setGeneratedItinerary);
  const reorderPlaces = useTripStore((s) => s.reorderPlaces);
  const addPlace = useTripStore((s) => s.addPlace);
  const votePlace = useTripStore((s) => s.votePlace);
  const setPlaceVoteSummary = useTripStore((s) => s.setPlaceVoteSummary);

  // 실시간 협업 훅 — VITE_API_BASE_URL 설정 시 자동으로 STOMP 연결
  const { broadcastReorder, broadcastDragStart, broadcastDragEnd } = useCollab(validPlanId);

  const currentDay = days[activeDay];
  const selectedPlace = findSelectedPlace(days, selectedPlaceId);
  const mapCenterQuery = getDayMapCenterQuery(currentDay, tripMeta.destination);

  // 장소 serverId가 있을 때 서버에서 투표 집계 로드
  useEffect(() => {
    const serverPlaceIds: number[] = [];
    for (const day of days) {
      for (const place of day.places) {
        if (place.serverId) serverPlaceIds.push(place.serverId);
      }
    }

    const voteSummaryKey = serverPlaceIds.join('|');

    if (!voteSummaryKey || loadedVoteSummaryKeyRef.current === voteSummaryKey) return;

    loadedVoteSummaryKeyRef.current = voteSummaryKey;

    days.forEach((day, dayIndex) => {
      day.places.forEach((place) => {
        if (!place.serverId) return;

        getPlaceVoteSummary(place.serverId)
          .then((summary) => setPlaceVoteSummary(dayIndex, place.id, summary))
          .catch((error) => console.error(error));
      });
    });
  }, [days, setPlaceVoteSummary]);

  // AI 생성 일정을 localStorage에서 불러와 스토어에 반영
  useEffect(() => {
    const generatedItinerary = parseJson<GenerateItineraryResponse>(
      localStorage.getItem('triplyGeneratedItinerary'),
    );
    const itineraryRequest = parseJson<GenerateItineraryRequest>(
      localStorage.getItem('triplyItineraryRequest'),
    );

    if (generatedItinerary) {
      setGeneratedItinerary(generatedItinerary);
      setActiveDay(0);
      setSelectedPlaceId(null);
    }

    setTripMeta(getTripMeta(generatedItinerary, itineraryRequest));
  }, [setGeneratedItinerary]);

  const handleReorder = (dayIndex: number, fromIndex: number, toIndex: number) => {
    reorderPlaces(dayIndex, fromIndex, toIndex); // 낙관적 업데이트
    broadcastReorder(dayIndex); // store 업데이트 후 전체 순서 발행
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('공유 링크가 복사됐어요. 원하는 곳에 붙여넣어 공유해보세요!');
    });
  };

  const handleVotePlace = async (dayIndex: number, place: PlaceItem, vote: PlaceVote) => {
    const nextVote = place.vote === vote ? null : vote;
    const previousSummary = place.serverId
      ? {
          placeId: place.serverId,
          likeCount: place.likes,
          dislikeCount: place.dislikes,
          likeRatio: 0,
          dislikeRatio: 0,
          myVoteType:
            place.vote === 'like'
              ? ('LIKE' as const)
              : place.vote === 'dislike'
                ? ('DISLIKE' as const)
                : null,
        }
      : null;

    votePlace(dayIndex, place.id, vote);

    if (!place.serverId) return;

    try {
      if (nextVote) {
        await createOrChangePlaceVote(place.serverId, nextVote === 'like' ? 'LIKE' : 'DISLIKE');
      } else {
        await cancelPlaceVote(place.serverId);
      }

      const summary = await getPlaceVoteSummary(place.serverId);
      setPlaceVoteSummary(dayIndex, place.id, summary);
    } catch (error) {
      if (previousSummary) {
        setPlaceVoteSummary(dayIndex, place.id, previousSummary);
      }
      console.error(error);
    }
  };

  const handleTitleSubmit = (title: string) => {
    const nextTitle = title.trim() || DEFAULT_TRIP_META.title;

    if (nextTitle === DEFAULT_TRIP_META.title) {
      localStorage.removeItem(TRIP_TITLE_STORAGE_KEY);
    } else {
      localStorage.setItem(TRIP_TITLE_STORAGE_KEY, nextTitle);
    }

    setTripMeta((currentMeta) => ({ ...currentMeta, title: nextTitle }));
    setIsTitleEditModalOpen(false);
  };

  return (
    <div className="itinerary-layout">
      <LandingHeader />

      {/* 여행 정보 헤더 */}
      <div className="flex-row-between items-start px-12 pt-[22px]">
        <div>
          <div className="flex-items-center gap-[6px]">
            <h1 className="display-2 text-black">{tripMeta.title}</h1>
            <button
              type="button"
              className="icon-button"
              aria-label="여행 이름 수정"
              onClick={() => setIsTitleEditModalOpen(true)}
            >
              <EditIcon className="text-gray-500" />
            </button>
          </div>
          <div className="body-lg mt-[6px] flex-items-center gap-[5px] text-gray-500">
            <span>{tripMeta.dateRange}</span>
            <span aria-hidden>•</span>
            <span>{tripMeta.memberCount}명</span>
            <span aria-hidden>•</span>
            <span>{tripMeta.budget.toLocaleString()}원</span>
          </div>
        </div>

        {/* 우측 액션 */}
        <div className="flex-items-center gap-[9px]">
          {/* 참여자 아바타 */}
          <ParticipantAvatars participants={participants} />

          <button
            type="button"
            onClick={handleShare}
            className="h-12 flex-items-center cursor-pointer gap-[11px] whitespace-nowrap rounded-[10px] bg-gray-50 px-5 outline outline-gray-300"
          >
            <ShareIcon className="text-primary-500" />
            <span className="heading-2 text-black">공유하기</span>
          </button>

          <button
            type="button"
            className="btn btn--primary btn--md"
            onClick={() => setIsConfirmModalOpen(true)}
          >
            일정확정
          </button>

          <div className="relative">
            <button
              type="button"
              className="icon-button"
              aria-label="더 보기"
              onClick={() => setIsKebabOpen((prev) => !prev)}
            >
              <KebabIcon />
            </button>
            <DraftActionsDropdown
              isOpen={isKebabOpen}
              className="absolute top-12 right-0 z-10 mt-1"
              onDeleteDraft={() => {
                // TODO: 초안 삭제 처리
                setIsKebabOpen(false);
              }}
            />
            {isKebabOpen && (
              <button
                type="button"
                aria-label="메뉴 닫기"
                className="fixed inset-0 z-[-1] cursor-default"
                onClick={() => setIsKebabOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="mt-[22px] h-0.5 bg-gray-100" />

      {/* 메인 레이아웃 */}
      <div className="flex h-[calc(100svh-var(--header-height)-120px)] overflow-hidden pr-5">
        {/* 사이드바 */}
        <aside className="itinerary-sidebar shrink-0 flex-col justify-between overflow-y-auto pt-5">
          <div>
            {days.map((day, i) => (
              <button
                key={day.label}
                type="button"
                className={`day-tab ml-[45px] block w-36 cursor-pointer text-left ${
                  i === activeDay ? 'day-tab--active' : ''
                }`}
                onClick={() => {
                  setActiveDay(i);
                  setSelectedPlaceId(null);
                }}
              >
                <div className="heading-2 text-black">{day.label}</div>
                <div className="body-lg mt-1 text-gray-500">{day.shortDate}</div>
              </button>
            ))}
            <div className="px-[52px] pt-10">
              <button type="button" className="btn btn--secondary btn--md w-32">
                Day 추가
              </button>
            </div>
          </div>
        </aside>

        {/* 수직 구분선 */}
        <div className="w-0.5 shrink-0 bg-gray-100" />

        {/* 콘텐츠 + 지도 */}
        <div className="flex flex-1 overflow-hidden">
          {/* Day 콘텐츠 */}
          <div className="itinerary-content flex-1 overflow-y-auto">
            <div className="mb-6 flex-items-center gap-2.5">
              <h2 className="heading-1 text-black">{currentDay.label}</h2>
              <span className="heading-2 text-gray-500">{currentDay.fullDate}</span>
            </div>

            <DayContent
              day={currentDay}
              dayIndex={activeDay}
              selectedPlaceId={selectedPlaceId}
              editLocks={editLocks}
              dragStates={dragStates}
              onReorder={handleReorder}
              onAddPlace={addPlace}
              onSelectPlace={(place) =>
                setSelectedPlaceId((prevPlaceId) => (prevPlaceId === place.id ? null : place.id))
              }
              onVotePlace={handleVotePlace}
              onDragStart={(placeId) => { if (placeId !== undefined) broadcastDragStart(placeId); }}
              onDragEnd={(placeId) => { if (placeId !== undefined) broadcastDragEnd(placeId); }}

            />
          </div>

          {/* 지도 / 상세 패널 */}
          <div className="w-[568px] shrink-0 overflow-y-auto p-[14px]">
            {selectedPlace ? (
              <PlaceDetailPanel
                place={selectedPlace}
                onClose={() => setSelectedPlaceId(null)}
                onVote={(vote) => handleVotePlace(activeDay, selectedPlace, vote)}
              />
            ) : (
              <TripMap centerQuery={mapCenterQuery} />
            )}
          </div>
        </div>
      </div>

      <TripTitleEditModal
        isOpen={isTitleEditModalOpen}
        initialTitle={tripMeta.title === DEFAULT_TRIP_META.title ? '' : tripMeta.title}
        onCancel={() => setIsTitleEditModalOpen(false)}
        onSubmit={handleTitleSubmit}
      />
    </div>
  );
}
