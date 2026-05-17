import { TripMap, type MapMarker } from '@components/trip/google-map';
import { useId, useState } from 'react';
import CheckIcon from "@assets/icons/check-ico.svg?react";
import CancelIcon from "@assets/icons/cancel.svg?react";
import StarIcon from "@assets/icons/star.svg?react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlaceResult = {
  id: string;
  name: string;
  address: string;
  rating: number;
  /** 거리(예: "120m"), 예약필요, 영업마감 등 부가 정보 */
  info: string;
  imageUrl?: string;
  location?: { lat: number; lng: number };
};

type AddPlaceModalProps = {
  /** 검색 결과 목록 (외부에서 주입) */
  results?: PlaceResult[];
  /** 검색 중 로딩 상태 */
  isLoading?: boolean;
  /** 검색어 변경 시 호출 */
  onSearch?: (query: string) => void;
  /** 취소 / X 버튼 */
  onClose: () => void;
  /** 다음 버튼 — 선택된 장소를 인수로 전달 */
  onConfirm: (place: PlaceResult) => void;
};

// ─── PlaceCard ────────────────────────────────────────────────────────────────

function PlaceCard({
  place,
  selected,
  onClick,
}: {
  place: PlaceResult;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-[14px] rounded-[10px] border border-solid p-[18px] text-left transition-colors ${
        selected
          ? 'border-primary-500 bg-gray-100'
          : 'border-[#fbfcfe] bg-white hover:bg-gray-50'
      }`}
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-gray-200">
        {place.imageUrl && (
          <img
            src={place.imageUrl}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="heading-2 truncate text-black">{place.name}</p>
        <p className="body-lg mt-0.5 truncate text-gray-700">{place.address}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="flex items-center gap-[3px] text-gray-500">
            <StarIcon className="text-gray-500"/>
            <span className="body-lg">{place.rating}</span>
          </span>
          <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-gray-500" />
          <span className="body-lg text-gray-500">{place.info}</span>
        </div>
      </div>

      {/* Selected check */}
      {selected && (
        <CheckIcon className="absolute top-[18px] right-[18px] shrink-0 text-primary-500"/>
      )}
    </button>
  );
}

// ─── AddPlaceModal ────────────────────────────────────────────────────────────

export function AddPlaceModal({
  results = SAMPLE_RESULTS,
  isLoading = false,
  onSearch,
  onClose,
  onConfirm,
}: AddPlaceModalProps) {
  const titleId = useId();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPlace = results.find((p) => p.id === selectedId) ?? null;

  const markers: MapMarker[] = results
    .filter((p) => p.location != null)
    .map((p, i) => ({
      lat: p.location!.lat,
      lng: p.location!.lng,
      label: String(i + 1),
    }));

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleConfirm = () => {
    if (selectedPlace) onConfirm(selectedPlace);
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        className="relative flex w-[826px] flex-col rounded-[20px] bg-white"
        style={{ height: 753 }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-10 pt-10">
          <h2 id={titleId} className="display-2 text-black">
            장소 추가
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-button rounded-lg"
            aria-label="모달 닫기"
          >
            <CancelIcon/>
          </button>
        </div>

        {/* ── Search ── */}
        <div className="relative mx-10 mt-6">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="장소를 검색하세요"
            className="input h-[52px] pl-9"
          />
        </div>

        {/* ── Body (list + map) ── */}
        <div className="mt-6 flex flex-1 gap-4 overflow-hidden px-10 pb-4">
          {/* Place list */}
          <div className="flex w-[346px] shrink-0 flex-col gap-0 overflow-y-auto scrollbar-hide">
            {isLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-gray-400">
                <span className="body-lg">검색 중...</span>
              </div>
            ) : results.length === 0 && query.trim() ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <span className="body-lg">검색 결과가 없습니다</span>
              </div>
            ) : (
              results.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  selected={place.id === selectedId}
                  onClick={() =>
                    setSelectedId((prev) => (prev === place.id ? null : place.id))
                  }
                />
              ))
            )}
          </div>

          {/* Map */}
          <TripMap className="h-full flex-1 overflow-hidden rounded-[10px]" markers={markers} />
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-3 px-10 pb-10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn--secondary btn--md w-[180px]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedPlace}
            className="btn btn--primary btn--md w-[180px]"
          >
            다음
          </button>
        </div>
      </section>
    </div>
  );
}

// ─── Sample data (개발/스토리북용) ───────────────────────────────────────────

const SAMPLE_RESULTS: PlaceResult[] = [
  {
    id: '1',
    name: '알랑가 몰라',
    address: 'Piazza della Repubblica',
    rating: 4.3,
    info: '120m',
  },
  {
    id: '2',
    name: '피렌체 카페',
    address: 'Piazza della Repubblica',
    rating: 4.3,
    info: '120m',
  },
  {
    id: '3',
    name: '르네상스 도서관',
    address: 'Via dei Servi',
    rating: 4.7,
    info: '예약필요',
  },
  {
    id: '4',
    name: '산타 마리아 광장',
    address: 'Piazza Santa Maria Novella',
    rating: 4.5,
    info: '120m',
  },
  {
    id: '5',
    name: '우피치 미술관 카페',
    address: 'Piazza degli Uffizi',
    rating: 4.6,
    info: '영업마감',
  },
];
