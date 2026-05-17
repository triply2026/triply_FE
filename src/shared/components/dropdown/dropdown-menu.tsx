import type { ReactNode } from 'react';

export type DropdownMenuItem = {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  onSelect?: () => void;
};

type DropdownMenuProps = {
  items: DropdownMenuItem[];
  isOpen?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function DropdownMenu({
  items,
  isOpen = true,
  className,
  ariaLabel = '드롭다운 메뉴',
}: DropdownMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-label={ariaLabel}
      className={`w-[170px] min-w-[112px] max-w-[280px] rounded-[10px] bg-white shadow-[0_1px_2px_rgb(0_0_0_/_0.3),0_2px_6px_2px_rgb(0_0_0_/_0.15)] ${className ?? ''}`}
      role="menu"
    >
      <div className="flex w-[150px] flex-col items-start">
        {items.map((item) => {
          const itemColor = item.tone === 'danger' ? 'text-[#ef4444]' : 'text-[#1e293b]';

          return (
            <button
              className={`flex h-14 w-full items-center gap-3 px-[15px] py-2 text-left font-semibold text-[16px] leading-[1.4] transition-colors hover:bg-[#fbfcfe] focus-visible:bg-[#fbfcfe] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-40 ${itemColor}`}
              disabled={item.disabled}
              key={item.id}
              onClick={item.onSelect}
              role="menuitem"
              type="button"
            >
              <span className="flex min-w-0 flex-1 flex-col items-start justify-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
