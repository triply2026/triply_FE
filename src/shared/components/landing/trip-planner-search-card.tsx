import calendarIcon from '@assets/icons/calendar-today.svg';
import groupIcon from '@assets/icons/group.svg';
import locationIcon from '@assets/icons/location.svg';
import walletIcon from '@assets/icons/wallet.svg';
import { DateRangePicker } from '@components/landing/date-range-picker';
import { LoginRequiredModal } from '@components/landing/login-required-modal';
import {useNavigate} from 'react-router-dom';
import { Coffee, Footprints, Landmark, ShoppingBag, TreePalm, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useLayoutEffect, useRef, useState } from 'react';

type TripTheme = {
  icon: ReactNode;
  label: string;
};

type ActiveSearchPanel = 'destination' | 'date' | 'budget' | null;

const tripThemes: TripTheme[] = [
  { label: '맛집 탐방', icon: <Utensils size={22} strokeWidth={2} /> },
  { label: '카페 투어', icon: <Coffee size={22} strokeWidth={2} /> },
  { label: '관광/문화', icon: <Landmark size={22} strokeWidth={2} /> },
  { label: '액티비티', icon: <Footprints size={22} strokeWidth={2} /> },
  { label: '쇼핑', icon: <ShoppingBag size={22} strokeWidth={2} /> },
  { label: '휴양', icon: <TreePalm size={22} strokeWidth={2} /> },
];

export function TripPlannerSearchCard() {
  const [selectedTheme, setSelectedTheme] = useState(tripThemes[0].label);
  const [activePanel, setActivePanel] = useState<ActiveSearchPanel>(null);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelerCount, setTravelerCount] = useState(0);
  const [budget, setBudget] = useState('');
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const destinationInputId = useId();
  const budgetInputId = useId();
  const dateDescription = startDate && endDate ? `${startDate} ~ ${endDate}` : '가는날 ~ 오는날';
  const budgetDescription = budget ? `${Number(budget).toLocaleString()}원` : '예산이 얼마인가요?';
  const navigate = useNavigate();

  const togglePanel = (panel: ActiveSearchPanel) => {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const handleCreateItinerary = () => {
    navigate("/ai-loading")
  };

  return (
    <>
      <section className="surface-card landing-search-card" aria-label="AI 여행 일정 만들기">
        <fieldset className="landing-search-card__chips">
          <legend className="sr-only">여행 취향</legend>
          {tripThemes.map((theme) => (
            <button
              className={`chip chip--animated ${selectedTheme === theme.label ? 'chip--active' : ''}`}
              key={theme.label}
              type="button"
              onClick={() => setSelectedTheme(theme.label)}
            >
              <span className="chip__label">{theme.label}</span>
              <span className="chip__icon" aria-hidden="true">
                {theme.icon}
              </span>
            </button>
          ))}
        </fieldset>

        <div className="landing-search-card__fields">
          {/* TODO: wire these fields to destination/date/budget inputs before calling the itinerary API. */}
          <SearchField
            icon={locationIcon}
            title="여행지"
            description={destination || '어디로 가시나요?'}
            isOpen={activePanel === 'destination'}
            onClick={() => togglePanel('destination')}
          >
            <label className="search-popover__label" htmlFor={destinationInputId}>
              여행지
              <input
                className="search-popover__input"
                id={destinationInputId}
                placeholder="예: 서울, 제주, 부산"
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </label>
          </SearchField>
          <SearchField
            className="landing-search-card__field--with-divider"
            icon={calendarIcon}
            title="일정"
            description={dateDescription}
            isOpen={activePanel === 'date'}
            popoverClassName="search-popover--calendar"
            onClick={() => togglePanel('date')}
          >
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onRangeChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
              }}
            />
          </SearchField>
          <div className="landing-search-card__field landing-search-card__field--with-divider">
            <div className="landing-search-card__field-title">
              <img src={groupIcon} width="24" height="24" alt="" />
              <span className="text-heading-2">예상인원</span>
            </div>
            <fieldset className="traveler-stepper">
              <legend className="sr-only">예상인원</legend>
              <button
                className="stepper-button"
                type="button"
                aria-label="인원 감소"
                disabled={travelerCount === 0}
                onClick={() => setTravelerCount((count) => Math.max(count - 1, 0))}
              >
                -
              </button>
              <span className="traveler-stepper__value text-body-large">{travelerCount}</span>
              <button
                className="stepper-button"
                type="button"
                aria-label="인원 추가"
                onClick={() => setTravelerCount((count) => Math.min(count + 1, 99))}
              >
                +
              </button>
            </fieldset>
          </div>
          <SearchField
            className="landing-search-card__field--with-divider"
            icon={walletIcon}
            title="총 예산"
            description={budgetDescription}
            isOpen={activePanel === 'budget'}
            onClick={() => togglePanel('budget')}
          >
            <label className="search-popover__label" htmlFor={budgetInputId}>
              총 예산
            </label>
            <div className="search-popover__budget-row">
              <input
                className="search-popover__input"
                id={budgetInputId}
                min="0"
                placeholder="예: 500000"
                type="number"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              />
              <span className="search-popover__unit">원</span>
            </div>
            <fieldset className="search-popover__quick-actions">
              <legend className="sr-only">빠른 예산 선택</legend>
              {[300000, 500000, 1000000].map((amount) => (
                <button
                  className="search-popover__quick-button"
                  key={amount}
                  type="button"
                  onClick={() => setBudget(String(amount))}
                >
                  {amount / 10000}만
                </button>
              ))}
            </fieldset>
          </SearchField>

          <button
            className="btn btn--primary btn--xl landing-search-card__cta"
            type="button"
            onClick={handleCreateItinerary}
          >
            AI 일정 만들기
          </button>
        </div>
      </section>
      {isLoginRequiredModalOpen && (
        <LoginRequiredModal onClose={() => setIsLoginRequiredModalOpen(false)} />
      )}
    </>
  );
}

