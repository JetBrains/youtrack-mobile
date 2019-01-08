/* @flow */

import {isActivityCategory} from './activity__category';
import {relativeDate, getReadableID, formatDate, getEntityPresentation} from '../issue-formatter/issue-formatter';


export default function getActivityHistorySingleValue(event: Object, isRemovedEventValue: boolean = false): Object {
  if (!event) {
    return {};
  }

  const eventValue = isRemovedEventValue ? event.removed : event.added;

  if (!eventValue) {
    return getEmptyFieldValue(event);
  }

  const eventField = event.field;
  const value = {
    presentation: eventValue
  };
  const types = getTypes(event);

  switch(true) {
  case types.project:
    value.presentation = getProjectPresentation(eventValue);
    break;
  case types.link:
    value.presentation = getLinkPresentation(eventValue);
    break;
  case types.date:
    value.presentation = relativeDate(eventValue);
    break;
  case types.attachment:
    value.presentation = eventValue.localizedName || eventValue.name;
    break;
  }

  if (eventField && types.customField) {
    const simpleCustomFieldType = getSimpleCustomFieldType(eventField.customField);
    setSimpleCustomFieldPresentationByType(simpleCustomFieldType, value);
  }

  if (Array.isArray(value.presentation)) {
    value.presentation = value.presentation.map(getEntityPresentation).join('');
  }

  return value;


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
      // value.presentation = getDatePresentation(eventValue); //TODO
      value.presentation = formatDate(eventValue.timestamp);
      break;
    case SIMPLE_CUSTOM_FIELDS_TYPES.dateTime:
      // value.presentation = getDateTimePresentation(eventValue); //TODO
      value.presentation = formatDate(eventValue.timestamp);
      break;
    }
  }

}

function getTypes(activity: Object): Object {
  return {
    attachment: isActivityCategory.attachment(activity),
    comment: isActivityCategory.comment(activity),
    link: isActivityCategory.link(activity),
    tag: isActivityCategory.tag(activity),
    summary: isActivityCategory.summary(activity),
    description: isActivityCategory.description(activity),
    sprint: isActivityCategory.sprint(activity),
    date: isActivityCategory.date(activity),
    project: isActivityCategory.project(activity),
    customField: isActivityCategory.customField(activity),
    work: isActivityCategory.work(activity),
    visibility: isActivityCategory.visibility(activity)
  };
}

function getSimpleCustomFieldType(customField) {
  if (!customField) {
    return null;
  }
  const fieldType = (customField.field && customField.field.fieldType) || customField.fieldType;
  return fieldType && fieldType.valueType;
}

function getEmptyFieldValue(activity) {
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

  const foundFields = (activity.target.fields || []).filter(function (issueField) { //TODO: check that here we got all issue fields in target!!!
    return issueField.projectCustomField.field.id === prototypeId;
  });
  if (foundFields.length && foundFields[0].projectCustomField.emptyFieldText) {
    return {
      presentation: foundFields[0].projectCustomField.emptyFieldText
    };
  }
  return NO_VALUE;
}

function getProjectPresentation(data: Object) {
  const issuePresentation = getReadableID(data);
  if (issuePresentation) {
    return `${data.project.name }, ${ issuePresentation}`;
  }
  return '';
}

function getLinkPresentation(data) {
  const issuePresentation = getReadableID(data);
  if (issuePresentation) {
    return `${issuePresentation }: ${ data.summary}`;
  }
  return data.summary;
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
    const getPeriodPartPresentation = function (value, id) {
      return value + (fullPeriodPresentation ? ` ${ getPeriodLocalizedName(value, id) } ` : id);
    };

    const periodPresentationArray = timeIdentifiers.asArray.map(function (timeIntervalId, index) {
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
