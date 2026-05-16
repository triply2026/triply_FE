import { ApiError, login } from '@apis/auth';
import { AuthInput } from '@components/auth/auth-input';
import { Logo } from '@components/common/logo';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EMAIL_RULE_MESSAGE = '올바른 이메일 형식으로 입력해 주세요.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginTitleId = useId();
  const emailInputId = useId();
  const passwordInputId = useId();
  const emailEntered = Boolean(email.trim());
  const emailInvalid = emailEntered && !isValidEmail(email);
  const canSubmit = emailEntered && !emailInvalid && Boolean(password) && !isSubmitting;

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);
    setSubmitErrorMessage('');
  };

  const handlePasswordChange = (nextPassword: string) => {
    setPassword(nextPassword);
    setSubmitErrorMessage('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitErrorMessage('');
    setIsSubmitting(true);

    try {
      const memberInfo = await login({
        email: email.trim(),
        password,
      });
      localStorage.setItem('triplyMember', JSON.stringify(memberInfo));
      navigate('/');
    } catch (error) {
      setSubmitErrorMessage(
        error instanceof ApiError ? error.message : '이메일 또는 비밀번호를 확인해 주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="auth-shell login-shell" aria-labelledby={loginTitleId}>
        <Logo className="auth-logo" size="large" />
        <h1 className="auth-title text-heading-1 text-muted" id={loginTitleId}>
          Triply에 오신 것을 환영해요
        </h1>

        <form className="auth-form login-form" onSubmit={handleSubmit}>
          <AuthInput
            id={emailInputId}
            label="이메일"
            placeholder="이메일을 입력하세요"
            type="email"
            value={email}
            onChange={handleEmailChange}
            errorMessage={emailInvalid ? EMAIL_RULE_MESSAGE : undefined}
          />
          <AuthInput
            id={passwordInputId}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            maskCharacter="*"
            value={password}
            onChange={handlePasswordChange}
          />
          {submitErrorMessage && (
            <p className="auth-form-message text-error" role="alert">
              {submitErrorMessage}
            </p>
          )}

          <button
            className={`btn ${canSubmit ? 'btn--primary' : 'btn--disabled'} btn--md auth-submit`}
            disabled={!canSubmit}
            type="submit"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
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
