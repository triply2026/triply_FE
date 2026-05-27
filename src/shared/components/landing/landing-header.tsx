import menuIcon from '@assets/icons/menu-burger.svg';
import { Logo } from '@components/common/logo';
import { useAuthStore } from '@stores/auth-store';
import { useUIStore } from '@stores/ui-store';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LandingHeader() {
  const { openSidebar } = useUIStore();
  const { member, logout } = useAuthStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header landing-header">
      <div className="landing-header__brand">
        <button
          className="icon-button landing-header__menu"
          type="button"
          aria-label="메뉴 열기"
          onClick={() => openSidebar()}
        >
          <img src={menuIcon} width="24" height="24" alt="" />
        </button>
        <Logo />
      </div>

      <nav className="landing-header__nav" aria-label="사용자 메뉴">
        {member ? (
          <div ref={popoverRef} className="landing-header__user" style={{ position: 'relative' }}>
            <span className="landing-header__nickname text-body">{member.nickname}</span>
            <button
              type="button"
              aria-label={`${member.nickname} 프로필`}
              className="landing-header__avatar"
              onClick={() => setOpen((prev) => !prev)}
            >
              {member.nickname.charAt(0).toUpperCase()}
            </button>

            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '140px',
                  background: '#fff',
                  border: '1px solid #f3f4f6',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px 6px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{member.nickname}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{member.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2';
                    (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'none';
                    (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
                  }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <a className="landing-header__login text-body" href="/login">
              로그인
            </a>
            <a className="btn btn--primary btn--sm" href="/signup">
              회원가입
            </a>
          </>
        )}
      </nav>
    </header>
  );
}
