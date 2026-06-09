import { cn } from '@libs/cn';

/* ── Tag Chip ─────────────────────────────────────────────────
   카테고리 태그 (관광 / 맛집 / 카페 / 액티비티 / 자연)
   pill 형태, 연한 배경 + 컬러 텍스트
──────────────────────────────────────────────────────────────── */
export type TagType = '관광' | '맛집' | '카페' | '액티비티' | '자연';

const tagStyles: Record<TagType, string> = {
  관광: 'bg-blue-50 text-blue-600',
  맛집: 'bg-green-50 text-green-600',
  카페: 'bg-orange-50 text-orange-600',
  액티비티: 'bg-fuchsia-50 text-fuchsia-700',
  자연: 'bg-green-50 text-green-600',
};

type TagChipProps = {
  type: TagType;
  className?: string;
};

export function TagChip({ type, className }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[26px] items-center justify-center rounded-full px-2 text-[12px] font-bold leading-none',
        tagStyles[type],
        className,
      )}
    >
      {type}
    </span>
  );
}

/* ── Badge Chip ───────────────────────────────────────────────
   뱃지 (NEW / HOT / 추천 / 인기)
   둥근 모서리 사각형, 진한 배경 + 흰 텍스트
──────────────────────────────────────────────────────────────── */
export type BadgeType = 'NEW' | 'HOT' | '추천' | '인기';

const badgeStyles: Record<BadgeType, string> = {
  NEW: 'bg-blue-600',
  HOT: 'bg-red-500',
  추천: 'bg-emerald-500',
  인기: 'bg-amber-400',
};

type BadgeChipProps = {
  type: BadgeType;
  className?: string;
};

export function BadgeChip({ type, className }: BadgeChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center justify-center rounded-[6px] px-[6px] text-[12px] font-bold leading-none text-white',
        badgeStyles[type],
        className,
      )}
    >
      {type}
    </span>
  );
}

/* ── Status Chip ──────────────────────────────────────────────
   상태 (확정 / 편집중 / 취소됨)
   pill 형태, 연한 배경 + 컬러 텍스트
──────────────────────────────────────────────────────────────── */
export type StatusType = '확정' | '편집중' | '취소됨';

const statusStyles: Record<StatusType, string> = {
  확정: 'bg-green-50 text-green-600',
  편집중: 'bg-[#FAFAFA] text-[#64748B]',
  취소됨: 'bg-red-50 text-red-500',
};

type StatusChipProps = {
  type: StatusType;
  className?: string;
};

export function StatusChip({ type, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[26px] items-center justify-center rounded-full px-2 text-[12px] font-bold leading-none',
        statusStyles[type],
        className,
      )}
    >
      {type}
    </span>
  );
}
