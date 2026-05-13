import completeBackground from '@assets/backgrounds/signup-complete-background.svg';
import checkIcon from '@assets/icons/check.svg';
import glitterLeftIcon from '@assets/icons/glitter-left.svg';
import glitterRightIcon from '@assets/icons/glitter-right.svg';
import { useId } from 'react';

export function SignupCompletePage() {
  const titleId = useId();

  return (
    <main className="page signup-complete-page">
      <img
        alt=""
        className="page__background signup-complete-page__background"
        src={completeBackground}
      />

      <section className="signup-complete" aria-labelledby={titleId}>
        <div className="signup-complete__visual" aria-hidden="true">
          <img
            alt=""
            className="signup-complete__glitter signup-complete__glitter--left"
            src={glitterLeftIcon}
          />
          <img alt="" className="signup-complete__check" src={checkIcon} />
          <img
            alt=""
            className="signup-complete__glitter signup-complete__glitter--right"
            src={glitterRightIcon}
          />
        </div>

        <h1 className="signup-complete__title" id={titleId}>
          <span>Triply</span> 가입을 환영합니다!
        </h1>
        <p className="signup-complete__description">
          이제 AI와 함께 여행 일정을 빠르게 만들어보세요
        </p>
        <a className="btn btn--primary btn--md signup-complete__login" href="/login">
          로그인 하기
        </a>
      </section>
    </main>
  );
}
