import { useState } from 'react';
import { cn } from '@libs/cn';
import { StatusChip } from '@components/common/chips';
import type { StatusType } from '@components/common/chips';
import TriplyLogo from "@assets/icons/triply-logo.svg?react"
import MenuIcon from "@assets/icons/menu.svg?react"
import TicketIcon from "@assets/icons/ticket.svg?react"

type RecentTrip = {
  id: string;
  label: string;
  status: 'EDIT' | 'COMPLETE';
};

const RECENT_TRIPS: RecentTrip[] = [
  { id: '1', label: '이탈리아 여행', status: 'EDIT' },
  { id: '2', label: '일본 여행', status: 'COMPLETE' },
  { id: '3', label: '동남아 여행', status: 'COMPLETE' },
];

const statusChipType: Record<RecentTrip['status'], StatusType> = {
  EDIT: '편집중',
  COMPLETE: '확정',
};

type SidebarMenuProps = {
  label: string;
  status: RecentTrip['status'];
  isActive: boolean;
  onClick: () => void;
};

const SidebarMenuItem = ({ label, status, isActive, onClick }: SidebarMenuProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex-row-between rounded-[10px] px-[15px] py-[12px] transition-colors',
        isActive ? 'bg-gray-100' : 'hover:bg-gray-100',
      )}
    >
      <p>{label}</p>
      <StatusChip type={statusChipType[status]} />
    </button>
  );
};

const Sidebar = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="h-full w-80 bg-white p-[30px] px-[15px]">
      <div className="flex items-center gap-[49px] px-[15px]">
        <MenuIcon/>
        <TriplyLogo/>
      </div>
      <button
        type="button"
        className={'mt-[24px] flex w-full items-center gap-[12px] rounded-[10px] px-[15px] py-[14px] hover:bg-gray-100'}
      >
        <TicketIcon/>
        <p className="text-body-large">새 여행 만들기</p>
      </button>
      <p className="px-[15px] py-[10px] font-[14px] font-bold">최근</p>
      <ul className="flex-col gap-1">
        {RECENT_TRIPS.map((trip) => (
          <li key={trip.id}>
            <SidebarMenuItem
              label={trip.label}
              status={trip.status}
              isActive={activeId === trip.id}
              onClick={() => setActiveId(trip.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;