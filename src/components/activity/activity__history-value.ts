import {absDate} from 'components/date/date';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {getPeriodPresentationFor} from '../time-tracking/time-tracking';
import {getSimpleCustomFieldType} from '../custom-field/custom-field-helper';
import {hasType} from '../api/api__resource-types';
import {isActivityCategory} from './activity__category';

import type {WorkTimeSettings} from 'types/Work';
import {Project} from 'types/Project';

export type TextValueChangeParams = {
  activity: Record<string, any>;
  issueFields: Array<Record<string, any>> | null | undefined;
  workTimeSettings: WorkTimeSettings;
  isRemovedValue: boolean;
};
export function getTextValueChange(params: TextValueChangeParams): string {
  if (!params.activity) {
    return '';
  }

  const eventValue = params.isRemovedValue
    ? params.activity.removed
    : params.activity.added;

  if (!eventValue) {
    return getEmptyFieldValue(params.activity, params.issueFields).presentation;
  }

  const eventField = params.activity.field;
  const value = {
    presentation: eventValue,
  };

  switch (true) {
    case isActivityCategory.project(params.activity):
      value.presentation = getProjectPresentation(eventValue);
      break;

    case isActivityCategory.issueResolved(params.activity):
      value.presentation = absDate(eventValue);
      break;

    case isActivityCategory.attachment(params.activity) ||
      isActivityCategory.tag(params.activity):
      value.presentation = eventValue;
      break;
  }

  if (
    eventField &&
    eventField.customField &&
    isActivityCategory.customField(params.activity)
  ) {
    const simpleCustomFieldType = getSimpleCustomFieldType(
      eventField.customField,
    );
    setSimpleCustomFieldPresentationByType(
      simpleCustomFieldType,
      value,
      params.workTimeSettings,
    );
  }

  if (Array.isArray(value.presentation)) {
    value.presentation = value.presentation
      .map(getEntityPresentation)
      .join(', ');
  }

  return value.presentation;

  function setSimpleCustomFieldPresentationByType(
    simpleCustomFieldType,
    value,
    workTimeSettings: WorkTimeSettings,
  ) {
    const SIMPLE_CUSTOM_FIELDS_TYPES = {
      integer: 'integer',
      float: 'float',
      string: 'string',
      date: 'date',
      period: 'period',
      dateTime: 'date and time',
    };

    switch (simpleCustomFieldType) {
      case SIMPLE_CUSTOM_FIELDS_TYPES.period:
        value.presentation = getPeriodPresentationFor(
          eventValue,
          workTimeSettings,
        );
        break;

      case SIMPLE_CUSTOM_FIELDS_TYPES.date:
        value.presentation = absDate(eventValue);
        break;

      case SIMPLE_CUSTOM_FIELDS_TYPES.dateTime:
        value.presentation = absDate(eventValue);
        break;
    }
  }
}

function getEmptyFieldValue(activity, issueFields) {
  const NO_VALUE = {
    presentation: '?',
  };
  const LOST_EMPTY_VALUE = {
    presentation: '[Empty value]',
  };

  if (!activity.field) {
    return LOST_EMPTY_VALUE;
  }

  const prototypeId = (activity.field?.customField || {}).id;

  if (!prototypeId) {
    return NO_VALUE;
  }

  const foundFields = (issueFields || []).filter(
    issueField => issueField.projectCustomField.field.id === prototypeId,
  );

  if (foundFields.length && foundFields[0].projectCustomField.emptyFieldText) {
    return {
      presentation: foundFields[0].projectCustomField.emptyFieldText,
    };
  }

  return NO_VALUE;
}

function getProjectPresentation(value: Record<string, any>): string {
  const LOST_PROJECT_NAME: string = '[Lost project]';
  const project: Project | null = hasType.project(value)
    ? value
    : hasType.project(value?.project)
    ? value.project
    : null;
  return project?.name || LOST_PROJECT_NAME;
}
