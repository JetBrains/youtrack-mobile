export const ResourceTypes = {
  ISSUE: 'jetbrains.charisma.persistent.Issue',
  ISSUE_COMMENT: 'jetbrains.charisma.persistent.IssueComment',

  VISIBILITY_LIMITED: 'jetbrains.charisma.persistent.visibility.LimitedVisibility',
  VISIBILITY_UNLIMITED: 'jetbrains.charisma.persistent.visibility.UnlimitedVisibility',
  VISIBILITY_GROUP: 'jetbrains.charisma.persistent.security.VisibilityGroups',

  USER: 'jetbrains.charisma.persistence.user.User',
  USER_GROUP: 'jetbrains.charisma.persistent.security.UserGroup',
  USER_APPEARANCE_PROFILE: 'AppearanceUserProfile',

  EVENT_GROUP: 'jetbrains.youtrack.event.gaprest.ActivityItemGroup',
};


export const hasType = function(type: string) {
  return function(it: Object) {
    return it ? it.$type === type || it.$type === getShortEntityType(type) : false;
  };
};

hasType.comment = hasType(ResourceTypes.ISSUE_COMMENT);


export const addTypes = function(type: string) {
  return [].concat(type).concat(getShortEntityType(type));
};

export function getShortEntityType(type) {
  return type.split('.').pop();
}
