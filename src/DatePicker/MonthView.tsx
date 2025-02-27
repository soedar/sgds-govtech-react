import * as React from 'react';
import classNames from 'classnames';
import { RangeSelectionValue } from './types';
import DatePickerContext from './DatePickerContext';

export interface MonthViewProps extends React.HTMLAttributes<HTMLElement> {
  selectedDate: Date | RangeSelectionValue | undefined;
  displayDate: Date;
  onClickMonth: Function;
  show: boolean;
  monthRefs: React.RefObject<(HTMLButtonElement | null)[]>;
  onChangeMonth: (date: Date) => void;
  handleTabPressOnCalendarBody: (
    event: React.KeyboardEvent<HTMLElement>
  ) => void;
}

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENT_DATE = new Date();

export const MonthView = React.forwardRef<HTMLDivElement, MonthViewProps>(
  (
    {
      selectedDate,
      displayDate,
      onClickMonth,
      show,
      monthRefs,
      onChangeMonth,
      handleTabPressOnCalendarBody,
      ...props
    },
    ref
  ) => {
    const { focusedMonthIndex, setFocusedMonthIndex } =
      React.useContext(DatePickerContext);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      event.preventDefault();

      const handleMonthIncrement = (incrementedMonth: number) => {
        const totalMonthIndex = 11; // total 12 months and index starts from 0;
        setFocusedMonthIndex((prevState) => {
          // get new focused month date
          const focusedMonth = new Date(
            displayDate.getFullYear(),
            prevState,
            1
          );
          focusedMonth.setMonth(focusedMonth.getMonth() + incrementedMonth);

          // switch calendar view to next year
          if (prevState + incrementedMonth > totalMonthIndex) {
            const newDisplayDate = new Date(displayDate);
            newDisplayDate.setDate(1);
            newDisplayDate.setFullYear(newDisplayDate.getFullYear() + 1);
            onChangeMonth(newDisplayDate);
          }

          return focusedMonth.getMonth();
        });
      };

      const handleMonthDecrement = (decrementedMonth: number) => {
        setFocusedMonthIndex((prevState) => {
          // get new focused month date
          const focusedMonth = new Date(
            displayDate.getFullYear(),
            prevState,
            1
          );
          focusedMonth.setMonth(focusedMonth.getMonth() - decrementedMonth);

          // switch calendar view to previous year
          if (
            prevState - decrementedMonth < 0 &&
            focusedMonth.getFullYear() >= 1900
          ) {
            const newDisplayDate = new Date(displayDate);
            newDisplayDate.setDate(1);
            newDisplayDate.setFullYear(newDisplayDate.getFullYear() - 1);
            onChangeMonth(newDisplayDate);
          }

          if (focusedMonth.getFullYear() >= 1900) {
            return focusedMonth.getMonth();
          } else {
            return prevState;
          }
        });
      };

      switch (event.key) {
        case 'ArrowUp':
          handleMonthDecrement(3); // minus 3 months
          break;
        case 'ArrowDown':
          handleMonthIncrement(3); // add 3 months
          break;
        case 'ArrowLeft':
          handleMonthDecrement(1); // minus 1 month
          break;
        case 'ArrowRight':
          handleMonthIncrement(1); // add 1 month
          break;
        case 'Tab':
          handleTabPressOnCalendarBody(event);
          break;
        case 'Enter':
        case ' ':
          const month = focusedMonthIndex;
          onClickMonth(month);
          break;
        default:
          break;
      }
    };

    React.useEffect(() => {
      if (displayDate) {
        const focusedMonth = displayDate.getMonth();
        setFocusedMonthIndex(focusedMonth);
      }
    }, []);

    React.useEffect(() => {
      if (show && monthRefs.current) {
        const focusedElement = monthRefs.current[focusedMonthIndex];
        if (focusedElement) {
          focusedElement.focus();
        }
      }
    }, [show, focusedMonthIndex]);

    const getActiveMonthClass = (month: string) => {
      if (selectedDate === undefined) return undefined;

      if (selectedDate instanceof Date) {
        if (
          MONTH_LABELS[selectedDate.getMonth()] === month &&
          selectedDate.getFullYear() === displayDate.getFullYear()
        ) {
          return 'bg-primary-600 text-white';
        }
      } else {
        const { start, end } = selectedDate;
        const monthIndex = MONTH_LABELS.findIndex(
          (monthLabel) => monthLabel === month
        );

        if (start && end) {
          // for date range picker, compare month and year for the selected date range to highlight the months correctly
          const displayYear = displayDate.getFullYear();
          const startMonth = start.getMonth();
          const startYear = start.getFullYear();
          const endMonth = end.getMonth();
          const endYear = end.getFullYear();

          if (
            (displayYear === startYear && monthIndex === startMonth) ||
            (displayYear === endYear && monthIndex === endMonth)
          ) {
            return 'bg-primary-600 text-white';
          }

          if (
            displayYear === startYear &&
            displayYear === endYear &&
            monthIndex >= startMonth &&
            monthIndex <= endMonth
          ) {
            // case 1: handle when the display year is same as the start and end year
            // highlight the months between the start and end month
            return 'bg-primary-100';
          }

          if (
            displayYear === startYear &&
            displayYear < endYear &&
            monthIndex >= startMonth
          ) {
            // case 2: handle when the display year is same as the start year and before the end year
            // highlight all the months from start month onwards
            return 'bg-primary-100';
          }

          if (displayYear > startYear && displayYear < endYear) {
            // case 3: handle when the display year is in between the start and end year
            // highlight all the months
            return 'bg-primary-100';
          }

          if (
            displayYear > startYear &&
            displayYear === endYear &&
            monthIndex <= endMonth
          ) {
            // case 4: handle when the display year is larger than the start year and same as the end year
            // highlight all the months before the end month
            return 'bg-primary-100';
          }
        }

        if (
          start &&
          monthIndex === start.getMonth() &&
          displayDate.getFullYear() === start.getFullYear()
        ) {
          return 'bg-primary-600 text-white';
        }
      }

      return undefined;
    };
    return (
      <div className="sgds monthpicker" ref={ref} {...props}>
        {MONTH_LABELS.map((month, index) => {
          const activeMonthClass = getActiveMonthClass(month);
          const isCurrentMonthAndYear =
            MONTH_LABELS[CURRENT_DATE.getMonth()] === month &&
            displayDate.getFullYear() === CURRENT_DATE.getFullYear();
          const defaultAriaLabel = `${month} ${displayDate.getFullYear()}`;
          const currentMonthAriaLabel = `Current month, ${defaultAriaLabel}`;
          return (
            <button
              type="button"
              aria-label={
                isCurrentMonthAndYear ? currentMonthAriaLabel : defaultAriaLabel
              }
              aria-selected={activeMonthClass ? 'true' : 'false'}
              className={classNames(
                isCurrentMonthAndYear && 'text-primary',
                activeMonthClass,
                'month'
              )}
              key={month}
              onClick={() => onClickMonth(index)}
              onKeyDown={handleKeyDown}
              ref={(el) =>
                monthRefs.current ? (monthRefs.current[index] = el) : undefined
              }
            >
              {month.slice(0, 3)}
            </button>
          );
        })}
      </div>
    );
  }
);

export default MonthView;
