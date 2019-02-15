/* @flow */

import {isActivityCategory} from './activity__category';
import {relativeDate, getReadableID, formatDate, getEntityPresentation} from '../issue-formatter/issue-formatter';
import {minutesToPeriodFieldValuePresentation} from './activity__history-period-value';

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
