export type User = {
  $type: string,
  avatarUrl?: string,
  email?: string,
  featureFlags?: Array<FeatureFlags>,
  fullName?: string,
  guest?: boolean,
  id: string,
  issueRelatedGroup?: IssueRelatedGroup,
  login?: string,
  profiles?: Array<UserProfile>,
  ringId?: string
};

export type IssueRelatedGroup = {
  $type: string,
  icon: string
}

export type FeatureFlags = {
  $type: string,
  enabled: boolean,
  id: string
}


export type UserProfile = {
  $type: string,
  appearance?: UserAppearanceProfile,
  general?: Object,
  issuesList?: Object,
  notifications?: Object,
  teamcity?: Object,
  timetracking?: Object
}

export type UserAppearanceProfile = {
  $type: string,
  exceptionsExpanded?: boolean,
  expandChangesInActivityStream?: boolean,
  firstDayOfWeek?: number,
  linksPanelExpanded?: boolean,
  naturalCommentsOrder?: boolean,
  showPropertiesOnTheLeft?: boolean,
  showSimilarIssues?: boolean,
  uiTheme?: string,
  useAbsoluteDates?: boolean
}