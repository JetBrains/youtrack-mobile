export const TIME_IDENTIFIERS = {
  weeks: 'w',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  asArray: ['w', 'd', 'h', 'm'],
};
export const DEFAULT_WORK_TIME_SETTINGS = {
  id: '0',
  daysAWeek: 5,
  minutesADay: 480,
  workDays: [1, 2, 3, 4, 5],
};
const singleKey = '=1';
const multipleKey = '=other';
export const PERIOD_FORMATS = {
  m: {
    [singleKey]: 'minute',
    [multipleKey]: 'minutes',
  } as {
    '=1': string;
    '=other': string;
  },
  h: {
    [singleKey]: 'hour',
    [multipleKey]: 'hours',
  } as {
    '=1': string;
    '=other': string;
  },
  d: {
    [singleKey]: 'day',
    [multipleKey]: 'days',
  } as {
    '=1': string;
    '=other': string;
  },
  w: {
    [singleKey]: 'week',
    [multipleKey]: 'weeks',
  } as {
    '=1': string;
    '=other': string;
  },
};
export function getPeriodName(
  key: string,
  isPlural: boolean | null | undefined,
): any {
  return PERIOD_FORMATS[key][isPlural ? multipleKey : singleKey];
}
