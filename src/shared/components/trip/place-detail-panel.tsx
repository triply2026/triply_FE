import CancelIcon from '@assets/icons/cancel.svg?react';
import WalletIcon from '@assets/icons/wallet.svg?react';
import WebIcon from '@assets/icons/web.svg?react';
import { TripMap } from '@components/trip/google-map';
import type { Category, PlaceItem, PlaceVote } from '@stores/trip-store';
import { Clock } from 'lucide-react';

// ─── CategoryBadge (trip-edit과 동일 스펙) ────────────────────────────────────

const CATEGORY_CLASSES: Record<Category, string> = {
  관광: 'bg-[#eff6ff] text-primary-500',
  맛집: 'bg-[#f0fdf4] text-[#16a34a]',
  카페: 'bg-[#fff7ed] text-[#ea580c]',
  쇼핑: 'bg-[#fdf2f8] text-[#db2777]',
  숙소: 'bg-[#fef3c7] text-[#d97706]',
  교통: 'bg-[#f3f4f6] text-[#374151]',
  기타: 'bg-[#f3f4f6] text-[#374151]',
};

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex h-[26px] shrink-0 items-center whitespace-nowrap rounded-[13px] px-2 pt-1 pb-[3px] font-bold text-body-sm leading-[1.6] ${CATEGORY_CLASSES[category]}`}
    >
      {category}
    </span>
  );
}

// ─── ReactionButton ───────────────────────────────────────────────────────────

function ReactionButton({
  emoji,
  count,
  label,
  isSelected = false,
  flipped = false,
  onClick,
}: {
  emoji: string;
  count: number;
  label: string;
  isSelected?: boolean;
  flipped?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      onClick={onClick}
      className={`h-[48px] cursor-pointer gap-2 rounded-[5px] border border-solid px-3 transition-colors ${
        isSelected ? 'border-primary-500 bg-primary-100 text-primary-500' : 'border-[#E2E8F0]'
      }`}
    >
      <span className={`text-[16px] ${flipped ? '-scale-y-100 inline-block' : ''}`}>{emoji}</span>
      <span className={`heading-1 ${isSelected ? 'text-primary-500' : 'text-black'}`}>{count}</span>
    </button>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  valueClassName = 'text-gray-500',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="flex w-[130px] shrink-0 items-center gap-[10px] text-gray-500">
        {icon}
        <span className="body-lg">{label}</span>
      </div>
      <span className={`body-lg ${valueClassName}`}>{value}</span>
    </div>
  );
}

// ─── PlaceDetailPanel ─────────────────────────────────────────────────────────

export type PlaceDetailPanelProps = {
  place: PlaceItem;
  onClose: () => void;
  onEdit?: () => void;
  onVote?: (vote: PlaceVote) => void;
};

export function PlaceDetailPanel({ place, onClose, onEdit, onVote }: PlaceDetailPanelProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[8px] border border-gray-200 border-solid bg-white pb-5">
      {/* ── 지도 (상단 축소) ── */}
      <div className="relative shrink-0">
        <TripMap
          className="h-60 w-full overflow-hidden rounded-t-[8px]"
          centerQuery={place.address ?? place.name}
          zoom={15}
        />
        <button
          type="button"
          onClick={onClose}
          className="icon-button absolute top-3 right-3 rounded-md bg-white/80 backdrop-blur-sm"
          aria-label="상세 닫기"
        >
          <CancelIcon />
        </button>
      </div>

      {/* ── 상세 정보 ── */}
      <div className="scrollbar-hide flex flex-1 flex-col gap-[29px] overflow-y-auto p-6">
        {/* 내용 영역 */}
        <div className="flex flex-col gap-[21px]">
          {/* 이름 + 카테고리 + 설명 */}
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center gap-2">
              <h3 className="heading-1 text-black">{place.name}</h3>
              <CategoryBadge category={place.category} />
            </div>
            <p className="body-lg text-gray-700">{place.description}</p>
          </div>

          {/* 상세 정보 rows */}
          <div className="flex flex-col gap-[6px]">
            <InfoRow
              icon={<Clock size={20} className="shrink-0 text-gray-500" />}
              label="예상 소요시간"
              value={place.duration}
            />
            <InfoRow
              icon={<WalletIcon className="h-5 w-5 shrink-0 text-gray-500" />}
              label="예상 비용"
              value={place.price}
            />
            {place.reservationUrl && (
              <div className="flex items-center gap-6">
                <div className="flex w-[130px] shrink-0 items-center gap-[10px] text-gray-500">
                  {/* globe icon */}
                  <WebIcon className="h-5 w-5 text-gray-500" />
                  <span className="body-lg text-gray-500">예약 링크</span>
                </div>
                <a
                  href={place.reservationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="body-lg truncate underline-offset-2 hover:underline"
                  style={{ color: 'var(--color-primary-500)' }}
                >
                  {place.reservationUrl}
                </a>
              </div>
            )}
          </div>

          {/* 메모 */}
          <div className="min-h-[92px] rounded-[5px] bg-[#f8f8f8] px-[17px] py-3">
            <p className="body-lg text-gray-500">{place.memo ?? '등록된 메모가 없습니다.'}</p>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="flex items-center gap-[10px]">
          <button type="button" onClick={onEdit} className="btn btn--primary btn--md flex-1">
            일정 편집
          </button>
          <ReactionButton
            emoji="👍"
            count={place.likes}
            label={`${place.name} 좋아요`}
            isSelected={place.vote === 'like'}
            onClick={() => onVote?.('like')}
          />
          <ReactionButton
            emoji="👎"
            count={place.dislikes}
            label={`${place.name} 싫어요`}
            isSelected={place.vote === 'dislike'}
            onClick={() => onVote?.('dislike')}
          />
        </div>
      </div>
    </div>
  );
}
