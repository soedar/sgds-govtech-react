import * as React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PropTypes from 'prop-types';
import warning from 'warning';
import { Button } from '../Button';
import FormControl from '../Form/FormControl';
import { Dropdown } from '../Dropdown';
import generateId from '../utils/generateId';
import { BsPrefixRefForwardingComponent } from '../utils/helpers';
import { ButtonVariant } from '../utils/types';
import Calendar, { setTimeToNoon } from './Calendar';
import CalendarHeader from './CalendarHeader';
import DateInput from './DateInput';
import DatePickerContext, { CalendarView } from './DatePickerContext';
import MonthView from './MonthView';
import YearView from './YearView';
import { getTotalDaysInMonth } from '../utils/getTotalDaysInMonth';
import { RangeSelectionValue, CalendarPlacement, DateFormat } from './types';

dayjs.extend(customParseFormat);

interface DatePickerState {
  displayDate: Date;
  inputDate: string;
  selectedDate: Date | RangeSelectionValue | undefined;
  invalid: boolean;
}
export interface DatePickerProps {
  /** Changes DatePicker to single date selection or range date selection */
  mode?: 'single' | 'range';
  /**Provides the date context for Calendar to present the appropriate view. If `initialValue` is used, `displayDate` should be synced with it */
  displayDate?: Date;
  /** The initial value of DatePicker on first load. When used, ensure that the type is consistent with the `mode` used */
  initialValue?: Date | RangeSelectionValue;
  /**When true, adds required attribute to Form Control input element */
  required?: boolean;
  /** Class name passed to the FormControl input element */
  className?: string;
  /** ISO date string to set the lowest allowable date value. e.g. "2016-05-19T12:00:00.000Z" */
  minDate?: string;
  /** ISO date string to set the highest allowable date value. e.g. "2016-05-19T12:00:00.000Z" */
  maxDate?: string;
  /** Placeholder text on input control. Default differs depending on mode */
  placeholder?: string;
  /** The onChange handler for DatePicker */
  onChangeDate?: (value: Date | RangeSelectionValue | undefined) => void;
  /** Clear callback function */
  onClear?: Function;
  /** The onError handler for DatePicker */
  onError?: Function;
  /** Feedback text for error state when date input is invalid */
  invalidFeedback?: string;
  /** Disables the Form Control and Button of Datepicker */
  disabled?: boolean;
  /** Overlay placement for the popover calendar */
  calendarPlacement?: CalendarPlacement;
  /** Date format reflected on input */
  dateFormat?: DateFormat;
  /** Forwards the id to InputGroup of DatePicker */
  id?: string;
  /** When true, flips Calendar Overlay when placement does not fit */
  flip?: boolean;
  /** Customize clear button variant colour */
  clearBtnVariant?: ButtonVariant;
}

const propTypes = {
  initialValue: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.shape({
      start: PropTypes.instanceOf(Date),
      end: PropTypes.instanceOf(Date),
    }),
  ]),
  required: PropTypes.bool,
  className: PropTypes.string,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  displayDate: PropTypes.instanceOf(Date),
  placeholder: PropTypes.string,
  onChangeDate: PropTypes.func,
  onClear: PropTypes.func,
  onError: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  autoFocus: PropTypes.bool,
  invalidFeedback: PropTypes.string,
  disabled: PropTypes.bool,
  calendarPlacement: PropTypes.oneOf(['up', 'down']),
  /**
   * dateFormat variants
   *
   * @type {('MM/DD/YYYY'|'DD/MM/YYYY'|'YYYY/MM/DD')}
   */
  dateFormat: PropTypes.string,
  id: PropTypes.string,
  /**
   * mode variants
   *
   * @type {('single'|'range')}
   */
  mode: PropTypes.string,
  flip: PropTypes.bool,
  clearBtnVariant: PropTypes.string,
};

