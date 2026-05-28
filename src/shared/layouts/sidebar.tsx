import { useState } from 'react';
import { cn } from '@libs/cn';
import { StatusChip } from '@components/common/chips';
import { useQuery } from '@tanstack/react-query';
import { getMyPlans } from '@apis/plan';
import type { StatusType } from '@components/common/chips';
import TriplyLogo from '@assets/icons/triply-logo.svg?react';
import MenuIcon from '@assets/icons/menu.svg?react';
import TicketIcon from '@assets/icons/ticket.svg?react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@stores/ui-store';

type RecentTrip = {
  id: string;
  label: string;
  status: 'DRAFT' | 'CONFIRMED';
};

const statusChipType: Record<RecentTrip['status'], StatusType> = {
  DRAFT: '편집중',
  CONFIRMED: '확정',
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
  const [activeId, setActiveId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { closeSidebar } = useUIStore();

  const { data: menuList } = useQuery({
    queryKey: ['planList'],
    queryFn: () => getMyPlans(),
  });

  const handleMenuClick = (planId: number) => {
    setActiveId(planId);
    closeSidebar();
    navigate(`/trip/${planId}`);
  };

  return (
    <div className="flex h-full w-80 flex-col bg-white p-[30px] px-[15px]">
      <div className="flex items-center gap-[49px] px-[15px]">
        <MenuIcon />
        <TriplyLogo />
      </div>
      <button
        type="button"
        className="mt-[24px] flex w-full items-center gap-[12px] rounded-[10px] px-[15px] py-[14px] hover:bg-gray-100"
        onClick={() => {
          navigate('/');
          closeSidebar();
        }}
      >
        <TicketIcon />
        <p className="text-body-large">새 여행 만들기</p>
      </button>
      <p className="px-[15px] py-[10px] font-[14px] font-bold">최근</p>
      <ul className="flex-col gap-1">
        {menuList?.map((menu) => (
          <li key={menu.planId}>
            <SidebarMenuItem
              label={menu.title}
              status={menu.status}
              isActive={activeId === menu.planId}
              onClick={() => handleMenuClick(menu.planId)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
