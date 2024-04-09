import {i18n} from 'components/i18n/i18n';

export const DATE_AND_TIME_FIELD_VALUE_TYPE = 'date and time';

export const customFieldPlaceholders = {
  integer: '-12 or 34',
  string: 'Type value',
  text: 'Type text value',
  float: 'Type float value',
  default: '1w 1d 1h 1m',
};

export const getProjectLabel = () => i18n('Project');

export const customFieldValueFormatters = {
  integer: (v: string) => parseInt(v, 10),
  float: (v: string) => parseFloat(v),
  string: (v: string) => v,
  text: (v: string) => ({text: v}),
  default: (v: string) => ({presentation: v}),
};
