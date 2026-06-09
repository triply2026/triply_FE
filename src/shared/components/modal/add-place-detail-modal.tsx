import { X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

type SelectedPlace = {
  placeId?: string;
  name: string;
  address: string;
  photoUrl?: string;
  rating?: number;
  distanceText?: string;
};

type AddPlaceDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (detail: AddPlaceDetail) => void;
  place?: SelectedPlace;
};

type AddPlaceDetail = {
  place?: SelectedPlace;
  expectedDuration: string;
  expectedCost: string;
  memo: string;
};

export function AddPlaceDetailModal({
  isOpen,
  onClose,
  onComplete,
  place,
}: AddPlaceDetailModalProps) {
  const titleId = useId();
  const expectedDurationId = useId();
  const expectedCostId = useId();
  const memoId = useId();
  const [expectedDuration, setExpectedDuration] = useState('');
  const [expectedCost, setExpectedCost] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (isOpen) {
      setExpectedDuration('');
      setExpectedCost('');
      setMemo('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleComplete = () => {
    onComplete?.({
      place,
      expectedDuration,
      expectedCost,
      memo,
    });
  };

  const handlePrevious = () => {
    // TODO: 장소 추가 step1 모달과 연결
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgb(0_0_0_/_0.2)]"
      role="presentation"
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="min-h-[749px] w-[min(calc(100%_-_40px),519px)] rounded-[8px] border border-[#e2e8f0] bg-white px-6 pt-[29px] pb-[34px] text-left"
        role="dialog"
      >
        <header className="flex items-center justify-between">
          <h2 className="font-bold text-[24px] text-black leading-[1.3]" id={titleId}>
            장소추가
          </h2>
          <button
            aria-label="모달 닫기"
            className="grid size-8 place-items-center rounded-[8px] bg-transparent text-black hover:bg-[#fbfcfe] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={24} strokeWidth={2} />
          </button>
        </header>

        <div className="mt-[25px] flex items-center gap-5">
          <div
            className="grid h-[84px] w-[105px] shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[#d9d9d9] text-[#64748b]"
            aria-hidden={!place?.photoUrl}
          >
            {place?.photoUrl && (
              <img
                alt={place.name ? `${place.name} 장소 사진` : '장소 사진'}
                className="size-full object-cover"
                src={place.photoUrl}
              />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-[7px]">
            <strong className="font-bold text-[20px] text-black leading-[1.2]">
              {place?.name}
            </strong>
            <span className="text-[#64748b] text-[16px] leading-[1.6]">{place?.address}</span>
            {(place?.rating || place?.distanceText) && (
              <span className="flex items-center gap-[9px] text-[#64748b] text-[16px] leading-[1.6]">
                {place?.rating && (
                  <>
                    <span aria-hidden="true">★</span>
                    <span>{place.rating}</span>
                  </>
                )}
                {place?.rating && place?.distanceText && <span aria-hidden="true">•</span>}
                {place?.distanceText && <span>{place.distanceText}</span>}
              </span>
            )}
          </div>
        </div>

        <div className="mt-[31px] flex flex-col gap-[25px]">
          <label className="flex flex-col gap-[9px]" htmlFor={expectedDurationId}>
            <span className="font-medium text-[#1e293b] text-[14px] leading-[1.6]">
              예상 소요시간
            </span>
            <input
              className="h-[52px] w-full rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-[13px] text-[#1e293b] text-[16px] leading-[1.6] outline-0 transition-[border-color,box-shadow] placeholder:text-[#cbd5e1] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.08)]"
              id={expectedDurationId}
              placeholder="시간을 입력해주세요"
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
              placeholder="비용을 입력해주세요"
              type="text"
              value={expectedCost}
              onChange={(event) => setExpectedCost(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-[9px]" htmlFor={memoId}>
            <span className="font-medium text-[#1e293b] text-[14px] leading-[1.6]">메모(선택)</span>
            <textarea
              className="min-h-[192px] w-full resize-none rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-3.5 text-[#1e293b] text-[16px] leading-[1.6] outline-0 transition-[border-color,box-shadow] placeholder:text-[#cbd5e1] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.08)]"
              id={memoId}
              placeholder="메모 내용이 있을 경우 입력해주세요"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
            />
          </label>
        </div>

        <footer className="mt-[31px] grid grid-cols-2 gap-5">
          <button
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#e2e2e2] bg-white font-semibold text-[#64748b] text-[16px] leading-[1.4] transition-colors hover:bg-[#fbfcfe] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
            onClick={handlePrevious}
            type="button"
          >
            이전
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
    </div>
  );
}
