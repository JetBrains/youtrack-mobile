/* @flow */

export const ResourceTypes = {
  ISSUE: 'jetbrains.charisma.persistent.Issue',
  ISSUE_COMMENT: 'jetbrains.charisma.persistent.IssueComment',

  PROJECT: 'jetbrains.charisma.persistent.Project',

  ISSUE_FOLDER_SAVED_QUERY: 'jetbrains.charisma.persistent.issueFolders.SavedQuery',
  ISSUE_FOLDER_TAG: 'jetbrains.charisma.persistent.issueFolders.IssueTag',

  VISIBILITY_LIMITED: 'jetbrains.charisma.persistent.visibility.LimitedVisibility',
  VISIBILITY_UNLIMITED: 'jetbrains.charisma.persistent.visibility.UnlimitedVisibility',
  VISIBILITY_GROUP: 'jetbrains.charisma.persistent.security.VisibilityGroups',

  USER: 'jetbrains.charisma.persistence.user.User',
  USER_GROUP: 'jetbrains.charisma.persistent.security.UserGroup',
  USER_APPEARANCE_PROFILE: 'AppearanceUserProfile',
  USER_GENERAL_PROFILE: 'GeneralUserProfile',

  EVENT_GROUP: 'jetbrains.youtrack.event.gaprest.ActivityItemGroup',
  AGILE: 'jetbrains.youtrack.agile.settings.Agile',
};

type HasMethodName = 'comment' | 'user' | 'userGroup' | 'project' | 'savedSearch' | 'tag' | 'agile';
type Entity = $Shape<{ $type: string }>;

export const hasType: Object = function (type: string) {
  return function (it: Entity): boolean {
    return it ? it.$type === type || it.$type === getShortEntityType(type) : false;
  };
};

hasType.comment = hasType(ResourceTypes.ISSUE_COMMENT);
hasType.user = hasType(ResourceTypes.USER);
hasType.userGroup = hasType(ResourceTypes.USER_GROUP);
hasType.project = hasType(ResourceTypes.PROJECT);
hasType.savedSearch = hasType(ResourceTypes.ISSUE_FOLDER_SAVED_QUERY);
hasType.tag = hasType(ResourceTypes.ISSUE_FOLDER_TAG);
hasType.agile = hasType(ResourceTypes.ISSUE_FOLDER_TAG);


export function filterArrayByType(array: Array<Entity>, methodName: HasMethodName): Array<Entity> {
  return (array || []).filter((it: Entity) => hasType[methodName] && hasType[methodName](it));
}


export const addTypes = function (type: string): Array<string> {
  return [].concat(type).concat(getShortEntityType(type));
};

export function getShortEntityType(type: string): string {
  return type.split('.').pop();
}