type SearchFieldProps = {
  icon: string;
  title: string;
  description: string;
  className?: string;
  popoverClassName?: string;
  children: ReactNode;
  isOpen: boolean;
  onClick: () => void;
};

function SearchField({
  icon,
  title,
  description,
  className = '',
  popoverClassName = '',
  children,
  isOpen,
  onClick,
}: SearchFieldProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !popoverRef.current) return;
    const el = popoverRef.current;
    const parent = el.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();

    // fixed 포지션으로 뷰포트 기준 배치
    el.style.position = 'fixed';
    el.style.top = `${parentRect.bottom + 8}px`;
    el.style.left = `${parentRect.left}px`;

    // 우측 화면 밖으로 넘칠 경우 보정
    const rect = el.getBoundingClientRect();
    const hOverflow = rect.right - (window.innerWidth - 16);
    if (hOverflow > 0) {
      el.style.left = `${parentRect.left - hOverflow}px`;
    }

    // 하단 화면 밖으로 넘칠 경우 위치 조정
    const rect2 = el.getBoundingClientRect();
    if (rect2.bottom > window.innerHeight - 16) {
      el.style.top = `${Math.max(16, window.innerHeight - rect2.height - 16)}px`;
    }
  }, [isOpen]);

  return (
    <div className={`landing-search-card__field-wrap ${className}`}>
      <button
        className={`landing-search-card__field ${isOpen ? 'landing-search-card__field--active' : ''}`}
        type="button"
        onClick={onClick}
      >
        <span className="landing-search-card__field-title">
          <img src={icon} width="24" height="24" alt="" />
          <span className="text-heading-2">{title}</span>
        </span>
        <span className="landing-search-card__field-description text-body-large">
          {description}
        </span>
      </button>
      {isOpen && (
        <div ref={popoverRef} className={`search-popover ${popoverClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}
