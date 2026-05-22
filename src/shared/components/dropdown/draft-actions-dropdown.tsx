import { DropdownMenu } from './dropdown-menu';

type DraftActionsDropdownProps = {
  isOpen?: boolean;
  className?: string;
  onDeleteDraft?: () => void;
};

export function DraftActionsDropdown({
  isOpen = true,
  className,
  onDeleteDraft,
}: DraftActionsDropdownProps) {
  return (
    <DropdownMenu
      ariaLabel="일정 초안 메뉴"
      className={className}
      isOpen={isOpen}
      items={[
        {
          id: 'delete-draft',
          label: '초안 삭제',
          tone: 'danger',
          onSelect: onDeleteDraft,
        },
      ]}
    />
  );
}
