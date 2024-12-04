import {isSLAField} from 'components/custom-field/custom-field-helper';

import type {AnyIssue, IssueFull, IssueOnList, ListIssueField} from 'types/Issue';
import type {Article} from 'types/Article';
import type {CustomField, CustomFieldBase} from 'types/CustomFields';

function findIssueField(
  issue: AnyIssue,
  predicate: (field: CustomFieldBase | CustomField | ListIssueField) => boolean
) {
  const fields = issue.fields || [];

  for (const field of fields) {
    if (predicate(field)) {
      return field;
    }
  }

  return null;
}

function getPriorityField(issue: AnyIssue) {
  return findIssueField(issue, field => {
    const fieldName: string | null | undefined = field?.projectCustomField?.field?.name;
    return !!fieldName && fieldName.toLowerCase() === 'priority';
  });
}

function getSLAFields(issue: IssueOnList) {
  return (issue.fields || []).filter(isSLAField);
}

function getAssigneeField(issue: AnyIssue) {
  const PRIORITY_FIELDS = ['Assignee', 'Assignees'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getReadableID(entity: IssueOnList | IssueFull | Article) {
  return (!!entity && entity?.idReadable) || '';
}

function getEntityPresentation<T extends {[key: string]: any}>(entity?: T) {
  let userName: string = '';

  if (entity) {
    if (!entity.ringId) {
      userName = entity.localizedName || entity.name || entity.userName || entity.login;
    }

    if (!userName) {
      userName =
        entity.fullName || entity.localizedName || entity.name || entity.login || entity.presentation || entity.text;
    }
  }

  return userName || '';
}

const getVisibilityPresentation = (entity: Record<string, any>) => {
  if (!entity) {
    return null;
  }

  const visibility = entity.visibility || {};
  return []
    .concat(visibility.permittedGroups || [])
    .concat(visibility.permittedUsers || [])
    .map(it => getEntityPresentation(it))
    .join(', ');
};

export {
  getPriorityField,
  getAssigneeField,
  getReadableID,
  getVisibilityPresentation,
  getEntityPresentation,
  getSLAFields,
};
