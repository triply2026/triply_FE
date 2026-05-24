import menuIcon from '@assets/icons/menu-burger.svg';
import { Logo } from '@components/common/logo';
import {useUIStore} from '@stores/ui-store';

function useMember() {
  const raw = localStorage.getItem('triplyMember');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: number; email: string; nickname: string };
  } catch {
    return null;
  }
}

export function LandingHeader() {
  const {openSidebar} = useUIStore();
  const member = useMember();

  return (
    <header className="app-header landing-header">
      <div className="landing-header__brand">
        <button className="icon-button landing-header__menu" type="button" aria-label="메뉴 열기" onClick={() => openSidebar()}>
          <img src={menuIcon} width="24" height="24" alt="" />
        </button>
        <Logo />
      </div>

      <nav className="landing-header__nav" aria-label="사용자 메뉴">
        {member ? (
          <div className="landing-header__user">
            <span className="landing-header__nickname text-body">{member.nickname}</span>
            <div className="landing-header__avatar" aria-label={`${member.nickname} 프로필`}>
              {member.nickname.charAt(0)}
            </div>
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
