import { Logo } from '@components/common/logo';
import { useAuthStore } from '@stores/auth-store';
import { useLocation, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const member = useAuthStore((state) => state.member);
  const location = useLocation();

  if (!member) {
    return <LoginGate redirectTo={location.pathname + location.search} />;
  }

  return <Outlet />;
}

function LoginGate({ redirectTo }: { redirectTo: string }) {
  const loginHref = `/login?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <main className="page auth-page">
      <section className="auth-shell login-shell">
        <Logo className="auth-logo" size="large" />
        <h1 className="auth-title text-heading-1 text-muted">로그인이 필요해요</h1>
        <p className="text-body-large text-muted" style={{ marginTop: '10px', textAlign: 'center' }}>
          공유받은 여행 플랜을 확인하려면 로그인해주세요.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '38px' }}>
          <a className="btn btn--primary btn--md auth-submit" href={loginHref}>
            로그인 하기
          </a>
          <a className="btn btn--secondary btn--md auth-submit" href="/signup">
            회원가입
          </a>
        </div>
        <div className="auth-switch text-body-large">
          <a className="auth-switch__link" href="/">
            홈으로 돌아가기
          </a>
        </div>
      </section>
    </main>
  );
}
