/* @flow */

import {TIME_IDENTIFIERS, DEFAULT_WORK_TIME_SETTINGS, getPeriodName} from './time-tracking__default-settings';
import type {WorkTimeSettings} from '../../flow/WorkTimeSettings';

export function getPeriodPresentationFor(minutes: number, workTimeSettings: WorkTimeSettings, fullPeriodPresentation: boolean = false) {
  const period = minutesToPeriod(minutes, workTimeSettings || DEFAULT_WORK_TIME_SETTINGS);
  return getPeriodPresentation(period, fullPeriodPresentation);
}

export function minutesAndHoursFor(duration: Object) {
  function totalMinutes(d = {}) {
    return d.value || d.minutes || 0;
  }

  return {
    minutes: () => {
      const minutes = Math.floor(totalMinutes(duration) % 60);
      return `${Math.floor(minutes / 10) || '0' }${ minutes % 10 || '0' }${TIME_IDENTIFIERS.minutes}`;
    },
    hours: () => {
      const hours = Math.floor(totalMinutes(duration) / 60);
      return hours ? hours + TIME_IDENTIFIERS.hours : '';
    }
  };
}

function getPeriodPresentation(period, fullPeriodPresentation) {
  const getPeriodPartPresentation = (value, id) => (
    `${value}${fullPeriodPresentation ? getPeriodLocalizedName(value, id) : id} `
  );

  const periodPresentationArray = TIME_IDENTIFIERS.asArray.map((timeIntervalId, index) => {
    const timeIntervalValue = period.asArray[index];
    if (timeIntervalValue > 0) {
      return getPeriodPartPresentation(timeIntervalValue, timeIntervalId);
    } else {
      return '';
    }
  });

  return periodPresentationArray.join('') || (`0${ TIME_IDENTIFIERS.minutes}`);


  function getPeriodLocalizedName(amount, timeIntervalId) {
    return amount > 0 && getPeriodName(timeIntervalId, amount > 1) || '';
  }
}

function minutesToPeriod(minutes: number, workTimeSettings: WorkTimeSettings) {
  return toPeriod(minutes, workTimeSettings);

  function toPeriod(minutesInPeriod, workTimeSettings: WorkTimeSettings) {
    const daysInPeriod = Math.floor(minutesInPeriod / workTimeSettings.minutesADay);
    const dayRemainingMinutes = minutesInPeriod % workTimeSettings.minutesADay;

    const weeks = Math.floor(daysInPeriod / workTimeSettings.daysAWeek);
    const days = daysInPeriod % workTimeSettings.daysAWeek;
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
