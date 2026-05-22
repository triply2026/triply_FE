import { useEffect, useId, useState } from 'react';

type TripTitleEditModalProps = {
  isOpen: boolean;
  initialTitle?: string;
  onCancel: () => void;
  onSubmit: (title: string) => void;
};

export function TripTitleEditModal({
  isOpen,
  initialTitle,
  onCancel,
  onSubmit,
}: TripTitleEditModalProps) {
  const titleId = useId();
  const inputId = useId();
  const [title, setTitle] = useState(initialTitle ?? '');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle ?? '');
    }
  }, [initialTitle, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit(title);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgb(0_0_0_/_0.2)]"
      role="presentation"
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="flex h-[254px] w-[360px] flex-col items-center rounded-[25px] bg-white px-[34px] pt-[40px]"
        role="dialog"
      >
        <h2 className="font-bold text-[24px] text-black leading-[1.3]" id={titleId}>
          이름 변경
        </h2>

        <input
          className="mt-[22px] h-[52px] w-full rounded-[8px] border border-[#cbd5e1] bg-white px-3 text-[#334155] text-[16px] leading-[1.6] outline-0 transition-[border-color,box-shadow] placeholder:text-[#cbd5e1] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.08)]"
          id={inputId}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="mt-[22px] flex items-center gap-2.5">
          <button
            className="inline-flex h-12 w-[100px] items-center justify-center rounded-[8px] border border-[#64748b] bg-white p-5 font-semibold text-[#64748b] text-[16px] leading-[1.4] transition-colors hover:bg-[#fbfcfe] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="inline-flex h-12 w-[100px] items-center justify-center rounded-[8px] bg-[#2563eb] p-5 font-semibold text-[16px] text-white leading-[1.4] transition-colors hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2"
            onClick={handleSubmit}
            type="button"
          >
            수정
          </button>
        </div>
      </section>
    </div>
  );
}
