import * as React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import Calendar, {
  DAY_LABELS,
  daysInMonth,
  setTimeToNoon,
} from '../../src/DatePicker/Calendar';

describe('setTimeToNoon function', () => {
  it('given date prop, should return new Date hours set to 12, min 0, sec 0, ms 0', () => {
    const result = setTimeToNoon(new Date(2022, 2, 1, 13, 14, 15, 7));

    expect(result).toEqual(new Date(2022, 2, 1, 12, 0, 0, 0));
  });

  it('given date already in noon, should return new Date hours set to 12, min 0, sec 0, ms 0', () => {
    const result = setTimeToNoon(new Date(2022, 2, 1, 12, 0, 0, 0));

    expect(result).toEqual(new Date(2022, 2, 1, 12, 0, 0, 0));
  });
  it('given any date  should return new Date hours set to 12, min 0, sec 0, ms 0', () => {
    const result = setTimeToNoon(new Date());
    const assertion = new Date();
    assertion.setHours(12);
    assertion.setMinutes(0);
    assertion.setSeconds(0);
    assertion.setMilliseconds(0);
    expect(result).toEqual(assertion);
  });
});

describe('Single mode Calendar', () => {
  const mode = 'single';
  const mockChangeDate = jest.fn();
  const mockOnChangeMonth = jest.fn();
  const mockhandleTabPressOnCalendarBody = jest.fn();
  const dayRefs = React.createRef<Array<HTMLTableCellElement | null>>();

  it('should have the default html structure', () => {
    const displayDate = new Date(2022, 2, 21);
    const selectedDate = new Date(2022, 2, 18);
    const { container, getByText } = render(
      <Calendar
        selectedDate={selectedDate}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    expect(container.querySelector('table.text-center')).toBeInTheDocument();
    DAY_LABELS.forEach((day) => {
      expect(getByText(day.slice(0, 3))).toBeInTheDocument();
    });

    const totalDaysInDisplayDate = daysInMonth[displayDate.getMonth()];
    expect(getByText(totalDaysInDisplayDate)).toBeInTheDocument();
    expect(getByText(selectedDate.getDate()).classList).toContain(
      'bg-primary-600'
    );
    expect(container.querySelectorAll('.bg-primary-600').length).toEqual(1);
  });

  it('day should have class text-primary when its current date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    const displayDate = new Date('2020-01-23');
    const selectedDate = new Date('2020-01-23');
    const { getByText, container } = render(
      <Calendar
        selectedDate={selectedDate}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );

    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('1').classList).toContain('text-primary');
    expect(container.querySelectorAll('.text-primary').length).toEqual(1);
    jest.clearAllTimers();
  });

  it('should show appropriate days depending on month', () => {
    const arrayOfDates = [
      new Date(2022, 0, 20),
      new Date(2022, 1, 20),
      new Date(2022, 2, 20),
      new Date(2022, 3, 20),
      new Date(2022, 4, 20),
      new Date(2022, 5, 20),
      new Date(2022, 6, 20),
      new Date(2022, 7, 20),
      new Date(2022, 8, 20),
      new Date(2022, 9, 20),
      new Date(2022, 10, 20),
      new Date(2022, 11, 20),
    ];

    arrayOfDates.forEach((date, idx) => {
      const { getByText } = render(
        <Calendar
          selectedDate={date}
          displayDate={date}
          changeDate={mockChangeDate}
          mode={mode}
          show={true}
          dayRefs={dayRefs}
          onChangeMonth={mockOnChangeMonth}
          handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
        />
      );
      const expectedLastDatePerMonth = daysInMonth[idx];
      expect(getByText(expectedLastDatePerMonth)).toBeInTheDocument();
      cleanup();
    });
  });

  it('account for leap year in feb months', () => {
    const leapYear = [2000, 2020, 2024, 2028];
    leapYear.forEach((y) => {
      const feb = new Date(y, 1, 20);
      const { getByText } = render(
        <Calendar
          selectedDate={feb}
          displayDate={feb}
          changeDate={mockChangeDate}
          mode={mode}
          show={true}
          dayRefs={dayRefs}
          onChangeMonth={mockOnChangeMonth}
          handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
        />
      );
      expect(getByText('29')).toBeInTheDocument();
      cleanup();
    });
  });

  it('end of century years but not leap year', () => {
    const notLeapYear = [1700, 1800, 1900, 2100];
    notLeapYear.forEach((y) => {
      const feb = new Date(y, 1, 20);
      const { queryByText } = render(
        <Calendar
          selectedDate={feb}
          displayDate={feb}
          changeDate={mockChangeDate}
          mode={mode}
          show={true}
          dayRefs={dayRefs}
          onChangeMonth={mockOnChangeMonth}
          handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
        />
      );
      expect(queryByText('29')).not.toBeInTheDocument();
      cleanup();
    });
  });

  it('bg-primary-100 changes with selectedDate ', () => {
    const date = new Date(2022, 2, 20);
    const { getByText, rerender } = render(
      <Calendar
        selectedDate={date}
        displayDate={date}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    expect(getByText('20').classList).toContain('bg-primary-600');
    rerender(
      <Calendar
        selectedDate={new Date(2022, 2, 1)}
        displayDate={date}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );

    expect(getByText('20').classList).not.toContain('bg-primary-600');
    expect(getByText('1').classList).toContain('bg-primary-600');
  });

  it('clickhandler is fired when click of dates', async () => {
    const date = new Date(2022, 2, 20);
    const { getByText } = render(
      <Calendar
        selectedDate={date}
        displayDate={date}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    fireEvent.click(getByText('21'));
    await waitFor(() => {
      expect(mockChangeDate).toHaveBeenCalled();
    });
    fireEvent.click(getByText('21'));
    await waitFor(() => {
      expect(mockChangeDate).toHaveBeenCalled();
    });
  });

  it('clickhandler not fired when click of dates out of min and max range', async () => {
    const date = new Date(2022, 2, 20);
    const minDate = new Date(2022, 2, 15).toISOString();
    const maxDate = new Date(2022, 2, 21).toISOString();
    const { getByText } = render(
      <Calendar
        selectedDate={date}
        displayDate={date}
        minDate={minDate}
        maxDate={maxDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    const activeRange = [15, 16, 17, 18, 19, 20, 21];
    activeRange.forEach((day) => {
      expect(getByText(day).classList).not.toContain('disabled');
    });

    fireEvent.click(getByText('21'));
    await waitFor(() => {
      expect(mockChangeDate).toHaveBeenCalled();
      mockChangeDate.mockReset();
    });

    fireEvent.click(getByText('15'));
    await waitFor(() => {
      expect(mockChangeDate).toHaveBeenCalled();
      mockChangeDate.mockReset();
    });
    fireEvent.click(getByText('14'));
    expect(getByText('14').classList).toContain('disabled');
    await waitFor(() => {
      expect(mockChangeDate).not.toHaveBeenCalled();
      mockChangeDate.mockReset();
    });
    fireEvent.click(getByText('22'));
    expect(getByText('22').classList).toContain('disabled');
    await waitFor(() => {
      expect(mockChangeDate).not.toHaveBeenCalled();
      mockChangeDate.mockReset();
    });
  });

  it('focus on current date when calendar is opened and there is no selected date', () => {
    const displayDate = new Date();
    const { getByText } = render(
      <Calendar
        selectedDate={undefined}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );

    expect(getByText(displayDate.getDate()).classList).toContain(
      'text-primary'
    );
  });

  // it('press ArrowDown key to go to the next 7 days', async () => {
  //   const displayDate = new Date();
  //   const { container, getByText } = render(
  //     <Calendar
  //       selectedDate={undefined}
  //       displayDate={displayDate}
  //       changeDate={mockChangeDate}
  //       mode={mode}
  //       show={true}
  //       dayRefs={dayRefs}
  //       onChangeMonth={mockOnChangeMonth}
  //       handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
  //     />
  //   );

  //   fireEvent.keyPress(container.querySelector('td.text-primary')!, {
  //     key: 'ArrowDown',
  //     code: 'ArrowDown',
  //   });
  //   await waitFor(() => {
  //     const nextWeekDate = new Date(displayDate);
  //     nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  //     expect(getByText(nextWeekDate.getDate())).toHaveFocus();
  //   });
  // });
});

describe('Range Calendar', () => {
  const mode = 'range';
  const mockChangeDate = jest.fn();
  const mockOnChangeMonth = jest.fn();
  const mockhandleTabPressOnCalendarBody = jest.fn();
  const dayRefs = React.createRef<Array<HTMLTableCellElement | null>>();

  it('when two diff date selected, it reflects bg-primary-100 on the range in between start and end date, bg-primary-600 on the start and end date', () => {
    const displayDate = new Date(2022, 2, 21);
    const selectedDate = {
      start: new Date(2022, 2, 18),
      end: new Date(2022, 2, 20),
    };
    const { container, getByText } = render(
      <Calendar
        selectedDate={selectedDate}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    expect(container.querySelectorAll('.bg-primary-100').length).toEqual(1);
    [18, 20].forEach((day) => {
      expect(getByText(day).classList).toContain('bg-primary-600');
    });
    expect(getByText('19').classList).toContain('bg-primary-100');
    [1, 5, 6, 21, 24, 27].forEach((day) => {
      expect(getByText(day).classList).not.toContain('bg-primary-100');
    });
  });

  it('the sequence of selectedDates should not matter', () => {
    const displayDate = new Date(2022, 2, 21);
    const selectedDate = {
      start: new Date(2022, 2, 20),
      end: new Date(2022, 2, 18),
    };
    const { container, getByText } = render(
      <Calendar
        selectedDate={selectedDate}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    expect(container.querySelectorAll('.bg-primary-100').length).toEqual(1);
    [18, 20].forEach((day) => {
      expect(getByText(day).classList).toContain('bg-primary-600');
    });
    expect(getByText('19').classList).toContain('bg-primary-100');
    [1, 5, 6, 21, 24, 27].forEach((day) => {
      expect(getByText(day).classList).not.toContain('bg-primary-100');
    });
  });
});

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

describe('Calendar a11y', () => {
  const mode = 'single';
  const mockChangeDate = jest.fn();
  const mockOnChangeMonth = jest.fn();
  const mockhandleTabPressOnCalendarBody = jest.fn();
  const dayRefs = React.createRef<Array<HTMLTableCellElement | null>>();
  it('date in calendar is aria-labelled', () => {
    const displayDate = new Date(2022, 2, 21);
    const selectedDate = new Date(2022, 2, 18);
    const { getByText } = render(
      <Calendar
        selectedDate={selectedDate}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    const expected = dayjs(new Date(2022, 2, 1)).format('dddd, MMMM D, YYYY');
    expect(getByText('1').getAttribute('aria-label')).toEqual(expected);
  });

  it('aria-selected=true on selectedDate, single mode', () => {
    const displayDate = new Date(2022, 2, 21);
    const selectedDate = new Date(2022, 2, 18);
    const { getByText } = render(
      <Calendar
        selectedDate={selectedDate}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode={mode}
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    expect(getByText('18').getAttribute('aria-selected')).toEqual('true');
    expect(getByText('21').getAttribute('aria-selected')).toBeNull();
  });
  it('aria-selected=true on selectedDate, range mode', () => {
    const displayDate = new Date(2022, 2, 21);
    const selectedDate = {
      start: new Date(2022, 2, 18),
      end: new Date(2022, 2, 23),
    };
    const { getByText } = render(
      <Calendar
        selectedDate={selectedDate}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode="range"
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    for (let i = 18; i < 24; i++) {
      expect(getByText(`${i}`).getAttribute('aria-selected')).toEqual('true');
    }
    expect(getByText('24').getAttribute('aria-selected')).toBeNull();
  });

  it("aria-current=date for today's date", () => {
    const displayDate = new Date();
    const { getByText } = render(
      <Calendar
        selectedDate={undefined}
        displayDate={displayDate}
        changeDate={mockChangeDate}
        mode="range"
        show={true}
        dayRefs={dayRefs}
        onChangeMonth={mockOnChangeMonth}
        handleTabPressOnCalendarBody={mockhandleTabPressOnCalendarBody}
      />
    );
    const day = new Date().getDate();
    expect(getByText(`${day}`).getAttribute('aria-current')).toEqual('date');
  });
});
