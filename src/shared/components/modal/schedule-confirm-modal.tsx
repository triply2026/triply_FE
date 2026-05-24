import { useId } from 'react';

type ScheduleConfirmModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ScheduleConfirmModal({ isOpen, onCancel, onConfirm }: ScheduleConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgb(0_0_0_/_0.2)]"
      role="presentation"
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="flex h-[260px] w-[360px] flex-col items-center gap-[22px] rounded-[25px] bg-white px-[71px] py-10"
        role="dialog"
      >
        <h2
          className="h-[30px] w-[89px] text-center font-bold text-[24px] text-black leading-[1.3]"
          id={titleId}
        >
          일정 확정
        </h2>

        <div className="flex w-[218px] flex-col items-center gap-1 text-center" id={descriptionId}>
          <p className="whitespace-nowrap text-[20px] text-black leading-[1.4]">
            일정을 확정하시겠습니까?
          </p>
          <p className="w-full text-[#ef4444] text-[16px] leading-[1.6]">
            *확정 후에는 편집이 불가능합니다.
          </p>
        </div>

        <div className="flex w-full items-center gap-2.5">
          <button
            className="inline-flex h-12 w-[100px] items-center justify-center rounded-[8px] border border-[#64748b] bg-white p-5 font-semibold text-[#64748b] text-[16px] leading-[1.4] transition-colors hover:bg-[#fbfcfe] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="inline-flex h-12 w-[100px] items-center justify-center rounded-[8px] bg-[#2563eb] p-5 font-semibold text-[16px] text-white leading-[1.4] transition-colors hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
            onClick={onConfirm}
            type="button"
          >
            확정
          </button>
        </div>
      </section>
    </div>
  );
}
