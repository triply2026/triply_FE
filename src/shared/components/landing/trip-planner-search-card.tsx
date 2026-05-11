import calendarIcon from '@assets/icons/calendar-today.svg';
import groupIcon from '@assets/icons/group.svg';
import locationIcon from '@assets/icons/location.svg';
import walletIcon from '@assets/icons/wallet.svg';
import { LoginRequiredModal } from '@components/landing/login-required-modal';
import { Coffee, Footprints, Landmark, ShoppingBag, TreePalm, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useState } from 'react';

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
  const startDateInputId = useId();
  const endDateInputId = useId();
  const budgetInputId = useId();
  const dateDescription = startDate && endDate ? `${startDate} ~ ${endDate}` : '가는날 ~ 오는날';
  const budgetDescription = budget ? `${Number(budget).toLocaleString()}원` : '예산이 얼마인가요?';

  const togglePanel = (panel: ActiveSearchPanel) => {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const handleCreateItinerary = () => {
    // TODO: replace this mock with the real auth state from the auth store.
    const isAuthenticated = false;

    if (!isAuthenticated) {
      setIsLoginRequiredModalOpen(true);
    }
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
            title="출발일"
            description={dateDescription}
            isOpen={activePanel === 'date'}
            onClick={() => togglePanel('date')}
          >
            <div className="search-popover__date-grid">
              <label className="search-popover__label" htmlFor={startDateInputId}>
                가는날
                <input
                  className="search-popover__input"
                  id={startDateInputId}
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="search-popover__label" htmlFor={endDateInputId}>
                오는날
                <input
                  className="search-popover__input"
                  id={endDateInputId}
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
            </div>
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
  children: ReactNode;
  isOpen: boolean;
  onClick: () => void;
};

function SearchField({
  icon,
  title,
  description,
  className = '',
  children,
  isOpen,
  onClick,
}: SearchFieldProps) {
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
      {isOpen && <div className="search-popover">{children}</div>}
    </div>
  );
}
