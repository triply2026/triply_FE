import { ApiError, signup } from '@apis/auth';
import { AuthInput } from '@components/auth/auth-input';
import { Logo } from '@components/common/logo';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type FocusedSignupField = 'email' | 'passwordConfirm' | null;

const EMAIL_RULE_MESSAGE = '올바른 이메일 형식으로 입력해 주세요.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULE_MESSAGE = '비밀번호는 8자 이상 입력해 주세요.';
const PASSWORD_MIN_LENGTH = 8;
const NICKNAME_RULE_MESSAGE = '닉네임은 2자 이상 20자 이하로 입력해 주세요.';
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 20;

const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());
const isValidNickname = (nickname: string) => {
  const trimmedNickname = nickname.trim();
  return (
    trimmedNickname.length >= NICKNAME_MIN_LENGTH && trimmedNickname.length <= NICKNAME_MAX_LENGTH
  );
};

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [focusedField, setFocusedField] = useState<FocusedSignupField>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signupTitleId = useId();
  const emailInputId = useId();
  const passwordInputId = useId();
  const passwordConfirmInputId = useId();
  const nicknameInputId = useId();
  const emailEntered = Boolean(email.trim());
  const emailInvalid = emailEntered && !isValidEmail(email);
  const emailAvailable = emailEntered && !emailInvalid;
  const passwordInvalid = Boolean(password) && password.length < PASSWORD_MIN_LENGTH;
  const passwordConfirmInvalid =
    Boolean(passwordConfirm) && passwordConfirm.length < PASSWORD_MIN_LENGTH;
  const passwordMismatch = Boolean(password && passwordConfirm && password !== passwordConfirm);
  const passwordMatched = Boolean(
    password &&
      passwordConfirm &&
      !passwordInvalid &&
      !passwordConfirmInvalid &&
      password === passwordConfirm,
  );
  const showPasswordConfirmSuccess = focusedField === 'passwordConfirm' && passwordMatched;
  const nicknameEntered = Boolean(nickname.trim());
  const nicknameInvalid = nicknameEntered && !isValidNickname(nickname);
  const canSubmit =
    emailAvailable &&
    !passwordInvalid &&
    passwordMatched &&
    nicknameEntered &&
    !nicknameInvalid &&
    !isSubmitting;

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);
    setSubmitErrorMessage('');
  };

  const handleNicknameChange = (nextNickname: string) => {
    setNickname(nextNickname);
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
      await signup({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
      });
      navigate('/signup-complete');
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setSubmitErrorMessage('이미 가입된 이메일이거나 사용 중인 닉네임입니다.');
        return;
      }

      setSubmitErrorMessage(
        error instanceof ApiError
          ? error.message
          : '회원가입에 실패했습니다. 입력 정보를 확인해 주세요.',
      );
    } finally {
      setIsSubmitting(false);
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
            id={emailInputId}
            label="이메일"
            placeholder="이메일을 입력하세요"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => setFocusedField(null)}
            onFocus={() => setFocusedField('email')}
            errorMessage={emailInvalid ? EMAIL_RULE_MESSAGE : undefined}
          />
          <AuthInput
            id={passwordInputId}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            maskCharacter="*"
            value={password}
            onChange={setPassword}
            errorMessage={passwordInvalid ? PASSWORD_RULE_MESSAGE : undefined}
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
            errorMessage={
              passwordConfirmInvalid
                ? PASSWORD_RULE_MESSAGE
                : passwordMismatch
                  ? '비밀번호가 일치하지 않습니다.'
                  : undefined
            }
            successMessage={showPasswordConfirmSuccess ? '비밀번호가 일치합니다.' : undefined}
          />
          <AuthInput
            id={nicknameInputId}
            label="닉네임"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={handleNicknameChange}
            errorMessage={nicknameInvalid ? NICKNAME_RULE_MESSAGE : undefined}
          />
          {submitErrorMessage && (
            <p className="auth-form-message text-error" role="alert">
              {submitErrorMessage}
            </p>
          )}

          <button
            className={`btn ${canSubmit ? 'btn--primary' : 'btn--disabled'} btn--md auth-submit signup-submit`}
            disabled={!canSubmit}
            type="submit"
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
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
