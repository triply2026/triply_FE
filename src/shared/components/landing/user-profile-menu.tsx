import { useAuthStore } from '@stores/auth-store';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UserProfileMenuProps = {
  member: {
    email: string;
    nickname: string;
  };
};

export function UserProfileMenu({ member }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsOpen(false);
    await logout(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="user-profile-menu">
      <span className="landing-header__nickname text-body">{member.nickname}</span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${member.nickname} 프로필 메뉴`}
        className="landing-header__avatar"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {member.nickname.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="user-profile-menu__dropdown" role="menu">
          <div className="user-profile-menu__info">
            <p className="user-profile-menu__nickname">{member.nickname}</p>
            <p className="user-profile-menu__email">{member.email}</p>
          </div>
          <button
            type="button"
            className="user-profile-menu__logout"
            disabled={isLoggingOut}
            role="menuitem"
            onClick={handleLogout}
          >
            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      )}
    </div>
  );
}
