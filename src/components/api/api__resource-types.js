const resourceTypes = {
  ISSUE: 'jetbrains.charisma.persistent.Issue',
  ISSUE_COMMENT: 'jetbrains.charisma.persistent.IssueComment',

  VISIBILITY_LIMITED: 'jetbrains.charisma.persistent.visibility.LimitedVisibility',
  VISIBILITY_UNLIMITED: 'jetbrains.charisma.persistent.visibility.UnlimitedVisibility',
  VISIBILITY_GROUP: 'jetbrains.charisma.persistent.security.VisibilityGroups',

  USER: 'jetbrains.charisma.persistence.user.User',
  USER_GROUP: 'jetbrains.charisma.persistent.security.UserGroup'
};

export default resourceTypes;
