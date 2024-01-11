import type {AnyIssue, IssueFull, IssueOnList} from 'types/Issue';
import type {Article} from 'types/Article';
import type {CustomFieldBase} from 'types/CustomFields';

function findIssueField(
  issue: AnyIssue,
  predicate: (field: CustomFieldBase) => boolean,
): CustomFieldBase | null {
  const fields = issue.fields || [];

  for (const field of fields) {
    if (predicate(field)) {
      return field;
    }
  }

  return null;
}

function getPriorityField(issue: AnyIssue): CustomFieldBase | null {
  return findIssueField(issue, field => {
    const fieldName: string | null | undefined = field?.projectCustomField?.field?.name;
    return !!fieldName && fieldName.toLowerCase() === 'priority';
  });
}

function getPausedTime(issue: IssueOnList): CustomFieldBase[] {
  return (issue.fields || []).filter(it => it.pausedTime);
}

function getSLAFields(issue: IssueOnList): CustomFieldBase[] {
  return [
    ...getPausedTime(issue),
  ];
}

function getAssigneeField(issue: AnyIssue): CustomFieldBase | null {
  const PRIORITY_FIELDS = ['Assignee', 'Assignees'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getReadableID(entity: IssueOnList | IssueFull | Article): string {
  return (!!entity && entity?.idReadable) || '';
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
  getPriorityField,
  getAssigneeField,
  getReadableID,
  getVisibilityPresentation,
  getEntityPresentation,
  getSLAFields,
};
