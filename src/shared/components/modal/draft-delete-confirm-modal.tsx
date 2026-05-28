import { useId } from 'react';

type DraftDeleteConfirmModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

export function DraftDeleteConfirmModal({
  isOpen,
  onCancel,
  onDelete,
}: DraftDeleteConfirmModalProps) {
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
        className="flex w-[360px] flex-col items-center gap-[22px] rounded-[25px] bg-white px-[71px] py-10"
        role="dialog"
      >
        <h2 className="text-center font-bold text-[24px] text-black leading-[1.3]" id={titleId}>
          일정 삭제
        </h2>

        <p
          className="whitespace-nowrap text-center text-[20px] text-black leading-[1.4]"
          id={descriptionId}
        >
          이 일정을 삭제하시겠습니까?
        </p>

        <div className="flex items-center gap-2.5">
          <button
            className="inline-flex h-12 w-[100px] items-center justify-center rounded-[8px] border border-[#64748b] bg-white p-5 font-semibold text-[#64748b] text-[16px] leading-[1.4] transition-colors hover:bg-[#fbfcfe] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="inline-flex h-12 w-[100px] items-center justify-center rounded-[8px] bg-[#ef4444] p-5 font-semibold text-[16px] text-white leading-[1.4] transition-colors hover:bg-[#dc2626] focus-visible:outline-2 focus-visible:outline-[#ef4444] focus-visible:outline-offset-2"
            onClick={onDelete}
            type="button"
          >
            삭제
          </button>
        </div>
      </section>
    </div>
  );
}
