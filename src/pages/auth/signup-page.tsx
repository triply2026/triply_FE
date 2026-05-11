import { AuthInput } from '@components/auth/auth-input';
import { Logo } from '@components/common/logo';
import { useId, useState } from 'react';

type FocusedSignupField = 'userId' | 'passwordConfirm' | null;

const USER_ID_RULE_MESSAGE = '영문, 숫자를 조합하여 6~12자로 입력해 주세요.';
const USER_ID_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;

const isValidUserId = (userId: string) => USER_ID_PATTERN.test(userId.trim());

const checkUserIdDuplicated = (userId: string) => {
  // TODO: replace this mock with the backend duplicate-check API.
  return userId.trim().toLowerCase() === 'triply';
};

export function SignupPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [focusedField, setFocusedField] = useState<FocusedSignupField>(null);
  const signupTitleId = useId();
  const userIdInputId = useId();
  const passwordInputId = useId();
  const passwordConfirmInputId = useId();
  const nicknameInputId = useId();
  const userIdEntered = Boolean(userId.trim());
  const userIdInvalid = userIdEntered && !isValidUserId(userId);
  const userIdDuplicated = userIdEntered && !userIdInvalid && checkUserIdDuplicated(userId);
  const userIdAvailable = userIdEntered && !userIdInvalid && !userIdDuplicated;
  const showUserIdSuccess = focusedField === 'userId' && userIdAvailable;
  const passwordMismatch = Boolean(password && passwordConfirm && password !== passwordConfirm);
  const passwordMatched = Boolean(password && passwordConfirm && password === passwordConfirm);
  const showPasswordConfirmSuccess = focusedField === 'passwordConfirm' && passwordMatched;
  const canSubmit = userIdAvailable && passwordMatched && Boolean(nickname.trim());

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canSubmit) {
      // TODO: call the signup API, persist auth/session state, then navigate on success.
      window.location.href = '/signup-complete';
    }
  };

  return (
    <main className="page auth-page">
      <section className="auth-shell signup-shell" aria-labelledby={signupTitleId}>
        <Logo className="auth-logo" size="large" />
        <h1 className="sr-only" id={signupTitleId}>
          Triply 회원가입
        </h1>

        <form className="auth-form signup-form" onSubmit={handleSubmit}>
          <AuthInput
            id={userIdInputId}
            label="아이디"
            placeholder="아이디를 입력하세요"
            value={userId}
            onChange={setUserId}
            onBlur={() => setFocusedField(null)}
            onFocus={() => setFocusedField('userId')}
            errorMessage={
              userIdInvalid
                ? USER_ID_RULE_MESSAGE
                : userIdDuplicated
                  ? '이미 존재하는 아이디 입니다.'
                  : undefined
            }
            successMessage={showUserIdSuccess ? '사용 가능한 아이디입니다.' : undefined}
          />
          <AuthInput
            id={passwordInputId}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            maskCharacter="*"
            value={password}
            onChange={setPassword}
          />
          <AuthInput
            id={passwordConfirmInputId}
            label="비밀번호 확인"
            placeholder="비밀번호를 입력하세요"
            maskCharacter="*"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            onBlur={() => setFocusedField(null)}
            onFocus={() => setFocusedField('passwordConfirm')}
            errorMessage={passwordMismatch ? '비밀번호가 일치하지 않습니다.' : undefined}
            successMessage={showPasswordConfirmSuccess ? '비밀번호가 일치합니다.' : undefined}
          />
          <AuthInput
            id={nicknameInputId}
            label="닉네임"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={setNickname}
          />

          <button
            className={`btn ${canSubmit ? 'btn--primary' : 'btn--disabled'} btn--md auth-submit signup-submit`}
            disabled={!canSubmit}
            type="submit"
          >
            회원가입
          </button>
        </form>

        <div className="auth-switch text-body-large">
          <p className="text-muted">이미 계정이 있으신가요?</p>
          <a className="auth-switch__link" href="/login">
            로그인
          </a>
        </div>
      </section>
    </main>
  );
}
