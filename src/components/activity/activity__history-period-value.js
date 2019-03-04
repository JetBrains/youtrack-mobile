/* @flow */

export function minutesToPeriodFieldValuePresentation(minutes: number, fullPeriodPresentation: boolean = false) {
  const period = minutesToPeriod(minutes);
  return periodToPresentation(period, fullPeriodPresentation);
}

export function periodPresentation(duration: Object) {
  function totalMinutes(d = {}) {
    return d.value || d.minutes || 0;
  }

  return {
    minutes: () => {
      const minutes = Math.floor(totalMinutes(duration) % 60);
      return `${Math.floor(minutes / 10) || '0' }${ minutes % 10 || '0' }m`;
    },
    hours: () => {
      const hours = Math.floor(totalMinutes(duration) / 60);
      return hours ? (`${hours }h`) : '';
    }
  };
}


function getPeriodLocalizedName(amount, timeIntervalId) {
  const periodFullName = {
    m: {'=1': 'minute', '=other': 'minutes'},
    h: {'=1': 'hour', '=other': 'hours'},
    d: {'=1': 'day', '=other': 'days'},
    w: {'=1': 'week', '=other': 'weeks'}
  };
  let name = '';
  if (amount === 1) {
    name = periodFullName[timeIntervalId]['=1'];
  }

  if (amount > 1) {
    name = periodFullName[timeIntervalId]['=other'];
  }

  return name;
}

function periodToPresentation(period, fullPeriodPresentation) {
  const timeIdentifiers = {minutes: 'm', hours: 'h', days: 'd', weeks: 'w', asArray: ['w', 'd', 'h', 'm']};
  const getPeriodPartPresentation = (value, id) => (
    value + (fullPeriodPresentation ? ` ${ getPeriodLocalizedName(value, id) } ` : id)
  );

  const periodPresentationArray = timeIdentifiers.asArray.map((timeIntervalId, index) => {
    const timeIntervalValue = period.asArray[index];
    if (timeIntervalValue > 0) {
      return getPeriodPartPresentation(timeIntervalValue, timeIntervalId);
    } else {
      return '';
    }
  });
  return periodPresentationArray.join('') || (`0${ timeIdentifiers.minutes}`);
}

function minutesToPeriod(minutes: number) {
  return toPeriod(minutes, getTimeTrackingSettings());

  function toPeriod(minutesInPeriod, timeTrackingSettings) {
    const daysInPeriod = Math.floor(minutesInPeriod / timeTrackingSettings.minutesADay);
    const dayRemainingMinutes = minutesInPeriod % timeTrackingSettings.minutesADay;

    const weeks = Math.floor(daysInPeriod / timeTrackingSettings.daysAWeek);
    const days = daysInPeriod % timeTrackingSettings.daysAWeek;
    const hours = Math.floor(dayRemainingMinutes / 60);
    const minutes = dayRemainingMinutes % 60;

    return {
      weeks: weeks,
      days: days,
      hours: hours,
      minutes: minutes,
      asArray: [weeks, days, hours, minutes]
    };
  }
}

function getTimeTrackingSettings(timeTrackingSettings) {
  const DEFAULT_TIME_TRACKING_SETTINGS = {
    id: 0,
    daysAWeek: 5,
    minutesADay: 480,
    workDays: [1, 2, 3, 4, 5]
  };

  return timeTrackingSettings || DEFAULT_TIME_TRACKING_SETTINGS;
}