const SEPARATOR = '/';
export const makeInputValueString = (
  date: Date | undefined,
  dateFormat: DateFormat
) => {
  if (date === undefined) return '';
  const month = date.getMonth() + 1;
  const day = date.getDate();

  //this method is executed during intialState setup... handle a missing state properly
  const separator = SEPARATOR;
  if (dateFormat.match(/MM.DD.YYYY/)) {
    return (
      (month > 9 ? month : `0${month}`) +
      separator +
      (day > 9 ? day : `0${day}`) +
      separator +
      date.getFullYear()
    );
  } else if (dateFormat.match(/DD.MM.YYYY/)) {
    return (
      (day > 9 ? day : `0${day}`) +
      separator +
      (month > 9 ? month : `0${month}`) +
      separator +
      date.getFullYear()
    );
  } else {
    return (
      date.getFullYear() +
      separator +
      (month > 9 ? month : `0${month}`) +
      separator +
      (day > 9 ? day : `0${day}`)
    );
  }
};

export const isValidDate = (date: string, dateFormat: DateFormat) => {
  return dayjs(date, dateFormat, true).isValid();
};

export const arrangeDateRange = (
  date1: Date,
  date2: Date,
  dateFormat: DateFormat
) => {
  if (date1.getTime() > date2.getTime()) {
    return {
      start: date2,
      end: date1,
      inputDate: `${makeInputValueString(
        date2,
        dateFormat
      )} - ${makeInputValueString(date1, dateFormat)}`,
    };
  }

  return {
    start: date1,
    end: date2,
    inputDate: `${makeInputValueString(
      date1,
      dateFormat
    )} - ${makeInputValueString(date2, dateFormat)}`,
  };
};

const defaultProps: Partial<DatePickerProps> = {
  dateFormat: 'DD/MM/YYYY',
  calendarPlacement: 'down',
  mode: 'single',
  displayDate: new Date(),
  flip: true,
  invalidFeedback: 'Please enter a valid date',
};

export const DatePicker: BsPrefixRefForwardingComponent<
  'input',
  DatePickerProps
> = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      dateFormat = 'DD/MM/YYYY',
      calendarPlacement = 'down',
      mode = 'single',
      displayDate = new Date(),
      flip = true,
      clearBtnVariant = 'primary',
      ...props
    },
    ref
  ) => {
    const isRange = mode === 'range';
    const dropdownToggleRef = React.useRef<HTMLButtonElement>(null);
    const calendarHeaderRef = React.useRef<HTMLDivElement>(null);
    const dayRefs = React.useRef<Array<HTMLTableCellElement | null>>([]);
    const monthRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const yearRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const getinitialInputDate = () => {
      if (!props.initialValue) {
        if (isRange) {
          return `${dateFormat.toLowerCase()} - ${dateFormat.toLowerCase()}`;
        }
        return dateFormat.toLowerCase();
      }

      if (isRange) {
        const { start, end } = props.initialValue as RangeSelectionValue;
        if (start && end) {
          return `${makeInputValueString(
            start,
            dateFormat
          )} - ${makeInputValueString(end, dateFormat)}`;
        }
        return dateFormat.toLowerCase();
      }

      if (!isRange && props.initialValue instanceof Date) {
        return dayjs(props.initialValue).format(dateFormat);
      }

      return dateFormat.toLowerCase();
    };

    const initialState: DatePickerState = {
      displayDate: displayDate,
      inputDate: getinitialInputDate(),
      selectedDate:
        props.initialValue &&
        ((isRange && !(props.initialValue instanceof Date)) ||
          (!isRange && props.initialValue instanceof Date))
          ? props.initialValue
          : isRange
          ? { start: undefined, end: undefined }
          : undefined,
      invalid: false,
    };
    // Generation of unique id soley on client side
    const [datepickerMenuId, setDatepickerMenuId] = React.useState('');
    const [state, setState] = React.useState(initialState);
    const [view, setView] = React.useState<CalendarView>('day');
    const [focusedDateIndex, setFocusedDateIndex] = React.useState(0);
    const [focusedMonthIndex, setFocusedMonthIndex] = React.useState(0);
    const [focusedYearIndex, setFocusedYearIndex] = React.useState(0);
    const [yearPositionIndex, setYearPositionIndex] = React.useState(0);
    const [showCalendar, setShowCalendar] = React.useState(false);
    const contextValue = React.useMemo(
      () => ({
        view,
        setView,
        focusedDateIndex,
        setFocusedDateIndex,
        focusedMonthIndex,
        setFocusedMonthIndex,
        focusedYearIndex,
        setFocusedYearIndex,
        yearPositionIndex,
        setYearPositionIndex,
      }),
      [
        view,
        focusedDateIndex,
        focusedMonthIndex,
        focusedYearIndex,
        yearPositionIndex,
      ]
    );

    const updateFocusedDate = React.useCallback((focusedDate: Date) => {
      onChangeMonth(focusedDate);
      setFocusedDateIndex(focusedDate.getDate());
      setFocusedMonthIndex(focusedDate.getMonth());
    }, []);

    const onChangeMonth = (newDisplayDate: Date) => {
      setState((prevState) => ({ ...prevState, displayDate: newDisplayDate }));
    };

    const resetFocusOnHeader = () => {
      const headerTitle = calendarHeaderRef.current?.children[1];
      (headerTitle as HTMLElement).focus();
    };

    const clear = () => {
      setState({
        ...initialState,
        displayDate: new Date(),
        inputDate: isRange
          ? `${dateFormat.toLowerCase()} - ${dateFormat.toLowerCase()}`
          : dateFormat.toLowerCase(),
        selectedDate: isRange
          ? { start: undefined, end: undefined }
          : undefined,
      });
      setView('day');
      const resetFocusedDate = new Date();
      updateFocusedDate(resetFocusedDate);
      props.onClear?.();
      props.onChangeDate?.(undefined);
    };

    //triggered only when clicking dates

    const onChangeDateSingle = (newSelectedDate: Date) => {
      setState((prevState) => ({
        ...prevState,
        inputDate: dayjs(newSelectedDate).format(dateFormat),
        selectedDate: newSelectedDate,
        displayDate: newSelectedDate,
      }));
      dropdownToggleRef?.current?.click();
      props.onChangeDate?.(newSelectedDate);
    };

    const onChangeDateRange = (newSelectedDate: Date) => {
      const { start, end } = state.selectedDate as RangeSelectionValue;

      const dateRangeHandler = () => {
        if ((!start && !end) || (start && end)) {
          // Selecting start date
          return {
            start: newSelectedDate,
            end: undefined,
          };
        }

        if (start && !end) {
          // Selecting end date
          // if selected end date is before selected start date --> swap
          const { start: dateStart, end: dateEnd } = arrangeDateRange(
            new Date(start),
            newSelectedDate,
            dateFormat
          );
          return {
            start: dateStart,
            end: dateEnd,
          };
        }

        return { start, end };
      };

      const newSelectedDates = dateRangeHandler();
      setState((prevState) => ({
        ...prevState,
        inputDate: `${makeInputValueString(
          newSelectedDates.start,
          dateFormat
        )} - ${
          newSelectedDates.end
            ? makeInputValueString(newSelectedDates.end, dateFormat)
            : dateFormat.toLowerCase()
        }`,
        selectedDate: newSelectedDates,
        displayDate: newSelectedDate,
      }));
      if (newSelectedDates.end) {
        dropdownToggleRef?.current?.click();
        // onChangeDate calls only when both start and end dates are selected
        props.onChangeDate?.(newSelectedDates);
      }
    };

    const focusOnDateCalendar = () => {
      const focusedDate = dayRefs.current[focusedDateIndex];
      const focusedMonth = monthRefs.current[focusedMonthIndex];
      const focusedYear = yearRefs.current[focusedYearIndex];

      if (view === 'month') {
        (focusedMonth as HTMLElement).focus();
        return;
      }
      if (view === 'year') {
        (focusedYear as HTMLElement).focus();
        return;
      }

      const totalDaysInMonth = getTotalDaysInMonth(state.displayDate);
      if (focusedDateIndex > totalDaysInMonth) {
        setFocusedDateIndex(totalDaysInMonth);
        const newFocusedDate = dayRefs.current[totalDaysInMonth];
        (newFocusedDate as HTMLElement).focus();
        return;
      }
      (focusedDate as HTMLElement).focus();
    };

    const handleTabPressOnPreviousButton = (
      event: React.KeyboardEvent<HTMLElement>
    ) => {
      event.preventDefault();
      const headerTitle = calendarHeaderRef.current?.children[1];
      if (event.shiftKey) {
        focusOnDateCalendar();
      } else {
        (headerTitle as HTMLElement).focus();
      }
    };

    const handleTabPressOnHeaderTitle = (
      event: React.KeyboardEvent<HTMLElement>
    ) => {
      event.preventDefault();
      const previousButton = calendarHeaderRef.current?.children[0];
      const nextButton = calendarHeaderRef.current?.children[2];

      if (event.shiftKey) {
        if (previousButton instanceof HTMLButtonElement) {
          (previousButton as HTMLElement).focus();
        } else {
          focusOnDateCalendar();
        }
      } else {
        (nextButton as HTMLElement).focus();
      }
    };

    const handleTabPressOnNextButton = (
      event: React.KeyboardEvent<HTMLElement>
    ) => {
      event.preventDefault();
      const headerTitle = calendarHeaderRef.current?.children[1];
      if (event.shiftKey) {
        (headerTitle as HTMLElement).focus();
      } else {
        focusOnDateCalendar();
      }
    };

    const handleTabPressOnCalendarBody = (
      event: React.KeyboardEvent<HTMLElement>
    ) => {
      event.preventDefault();
      const previousButton = calendarHeaderRef.current?.children[0];
      const headerTitle = calendarHeaderRef.current?.children[1];
      const nextButton = calendarHeaderRef.current?.children[2];

      if (event.shiftKey) {
        (nextButton as HTMLElement).focus();
      } else {
        if (previousButton instanceof HTMLButtonElement) {
          (previousButton as HTMLElement).focus();
        } else {
          (headerTitle as HTMLElement).focus();
        }
      }
    };

    const calendarHeader = (
      <CalendarHeader
        displayDate={state.displayDate as Date}
        onChange={onChangeMonth}
        resetFocusOnHeader={resetFocusOnHeader}
        ref={calendarHeaderRef}
        handleTabPressOnPreviousButton={handleTabPressOnPreviousButton}
        handleTabPressOnHeaderTitle={handleTabPressOnHeaderTitle}
        handleTabPressOnNextButton={handleTabPressOnNextButton}
      />
    );

    const BodyContent = (): JSX.Element => {
      const onClickMonth = (month: number) => {
        const newDisplayDate = new Date(state.displayDate);
        newDisplayDate.setMonth(month);
        setView('day');
        setState((prevState) => ({
          ...prevState,
          displayDate: newDisplayDate,
        }));
      };
      const onClickYear = (year: number) => {
        const newDisplayDate = new Date(state.displayDate);
        newDisplayDate.setFullYear(year);
        setView('month');
        setState((prevState) => ({
          ...prevState,
          displayDate: newDisplayDate,
        }));
      };
      if (view === 'month')
        return (
          <MonthView
            selectedDate={state.selectedDate}
            displayDate={state.displayDate}
            onClickMonth={onClickMonth}
            show={showCalendar}
            monthRefs={monthRefs}
            onChangeMonth={onChangeMonth}
            handleTabPressOnCalendarBody={handleTabPressOnCalendarBody}
          />
        );
      if (view === 'year')
        return (
          <YearView
            selectedDate={state.selectedDate}
            displayDate={state.displayDate}
            onClickYear={onClickYear}
            show={showCalendar}
            yearRefs={yearRefs}
            onChangeMonth={onChangeMonth}
            handleTabPressOnCalendarBody={handleTabPressOnCalendarBody}
          />
        );

      return (
        <Calendar
          selectedDate={state.selectedDate}
          displayDate={state.displayDate}
          changeDate={isRange ? onChangeDateRange : onChangeDateSingle}
          minDate={props.minDate}
          maxDate={props.maxDate}
          mode={mode}
          show={showCalendar}
          dayRefs={dayRefs}
          onChangeMonth={onChangeMonth}
          handleTabPressOnCalendarBody={handleTabPressOnCalendarBody}
        />
      );
    };

    const enterDateSingle = (event: React.ChangeEvent<HTMLInputElement>) => {
      const enteredDate = event.target.value;
      if (enteredDate === dateFormat.toLowerCase()) {
        return clear();
      }
      const parsedDate = dayjs(enteredDate, dateFormat).toDate();
      const afterMinDate = props.minDate
        ? setTimeToNoon(parsedDate) >= setTimeToNoon(new Date(props.minDate))
        : true;
      const beforeMaxDate = props.maxDate
        ? setTimeToNoon(parsedDate) <= setTimeToNoon(new Date(props.maxDate))
        : true;
      if (
        isValidDate(enteredDate, dateFormat) &&
        parsedDate.getFullYear() >= 1900 &&
        afterMinDate &&
        beforeMaxDate
      ) {
        setState((prevState) => ({
          ...prevState,
          inputDate: enteredDate,
          displayDate: parsedDate,
          selectedDate: parsedDate,
          invalid: false,
        }));
        updateFocusedDate(setTimeToNoon(parsedDate));
        props.onChangeDate?.(setTimeToNoon(parsedDate));
        return;
      }

      setState((prevState) => ({
        ...prevState,
        inputDate: enteredDate,
      }));
      updateFocusedDate(displayDate);
    };

    const enterDateRange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const enteredDate = event.target.value;

      if (enteredDate === `${dateFormat.toLowerCase()} - ${dateFormat.toLowerCase()}`) {
        return clear();
      }

      const [start, end] = enteredDate.split(' - ');
      const dateStart = dayjs(start, dateFormat).toDate();
      const dateEnd = dayjs(end, dateFormat).toDate();
      const dateStartAfterMinDate = props.minDate
        ? setTimeToNoon(dateStart) >= setTimeToNoon(new Date(props.minDate))
        : true;
      const dateStartBeforeMaxDate = props.maxDate
        ? setTimeToNoon(dateStart) <= setTimeToNoon(new Date(props.maxDate))
        : true;
      const dateEndAfterMinDate = props.minDate
        ? setTimeToNoon(dateEnd) >= setTimeToNoon(new Date(props.minDate))
        : true;
      const dateEndBeforeMaxDate = props.maxDate
        ? setTimeToNoon(dateEnd) <= setTimeToNoon(new Date(props.maxDate))
        : true;
      
      if (
        isValidDate(start, dateFormat) &&
        isValidDate(end, dateFormat) &&
        dateStart.getFullYear() >= 1900 &&
        dateEnd.getFullYear() >= 1900 &&
        dateStartAfterMinDate &&
        dateStartBeforeMaxDate &&
        dateEndAfterMinDate &&
        dateEndBeforeMaxDate
      ) {
        const {
          start: dateStart,
          end: dateEnd,
          inputDate,
        } = arrangeDateRange(
          dayjs(start, dateFormat).toDate(),
          dayjs(end, dateFormat).toDate(),
          dateFormat
        );
        setState((prevState) => ({
          ...prevState,
          inputDate: inputDate,
          selectedDate: {
            start: setTimeToNoon(dateStart),
            end: setTimeToNoon(dateEnd),
          },
          displayDate: dateEnd,
          invalid: false,
        }));
        updateFocusedDate(dateEnd);
        props.onChangeDate?.({
          start: setTimeToNoon(dateStart),
          end: setTimeToNoon(dateEnd),
        });
        return;
      }

      if (
        isValidDate(start, dateFormat) &&
        dateStart.getFullYear() >= 1900 &&
        dateStartAfterMinDate &&
        dateStartBeforeMaxDate
      ) {
        setState((prevState) => ({
          ...prevState,
          inputDate: enteredDate,
          selectedDate: {
            start: dateStart,
            end: undefined,
          },
          displayDate: dateStart,
        }));
        updateFocusedDate(dateStart);
        return;
      }

      setState((prevState) => ({
        ...prevState,
        inputDate: enteredDate,
      }));
      updateFocusedDate(displayDate);
    };

    const toggleDatepickerHandler = (nextShow: boolean) => {
      if (nextShow) {
        setShowCalendar(true);
      } else {
        setShowCalendar(false);
      }
    };

    const validateDateInput = () => {
      const showError = () => {
        setState((prevState) => ({
          ...prevState,
          displayDate: displayDate,
          invalid: true,
          selectedDate: undefined,
        }));
        props.onError?.();
      };

      const dateRangeValidation = () => {
        const [start, end] = state.inputDate.split(' - ');
        const dateStart = dayjs(start, dateFormat).toDate();
        const dateEnd = dayjs(end, dateFormat).toDate();
        const dateStartBeforeMinDate = props.minDate
          ? setTimeToNoon(dateStart) < setTimeToNoon(new Date(props.minDate))
          : false;
        const dateStartAfterMaxDate = props.maxDate
          ? setTimeToNoon(dateStart) > setTimeToNoon(new Date(props.maxDate))
          : false;
        const dateEndBeforeMinDate = props.minDate
          ? setTimeToNoon(dateEnd) < setTimeToNoon(new Date(props.minDate))
          : false;
        const dateEndAfterMaxDate = props.maxDate
          ? setTimeToNoon(dateEnd) > setTimeToNoon(new Date(props.maxDate))
          : false;

        if (
          start !== dateFormat.toLowerCase() &&
          (!isValidDate(start, dateFormat) || !isValidDate(end, dateFormat))
        ) {
          showError();
          return;
        }

        if (
          isValidDate(start, dateFormat) &&
          dayjs(start, dateFormat).toDate().getFullYear() < 1900
        ) {
          showError();
          return;
        }

        if (
          isValidDate(end, dateFormat) &&
          dayjs(end, dateFormat).toDate().getFullYear() < 1900
        ) {
          showError();
          return;
        }

        if (isValidDate(start, dateFormat) && dateStartBeforeMinDate) {
          showError();
          return;
        }

        if (isValidDate(start, dateFormat) && dateStartAfterMaxDate) {
          showError();
          return;
        }

        if (isValidDate(end, dateFormat) && dateEndBeforeMinDate) {
          showError();
          return;
        }

        if (isValidDate(end, dateFormat) && dateEndAfterMaxDate) {
          showError();
          return;
        }

        setState((prevState) => ({ ...prevState, invalid: false }));
      };

      const dateSingleValidation = () => {
        const beforeMinDate = props.minDate
          ? setTimeToNoon(dayjs(state.inputDate, dateFormat).toDate()) <
            setTimeToNoon(new Date(props.minDate))
          : false;
        const afterMaxDate = props.maxDate
          ? setTimeToNoon(dayjs(state.inputDate, dateFormat).toDate()) >
            setTimeToNoon(new Date(props.maxDate))
          : false;

        if (
          state.inputDate !== dateFormat.toLowerCase() &&
          !isValidDate(state.inputDate, dateFormat)
        ) {
          showError();
          return;
        }

        if (
          isValidDate(state.inputDate, dateFormat) &&
          dayjs(state.inputDate, dateFormat).toDate().getFullYear() < 1900
        ) {
          showError();
          return;
        }

        if (isValidDate(state.inputDate, dateFormat) && beforeMinDate) {
          showError();
          return;
        }

        if (isValidDate(state.inputDate, dateFormat) && afterMaxDate) {
          showError();
          return;
        }

        setState((prevState) => ({ ...prevState, invalid: false }));
      };

      if (isRange) {
        dateRangeValidation();
      } else {
        dateSingleValidation();
      }
    };

    React.useEffect(() => {
      const warningCondition = () => {
        const displayDateStr = makeInputValueString(displayDate, dateFormat);
        if (isRange) {
          const { start, end } = props.initialValue as RangeSelectionValue;
          return (
            makeInputValueString(start, dateFormat) === displayDateStr ||
            makeInputValueString(end, dateFormat) === displayDateStr
          );
        } else {
          const initialValue = props.initialValue as Date;
          return (
            makeInputValueString(initialValue, dateFormat) === displayDateStr
          );
        }
      };
      if (props.initialValue) {
        warning(
          warningCondition(),
          'In DatePicker `single` mode, `initialValue` is `Date` type and `displayDate` prop must be of same value. In range mode, `initialValue` should be of object {start: Date, end: Date} and `displayDate` prop must be of same value as either `start` or `end`'
        );
        if (isRange) {
          const { start, end } = props.initialValue as RangeSelectionValue;
          start &&
            end &&
            warning(
              start.getTime() <= end.getTime(),
              '`end` Date cannot be earlier than `start` Date'
            );
        }
      }
    }, [props.initialValue, isRange, displayDate, dateFormat]);

    React.useEffect(() => {
      setDatepickerMenuId(generateId('datepicker', 'ul'));
    }, []);

    React.useEffect(() => {
      if (!showCalendar) {
        // reset calendar state, focus back to selected date if presents, otherwise set the focus back to today's date
        const getFocusedDate = () => {
          if (state.selectedDate) {
            if (state.selectedDate instanceof Date) {
              return state.selectedDate;
            } else {
              const { start, end } = state.selectedDate;
              if (end) {
                return end;
              }

              if (start && !end) {
                return start;
              }
            }
          }

          return displayDate;
        };
        const resetFocusedDate = getFocusedDate();
        updateFocusedDate(resetFocusedDate);
      }
    }, [showCalendar, displayDate]);

    const ariaLabelsForMenu = {
      day: 'Choose date',
      month: 'Choose month',
      year: 'Choose year',
    };
    const feedbackId = 'id-6163-sgds-feedback-div';
    return (
      <DatePickerContext.Provider value={contextValue}>
        <Dropdown
          drop={calendarPlacement}
          className="input-group"
          onToggle={toggleDatepickerHandler}
        >
          <DateInput
            ref={ref}
            className={props.className}
            required={props.required}
            placeholder={props.placeholder}
            disabled={props.disabled}
            id={props.id}
            isRange={isRange}
            inputDate={state.inputDate}
            isInvalid={state.invalid}
            dateFormat={dateFormat}
            validateDateInput={validateDateInput}
            enterDateRange={enterDateRange}
            enterDateSingle={enterDateSingle}
            aria-invalid={state.invalid}
            aria-describedby={state.invalid ? feedbackId : ''}
          />
          <Dropdown.Toggle
            ref={dropdownToggleRef}
            className="rounded-0 border"
            variant="outline-dark"
            disabled={props.disabled}
            aria-label="Open Datepicker"
            aria-haspopup="dialog"
            aria-controls={datepickerMenuId}
          >
            <i className="bi bi-calendar"></i>
          </Dropdown.Toggle>
          <Button
            onClick={clear}
            disabled={props.disabled}
            variant={clearBtnVariant}
            aria-label="Reset Datepicker"
          >
            <i className="bi bi-x"></i>
            <span className="visually-hidden">clear</span>
          </Button>
          <FormControl.Feedback type="invalid" id={feedbackId}>
            {props.invalidFeedback}
          </FormControl.Feedback>
          <Dropdown.Menu
            id={datepickerMenuId}
            className="sgds datepicker"
            as="div"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabelsForMenu[view]}
          >
            <Dropdown.Header className="datepicker-header" role="none">
              {calendarHeader}
            </Dropdown.Header>
            <div className="datepicker-body">{BodyContent()}</div>
          </Dropdown.Menu>
        </Dropdown>
      </DatePickerContext.Provider>
    );
  }
);

// DatePicker.displayName = 'DatePicker';
DatePicker.propTypes = propTypes as any;
DatePicker.defaultProps = defaultProps;
export default DatePicker;
