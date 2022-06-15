/* @flow */

import type {AnyIssue} from 'flow/Issue';
import type {CustomField} from 'flow/CustomFields';
import type {Article} from 'flow/Article';


function findIssueField(issue: AnyIssue, predicate: (field: CustomField) => boolean): ?CustomField {
  const fields: Array<CustomField> = issue.fields || [];

  for (const field of fields) {
    if (predicate(field)) {
      return field;
    }
  }

  return null;
}

function getPriotityField(issue: AnyIssue): ?CustomField {
  return findIssueField(issue, field => {
    const fieldName: ?string = field?.projectCustomField?.field?.name;
    return !!fieldName && fieldName.toLowerCase() === 'priority';
  });
}

function getAssigneeField(issue: AnyIssue): ?CustomField {
  const PRIORITY_FIELDS = ['Assignee', 'Assignees'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getReadableID(entity: AnyIssue | Article): string {
  return !!entity && (entity.idReadable || entity.id) || '';
}

function getEntityPresentation(entity: Object): any | string {
  let userName: string = '';
  if (entity) {
    if (!entity.ringId) {
      userName = entity.localizedName || entity.name || entity.userName || entity.login;
    }
    if (!userName) {
    userName = entity.fullName || entity.localizedName || entity.name || entity.login || entity.presentation || entity.text;
    }
  }
  return userName || '';
}

function getVisibilityPresentation(entity: Object): null | string {
  if (!entity) {
    return null;
  }

  const visibility = entity.visibility || {};
  return (
    [].concat(visibility.permittedGroups || [])
      .concat(visibility.permittedUsers || [])
      .map(it => getEntityPresentation(it))
      .join(', ')
  );
}

export {
  getPriotityField,
  getAssigneeField,
  getReadableID,
  getVisibilityPresentation,
  getEntityPresentation,
};
