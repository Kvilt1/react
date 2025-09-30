import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, addYears, subYears } from 'date-fns';

interface DatePickerPopupProps {
  currentDate: Date;
  onClose: () => void;
  availableDates?: Date[];
}

export default function DatePickerPopup({
  currentDate,
  onClose,
  availableDates = [],
}: DatePickerPopupProps) {
  const [selected, setSelected] = useState<Date>(currentDate);
  const [displayMonth, setDisplayMonth] = useState<Date>(currentDate);
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelected(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      navigate(`/day/${formattedDate}`);
      onClose();
    }
  };

  // Helper function to check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    if (availableDates.length === 0) return true;
    
    return availableDates.some(
      (availableDate) =>
        availableDate.getFullYear() === date.getFullYear() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getDate() === date.getDate()
    );
  };

  // Check if any dates exist in a given month/year
  const hasDateInMonth = (year: number, month: number): boolean => {
    if (availableDates.length === 0) return true;
    
    return availableDates.some(
      (date) => date.getFullYear() === year && date.getMonth() === month
    );
  };

  const hasDateInYear = (year: number): boolean => {
    if (availableDates.length === 0) return true;
    
    return availableDates.some((date) => date.getFullYear() === year);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = subMonths(displayMonth, 1);
    if (hasDateInMonth(newDate.getFullYear(), newDate.getMonth())) {
      setDisplayMonth(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = addMonths(displayMonth, 1);
    if (hasDateInMonth(newDate.getFullYear(), newDate.getMonth())) {
      setDisplayMonth(newDate);
    }
  };

  const goToPreviousYear = () => {
    const newDate = subYears(displayMonth, 1);
    if (hasDateInYear(newDate.getFullYear())) {
      setDisplayMonth(newDate);
    }
  };

  const goToNextYear = () => {
    const newDate = addYears(displayMonth, 1);
    if (hasDateInYear(newDate.getFullYear())) {
      setDisplayMonth(newDate);
    }
  };

  // Check navigation availability
  const canGoToPreviousMonth = hasDateInMonth(
    subMonths(displayMonth, 1).getFullYear(),
    subMonths(displayMonth, 1).getMonth()
  );

  const canGoToNextMonth = hasDateInMonth(
    addMonths(displayMonth, 1).getFullYear(),
    addMonths(displayMonth, 1).getMonth()
  );

  const canGoToPreviousYear = hasDateInYear(subYears(displayMonth, 1).getFullYear());
  const canGoToNextYear = hasDateInYear(addYears(displayMonth, 1).getFullYear());

  // Determine date range from available dates
  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  if (availableDates.length > 0) {
    const sortedDates = [...availableDates].sort((a, b) => a.getTime() - b.getTime());
    fromDate = sortedDates[0];
    toDate = sortedDates[sortedDates.length - 1];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        ref={popupRef}
        className="bg-bg-secondary border-2 border-accent rounded-lg shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 min-w-[320px]"
      >
        {/* Custom Navigation Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          {/* Year back button */}
          <button
            onClick={goToPreviousYear}
            disabled={!canGoToPreviousYear}
            className={`p-2 rounded transition-colors ${
              canGoToPreviousYear
                ? 'text-text-primary hover:bg-hover-bg cursor-pointer'
                : 'text-text-tertiary opacity-30 cursor-not-allowed'
            }`}
            aria-label="Previous year"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>

          {/* Month back button */}
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoToPreviousMonth}
            className={`p-2 rounded transition-colors ${
              canGoToPreviousMonth
                ? 'text-text-primary hover:bg-hover-bg cursor-pointer'
                : 'text-text-tertiary opacity-30 cursor-not-allowed'
            }`}
            aria-label="Previous month"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Month and Year Display */}
          <div className="flex-1 text-center">
            <span className="text-lg font-bold text-accent">
              {format(displayMonth, 'MMMM yyyy')}
            </span>
          </div>

          {/* Month forward button */}
          <button
            onClick={goToNextMonth}
            disabled={!canGoToNextMonth}
            className={`p-2 rounded transition-colors ${
              canGoToNextMonth
                ? 'text-text-primary hover:bg-hover-bg cursor-pointer'
                : 'text-text-tertiary opacity-30 cursor-not-allowed'
            }`}
            aria-label="Next month"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Year forward button */}
          <button
            onClick={goToNextYear}
            disabled={!canGoToNextYear}
            className={`p-2 rounded transition-colors ${
              canGoToNextYear
                ? 'text-text-primary hover:bg-hover-bg cursor-pointer'
                : 'text-text-tertiary opacity-30 cursor-not-allowed'
            }`}
            aria-label="Next year"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
        </div>

        {/* Calendar */}
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          fromDate={fromDate}
          toDate={toDate}
          disabled={(date) => !isDateAvailable(date)}
          classNames={{
            root: 'rdp-custom',
            months: 'flex flex-col',
            month: 'w-full',
            month_caption: 'hidden',
            nav: 'hidden',
            month_grid: 'w-full',
            weekdays: 'flex w-full',
            weekday:
              'text-text-secondary text-xs font-bold uppercase w-[2.5rem] h-10 flex items-center justify-center',
            week: 'flex w-full mt-0.5',
            day: 'w-[2.5rem] h-[2.5rem] p-0',
            day_button:
              'w-full h-full flex items-center justify-center rounded-md hover:bg-hover-bg transition-all text-text-primary font-medium cursor-pointer text-sm',
            selected:
              '!bg-bg-primary !text-accent !font-bold hover:!bg-bg-primary border-2 !border-accent',
            today: '!bg-snap-purple !text-white font-bold',
            outside: 'text-text-tertiary opacity-40',
            disabled: 'text-text-tertiary opacity-20 cursor-not-allowed',
            hidden: 'invisible',
          }}
        />
      </div>
    </div>
  );
}
