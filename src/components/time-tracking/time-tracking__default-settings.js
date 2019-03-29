/* @flow */

export const TIME_IDENTIFIERS = {
  weeks: 'w',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  asArray: ['w', 'd', 'h', 'm']
};

export const DEFAULT_WORK_TIME_SETTINGS = {
  id: 0,
  daysAWeek: 5,
  minutesADay: 480,
  workDays: [1, 2, 3, 4, 5]
};

const singleKey = '=1';
const multipleKey = '=other';
export const PERIOD_FORMATS = {
  m: {
    [singleKey]: 'minute',
    [multipleKey]: 'minutes'
  },
  h: {
    [singleKey]: 'hour',
    [multipleKey]: 'hours'
  },
  d: {
    [singleKey]: 'day',
    [multipleKey]: 'days'
  },
  w: {
    [singleKey]: 'week',
    [multipleKey]: 'weeks'
  }
};

export function getPeriodName(key: string, isPlural: ?boolean) {
  return PERIOD_FORMATS[key][isPlural ? multipleKey : singleKey];
}
