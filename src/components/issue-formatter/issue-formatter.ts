import type {AnyIssue} from 'types/Issue';
import type {CustomField} from 'types/CustomFields';
import type {Article} from 'types/Article';

function findIssueField(
  issue: AnyIssue,
  predicate: (field: CustomField) => boolean,
): CustomField | null | undefined {
  const fields: CustomField[] = issue.fields || [];

  for (const field of fields) {
    if (predicate(field)) {
      return field;
    }
  }

  return null;
}

function getPriotityField(issue: AnyIssue): CustomField | null | undefined {
  return findIssueField(issue, field => {
    const fieldName: string | null | undefined =
      field?.projectCustomField?.field?.name;
    return !!fieldName && fieldName.toLowerCase() === 'priority';
  });
}

function getAssigneeField(issue: AnyIssue): CustomField | null | undefined {
  const PRIORITY_FIELDS = ['Assignee', 'Assignees'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getReadableID(entity: AnyIssue | Article): string {
  return (!!entity && (entity.idReadable || entity.id)) || '';
}

function getEntityPresentation(entity?: Record<string, any>): string {
  let userName: string = '';

  if (entity) {
    if (!entity.ringId) {
      userName = entity.localizedName || entity.name || entity.userName || entity.login;
    }

    if (!userName) {
      userName =
        entity.fullName ||
        entity.localizedName ||
        entity.name ||
        entity.login ||
        entity.presentation ||
        entity.text;
    }
  }

  return userName || '';
}

function getVisibilityPresentation(entity: Record<string, any>): null | string {
  if (!entity) {
    return null;
  }

  const visibility = entity.visibility || {};
  return []
    .concat(visibility.permittedGroups || [])
    .concat(visibility.permittedUsers || [])
    .map(it => getEntityPresentation(it))
    .join(', ');
}

export {
  getPriotityField,
  getAssigneeField,
  getReadableID,
  getVisibilityPresentation,
  getEntityPresentation,
};
