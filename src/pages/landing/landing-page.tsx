import landingBackground from '@assets/backgrounds/landing-background.svg';
import { LandingHeader } from '@components/landing/landing-header';
import { TripPlannerSearchCard } from '@components/landing/trip-planner-search-card';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

type LandingLocationState = {
  successMessage?: string;
};

export function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = (location.state as LandingLocationState | null)?.successMessage;
  const hasShownSuccessToastRef = useRef(false);

  useEffect(() => {
    if (!successMessage || hasShownSuccessToastRef.current) return;

    hasShownSuccessToastRef.current = true;
    toast.success(successMessage);
    navigate('.', { replace: true, state: null });
  }, [navigate, successMessage]);

  return (
    <main className="landing-shell">
      <img className="page__background landing-shell__background" src={landingBackground} alt="" />
      <LandingHeader />

      <section className="landing-hero">
        <h1 className="landing-hero__title text-hero">
          우리만의 여행을 <span className="text-primary">함께 계획</span>해요
        </h1>
        <p className="landing-hero__description text-heading-2 text-muted">
          AI가 일정 초안을 만들어주고, 친구들과 실시간으로 함께 완성하는 여행 플래너
        </p>
        <TripPlannerSearchCard />
      </section>
    </main>
  );
}
