/* @flow */

import {isActivityCategory} from './activity__category';
import {relativeDate, getReadableID, formatDate, getEntityPresentation} from '../issue-formatter/issue-formatter';

export function getTextValueChange(event: Object, issueFields: Array<Object>, isRemovedValue: boolean = false): string {
  if (!event) {
    return '';
  }

  const eventValue = isRemovedValue ? event.removed : event.added;

  if (!eventValue) {
    return getEmptyFieldValue(event, issueFields).presentation;
  }

  const eventField = event.field;
  const value = {
    presentation: eventValue
  };

  switch (true) {
  case isActivityCategory.project(event):
    value.presentation = getProjectPresentation(eventValue);
    break;
  case isActivityCategory.date(event):
    value.presentation = relativeDate(eventValue);
    break;
  case isActivityCategory.attachment(event) || isActivityCategory.tag(event):
    value.presentation = eventValue;
    break;
  }

  if (eventField && isActivityCategory.customField(event)) {
    const simpleCustomFieldType = getSimpleCustomFieldType(eventField.customField);
    setSimpleCustomFieldPresentationByType(simpleCustomFieldType, value);
  }

  if (Array.isArray(value.presentation)) {
    value.presentation = value.presentation.map(getEntityPresentation).join(', ');
  }

  return value.presentation;


  function setSimpleCustomFieldPresentationByType(simpleCustomFieldType, value) {
    const SIMPLE_CUSTOM_FIELDS_TYPES = {
      integer: 'integer',
      float: 'float',
      string: 'string',
      date: 'date',
      period: 'period',
      dateTime: 'date and time'
    };

    switch (simpleCustomFieldType) {
    case SIMPLE_CUSTOM_FIELDS_TYPES.period:
      value.presentation = minutesToPeriodFieldValuePresentation(eventValue);
      break;
    case SIMPLE_CUSTOM_FIELDS_TYPES.date:
      value.presentation = formatDate(eventValue);
      break;
    case SIMPLE_CUSTOM_FIELDS_TYPES.dateTime:
      value.presentation = formatDate(eventValue);
      break;
    }
  }

}

function getSimpleCustomFieldType(customField) {
  if (!customField) {
    return null;
  }
  const fieldType = (customField.field && customField.field.fieldType) || customField.fieldType;
  return fieldType && fieldType.valueType;
}

function getEmptyFieldValue(activity, issueFields) {
  const NO_VALUE = {
    presentation: 'None'
  };
  const LOST_EMPTY_VALUE = {
    presentation: '[Empty value]'
  };
  if (!activity.field) {
    return LOST_EMPTY_VALUE;
  }
  const prototypeId = (activity.field.customField || {}).id;
  if (!prototypeId) {
    return NO_VALUE;
  }

  const foundFields = (issueFields || []).filter(
    issueField => issueField.projectCustomField.field.id === prototypeId
  );
  if (foundFields.length && foundFields[0].projectCustomField.emptyFieldText) {
    return {
      presentation: foundFields[0].projectCustomField.emptyFieldText
    };
  }
  return NO_VALUE;
}

function getProjectPresentation(value: Object) {
  const issuePresentation = getReadableID(value);
  if (issuePresentation) {
    return `${value.project.name }, ${ issuePresentation}`;
  }
  return '';
}

function minutesToPeriodFieldValuePresentation(minutes, fullPeriodPresentation) {
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

  const periodToPresentation = function (period, fullPeriodPresentation) {
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
  };

  const period = minutesToPeriod(minutes);
  return periodToPresentation(period, fullPeriodPresentation);
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
