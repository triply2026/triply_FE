import {
  type GenerateItineraryRequest,
  generateItinerary,
  ItineraryApiError,
} from '@apis/itinerary';
import loadingBackground from '@assets/backgrounds/loading-background.svg';
import CheckIcon from '@assets/icons/check-ico.svg?react';
import LoadingSpinner from '@assets/icons/loading.svg?react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAVIGATE_MS = 2_000;
const MESSAGE_INTERVAL_MS = 1_500; // 테스트용 (실서비스: 3_000~4_000 권장)

const LOADING_MESSAGES = [
  '여행지 정보를 분석하고 있어요',
  '최적의 동선을 계산하고 있어요',
  '맛집과 관광지를 선별하고 있어요',
  '예산에 맞는 일정을 조율하고 있어요',
  '완벽한 여행을 마무리하고 있어요',
];

// 모든 메시지가 한 번씩 순환되면 완료
const LOADING_MS = LOADING_MESSAGES.length * MESSAGE_INTERVAL_MS;

type AiLoadingLocationState = {
  requestBody?: GenerateItineraryRequest;
};

const AiLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDone, setIsDone] = useState(false);
  const [generatedPlanId, setGeneratedPlanId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);
  const requestBody = (location.state as AiLoadingLocationState | null)?.requestBody;

  // 1단계: 랜딩에서 넘겨받은 조건으로 AI 일정 생성 요청
  useEffect(() => {
    if (!requestBody) {
      navigate('/', { replace: true });
      return;
    }

    let isCancelled = false;
    let completeTimer: number | undefined;
    const abortController = new AbortController();
    const startedAt = Date.now();

    const requestItinerary = async () => {
      try {
        const generatedItinerary = await generateItinerary(requestBody, abortController.signal);
        const elapsedMs = Date.now() - startedAt;
        const remainingMs = Math.max(0, LOADING_MS - elapsedMs);

        completeTimer = window.setTimeout(() => {
          if (isCancelled) return;

          localStorage.setItem('triplyGeneratedItinerary', JSON.stringify(generatedItinerary));
          localStorage.setItem('triplyItineraryRequest', JSON.stringify(requestBody));
          localStorage.removeItem('triplyTripTitle');
          setGeneratedPlanId(generatedItinerary.planId);
          setIsDone(true);
        }, remainingMs);
      } catch (error) {
        if (isCancelled) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;

        setMessageVisible(true);
        setErrorMessage(
          error instanceof ItineraryApiError
            ? error.message
            : 'AI 일정 생성에 실패했습니다. 입력 정보를 확인한 뒤 다시 시도해 주세요.',
        );
      }
    };

    requestItinerary();

    return () => {
      isCancelled = true;
      abortController.abort();

      if (completeTimer) {
        window.clearTimeout(completeTimer);
      }
    };
  }, [navigate, requestBody]);

  // 2단계: 완료 상태가 되면 NAVIGATE_MS 뒤 페이지 이동
  useEffect(() => {
    if (!isDone || generatedPlanId === null) return;

    const timer = setTimeout(
      () => navigate(`/trip/${generatedPlanId}`, { replace: true }),
      NAVIGATE_MS,
    );
    return () => clearTimeout(timer);
  }, [generatedPlanId, isDone, navigate]);

  // 서브 문구 순환 — 페이드아웃 → 메시지 교체 → 페이드인
  useEffect(() => {
    if (isDone || errorMessage) return;

    const interval = setInterval(() => {
      setMessageVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setMessageVisible(true);
      }, 200);
    }, MESSAGE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [errorMessage, isDone]);

  return (
    <main className="landing-shell">
      <img
        className="page__background landing-shell__background"
        src={loadingBackground}
        alt="로딩 이미지"
      />
      <section className="landing-hero flex-col-center gap-2 pt-4">
        <LoadingSpinner className="w-800" />
        <div className="flex-col gap-3 text-center">
          <p className="font-bold text-3xl text-gray-800">AI가 여행 일정을 만들고 있어요</p>
          <p
            className={`font-semibold text-display-3 text-gray-500 transition-opacity duration-400 ${
              messageVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {errorMessage || LOADING_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* 완료 알림 — isDone 시 페이드인 + 슬라이드업 */}
        <div
          className={`mt-2 flex items-center gap-2 rounded-lg border border-success bg-[#f3fef2] px-5 py-3 transition-all duration-500 ease-out ${
            isDone ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
          }`}
        >
          <CheckIcon className="h-5 w-5 shrink-0 text-success" />
          <p className="heading-2 text-success">초안 생성완료</p>
        </div>

        {errorMessage && (
          <button
            type="button"
            className="btn btn--secondary btn--md mt-2"
            onClick={() => navigate('/')}
          >
            다시 입력하기
          </button>
        )}
      </section>
    </main>
  );
};

export default AiLoading;
