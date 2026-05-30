import menuIcon from '@assets/icons/menu-burger.svg';
import { Logo } from '@components/common/logo';
import { UserProfileMenu } from '@components/landing/user-profile-menu';
import { useAuthStore } from '@stores/auth-store';
import { useUIStore } from '@stores/ui-store';

export function LandingHeader() {
  const { openSidebar } = useUIStore();
  const member = useAuthStore((state) => state.member);

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
          <UserProfileMenu member={member} />
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
