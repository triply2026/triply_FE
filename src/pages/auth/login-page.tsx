import { AuthInput } from '@components/auth/auth-input';
import { Logo } from '@components/common/logo';
import { useId, useState } from 'react';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const loginTitleId = useId();
  const userIdInputId = useId();
  const passwordInputId = useId();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: call the login API, store the issued token/session, then redirect to the planned route.
  };

  return (
    <main className="page auth-page">
      <section className="auth-shell login-shell" aria-labelledby={loginTitleId}>
        <Logo className="auth-logo" size="large" />
        <h1 className="auth-title text-heading-1 text-muted" id={loginTitleId}>
          Triply에 오신 것을 환영해요
        </h1>

        <form className="auth-form login-form" onSubmit={handleSubmit}>
          <AuthInput id={userIdInputId} label="아이디" placeholder="아이디를 입력하세요" />
          <AuthInput
            id={passwordInputId}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            maskCharacter="*"
            value={password}
            onChange={setPassword}
          />
          <button className="btn btn--primary btn--md auth-submit" type="submit">
            로그인
          </button>
        </form>

        <div className="auth-switch text-body-large">
          <p className="text-muted">아직 회원이 아니신가요?</p>
          <a className="auth-switch__link" href="/signup">
            회원가입
          </a>
        </div>
      </section>
    </main>
  );
}
