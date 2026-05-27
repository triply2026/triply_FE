import { X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

export type PlaceDetailEditPlace = {
  name: string;
  description: string;
  category?: string;
  photoUrl?: string;
};

export type PlaceDetailEditValue = {
  expectedDuration: string;
  expectedCost: string;
  reservationUrl: string;
  memo: string;
};

type PlaceDetailEditCardProps = {
  place?: PlaceDetailEditPlace;
  initialValue?: Partial<PlaceDetailEditValue>;
  onClose?: () => void;
  onDelete?: () => void;
  onComplete?: (value: PlaceDetailEditValue) => void;
};

export function PlaceDetailEditCard({
  place,
  initialValue,
  onClose,
  onDelete,
  onComplete,
}: PlaceDetailEditCardProps) {
  const titleId = useId();
  const expectedDurationId = useId();
  const expectedCostId = useId();
  const reservationUrlId = useId();
  const memoId = useId();
  const [expectedDuration, setExpectedDuration] = useState(initialValue?.expectedDuration ?? '');
  const [expectedCost, setExpectedCost] = useState(initialValue?.expectedCost ?? '');
  const [reservationUrl, setReservationUrl] = useState(initialValue?.reservationUrl ?? '');
  const [memo, setMemo] = useState(initialValue?.memo ?? '');

  useEffect(() => {
    setExpectedDuration(initialValue?.expectedDuration ?? '');
    setExpectedCost(initialValue?.expectedCost ?? '');
    setReservationUrl(initialValue?.reservationUrl ?? '');
    setMemo(initialValue?.memo ?? '');
  }, [
    initialValue?.expectedCost,
    initialValue?.expectedDuration,
    initialValue?.memo,
    initialValue?.reservationUrl,
  ]);

  const handleComplete = () => {
    onComplete?.({
      expectedDuration,
      expectedCost,
      reservationUrl,
      memo,
    });
  };

  return (
    <section
      aria-labelledby={titleId}
      className="flex min-h-[669px] w-full max-w-[519px] flex-col rounded-[8px] border border-[#e2e8f0] bg-white px-6 py-6 pr-[30px] text-left"
    >
      <header className="flex items-center justify-between">
        <h2 className="font-bold text-[20px] text-black leading-[1.4]" id={titleId}>
          장소 상세 편집
        </h2>
        <button
          aria-label="장소 상세 편집 닫기"
          className="grid size-8 place-items-center rounded-[8px] bg-transparent text-black hover:bg-[#fbfcfe] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={24} strokeWidth={2} />
        </button>
      </header>

      <div className="mt-[29px] flex gap-5">
        <div
          className="grid h-[84px] w-[102px] shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[#d9d9d9] text-[#64748b]"
          aria-hidden={!place?.photoUrl}
        >
          {place?.photoUrl ? (
            <img
              alt={place.name ? `${place.name} 장소 사진` : '장소 사진'}
              className="size-full object-cover"
              src={place.photoUrl}
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[9px] pt-[5px]">
          <div className="flex min-w-0 items-center gap-2">
            <strong className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[16px] text-black leading-[1.4]">
              {place?.name}
            </strong>
            {place?.category && (
              <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] px-2 py-1 font-medium text-[#2563eb] text-[12px] leading-[1.6]">
                {place.category}
              </span>
            )}
          </div>
          <p className="line-clamp-2 overflow-hidden text-[#475569] text-[16px] leading-[1.6]">
            {place?.description}
          </p>
        </div>
      </div>

      <div className="mt-[26px] flex flex-col gap-[25px]">
        <label className="flex flex-col gap-[9px]" htmlFor={expectedDurationId}>
          <span className="font-medium text-[#1e293b] text-[14px] leading-[1.6]">
            예상 소요시간
          </span>
          <input
            className="h-[52px] w-full rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-[13px] text-[#1e293b] text-[16px] leading-[1.6] outline-0 transition-[border-color,box-shadow] placeholder:text-[#cbd5e1] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.08)]"
            id={expectedDurationId}
            placeholder="예상 소요시간을 입력해주세요"
            type="text"
            value={expectedDuration}
            onChange={(event) => setExpectedDuration(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-[9px]" htmlFor={expectedCostId}>
          <span className="font-medium text-[#1e293b] text-[14px] leading-[1.6]">예상 비용</span>
          <input
            className="h-[52px] w-full rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-[13px] text-[#1e293b] text-[16px] leading-[1.6] outline-0 transition-[border-color,box-shadow] placeholder:text-[#cbd5e1] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.08)]"
            id={expectedCostId}
            placeholder="예상 비용을 입력해주세요"
            type="text"
            value={expectedCost}
            onChange={(event) => setExpectedCost(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-[9px]" htmlFor={reservationUrlId}>
          <span className="font-medium text-[#1e293b] text-[14px] leading-[1.6]">예약 링크</span>
          <input
            className="h-[52px] w-full rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-[13px] text-[#1e293b] text-[16px] leading-[1.6] outline-0 transition-[border-color,box-shadow] placeholder:text-[#cbd5e1] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.08)]"
            id={reservationUrlId}
            placeholder="예약 링크를 입력해주세요"
            type="url"
            value={reservationUrl}
            onChange={(event) => setReservationUrl(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-[9px]" htmlFor={memoId}>
          <span className="font-medium text-[#1e293b] text-[14px] leading-[1.6]">메모(선택)</span>
          <textarea
            className="min-h-[118px] w-full resize-none rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-3.5 text-[#1e293b] text-[16px] leading-[1.6] outline-0 transition-[border-color,box-shadow] placeholder:text-[#cbd5e1] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.08)]"
            id={memoId}
            placeholder="메모 내용이 있을 경우 입력해주세요"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
          />
        </label>
      </div>

      <footer className="mt-auto grid grid-cols-2 gap-5 pt-[30px]">
        <button
          className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#e2e2e2] bg-white font-semibold text-[#64748b] text-[16px] leading-[1.4] transition-colors hover:bg-[#fbfcfe] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
          onClick={onDelete}
          type="button"
        >
          삭제
        </button>
        <button
          className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#2563eb] font-semibold text-[16px] text-white leading-[1.4] transition-colors hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
          onClick={handleComplete}
          type="button"
        >
          완료
        </button>
      </footer>
    </section>
  );
}
