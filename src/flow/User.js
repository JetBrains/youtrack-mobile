export type User = {
  $type: string,
  avatarUrl?: string,
  email?: string,
  featureFlags?: Array<FeatureFlags>,
  fullName?: string,
  name?: string,
  guest?: boolean,
  id: string,
  issueRelatedGroup?: IssueRelatedGroup,
  login?: string,
  profiles?: Array<UserProfile | UserGeneralProfile | UserAppearanceProfile>,
  ringId?: string,
  endUserAgreementConsent?: {
    accepted: boolean,
    majorVersion: string,
    minorVersion: string
  }
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
  general?: UserGeneralProfile,
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

export type UserGeneralProfile = {
  $type: string,
  id: string,
  searchContext?: Folder,
}

export type Folder = {
  $type: string,
  id: ?string,
  shortName: ?string,
  name: ?string,
  query: ?string,
  pinned: ?string,
  issuesUrl: ?string,
  fqFolderId: ?string,
  isUpdatable: ?string
}
