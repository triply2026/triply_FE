import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type Props = {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function getTodayStr(): string {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

/** 오른쪽 패널 = 왼쪽 + 1달 */
function nextMonthOf(year: number, month: number): { year: number; month: number } {
  return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
}

type CalendarPanelProps = {
  year: number;
  month: number;
  todayStr: string;
  rangeStart: string;
  rangeEnd: string;
  selecting: 'start' | 'end';
  onDayClick: (dateStr: string) => void;
  onDayHover: (dateStr: string) => void;
  onDayLeave: () => void;
};

function CalendarPanel({
  year,
  month,
  todayStr,
  rangeStart,
  rangeEnd,
  selecting,
  onDayClick,
  onDayHover,
  onDayLeave,
}: CalendarPanelProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="drp__panel">
      <div className="drp__panel-label">
        {year}년 {month + 1}월
      </div>
      <div className="drp__grid">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`drp__weekday${i === 0 ? ' drp__weekday--sun' : i === 6 ? ' drp__weekday--sat' : ''}`}
          >
            {label}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;

          const dateStr = toDateStr(year, month, day);
          const past = dateStr < todayStr;
          const isStart = !!rangeStart && dateStr === rangeStart;
          const isEnd = !!rangeEnd && dateStr === rangeEnd;
          const inRange =
            !!rangeStart && !!rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;
          const isToday = dateStr === todayStr;
          const isSingleDay = isStart && isEnd;
          const col = (firstDayOfWeek + day - 1) % 7;

          const cls = [
            'drp__day',
            isStart && !isSingleDay ? 'drp__day--start' : '',
            isEnd && !isSingleDay ? 'drp__day--end' : '',
            isSingleDay ? 'drp__day--single' : '',
            inRange ? 'drp__day--in-range' : '',
            isToday && !isStart && !isEnd ? 'drp__day--today' : '',
            past ? 'drp__day--past' : '',
            col === 0 ? 'drp__day--sun' : col === 6 ? 'drp__day--sat' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={dateStr}
              type="button"
              disabled={past}
              className={cls}
              onClick={() => onDayClick(dateStr)}
              onMouseEnter={() => selecting === 'end' && onDayHover(dateStr)}
              onMouseLeave={onDayLeave}
              aria-label={`${year}년 ${month + 1}월 ${day}일`}
            >
              <span className="drp__day-inner">{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({ startDate, endDate, onRangeChange }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoverDate, setHoverDate] = useState('');
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');

  const todayStr = getTodayStr();
  const right = nextMonthOf(viewYear, viewMonth);

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (selecting === 'start' || !startDate) {
      onRangeChange(dateStr, '');
      setSelecting('end');
    } else {
      const [s, e] = dateStr < startDate ? [dateStr, startDate] : [startDate, dateStr];
      onRangeChange(s, e);
      setSelecting('start');
    }
  };

  // Effective range (with hover preview while selecting end)
  const effectiveEnd = selecting === 'end' && hoverDate ? hoverDate : endDate;
  const rangeStart =
    startDate && effectiveEnd
      ? startDate <= effectiveEnd
        ? startDate
        : effectiveEnd
      : startDate;
  const rangeEnd =
    startDate && effectiveEnd
      ? startDate <= effectiveEnd
        ? effectiveEnd
        : startDate
      : '';

  const sharedPanelProps = {
    todayStr,
    rangeStart,
    rangeEnd,
    selecting,
    onDayClick: handleDayClick,
    onDayHover: setHoverDate,
    onDayLeave: () => setHoverDate(''),
  };

  return (
    <div className="drp">
      {/* Navigation */}
      <div className="drp__nav-row">
        <button
          className="drp__nav"
          type="button"
          disabled={!canGoPrev}
          onClick={prevMonth}
          aria-label="이전 달"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="drp__nav"
          type="button"
          onClick={nextMonth}
          aria-label="다음 달"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Two calendar panels */}
      <div className="drp__panels">
        <CalendarPanel year={viewYear} month={viewMonth} {...sharedPanelProps} />
        <div className="drp__divider" aria-hidden="true" />
        <CalendarPanel year={right.year} month={right.month} {...sharedPanelProps} />
      </div>

    </div>
  );
}
