/* @flow */

import type {AnyIssue} from 'flow/Issue';
import type {CustomField} from 'flow/CustomFields';
import type {User} from 'flow/User';


function getForText(assignee: User | Array<User>): string {
  if (Array.isArray(assignee) && assignee.length > 0) {
    return assignee
      .map(it => getForText(it))
      .join(', ');
  }
  if (assignee && !Array.isArray(assignee)) {
    return `for ${getEntityPresentation(assignee)}`;
  }
  return '    Unassigned';
}

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

function getReadableID(issue: AnyIssue): string {
  return !!issue && (issue.idReadable || issue.id) || '';
}

function getEntityPresentation(entity: Object): any | string {
  let userName: string = '';
  if (entity) {
    if (!entity.ringId) {
      userName = entity.name || entity.userName || entity.login;
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
  getForText,
  getPriotityField,
  getAssigneeField,
  getReadableID,
  getVisibilityPresentation,
  getEntityPresentation,
};
