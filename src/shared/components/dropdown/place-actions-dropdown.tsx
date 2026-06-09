import { DropdownMenu } from './dropdown-menu';

type PlaceActionsDropdownProps = {
  isOpen?: boolean;
  className?: string;
  onDeletePlace?: () => void;
};

export function PlaceActionsDropdown({
  isOpen = true,
  className,
  onDeletePlace,
}: PlaceActionsDropdownProps) {
  return (
    <DropdownMenu
      ariaLabel="장소 메뉴"
      className={className}
      isOpen={isOpen}
      items={[
        {
          id: 'delete-place',
          label: '장소 삭제',
          tone: 'danger',
          onSelect: onDeletePlace,
        },
      ]}
    />
  );
}
