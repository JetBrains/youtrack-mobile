/* @flow */

import type {Article} from './Article';

export type User = {
  $type: string,
  avatarUrl: string | null,
  email?: string,
  featureFlags?: Array<FeatureFlags>,
  fullName?: string,
  name?: string,
  guest?: boolean,
  banned: boolean,
  id: string,
  issueRelatedGroup?: IssueRelatedGroup,
  login?: string,
  profiles?: UserProfiles,
  ringId?: string,
  endUserAgreementConsent?: {
    accepted: boolean,
    majorVersion: string,
    minorVersion: string,
  },
};

export type UserCurrent = User & {
  ytCurrentUser?: User
}

export type IssueRelatedGroup = {
  $type: string,
  icon: string
}

export type FeatureFlags = {
  $type: string,
  enabled: boolean,
  id: string,
}


export type UserProfiles = {
  $type: string,
  appearance?: UserAppearanceProfile,
  articles: UserArticlesProfile,
  general: UserGeneralProfile,
  issuesList?: Object,
  notifications?: Object,
  teamcity?: Object,
  timetracking?: Object,
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
  useAbsoluteDates?: boolean,
}

export type UserArticlesProfile = {
  $type?: string,
  lastVisitedArticle?: $Shape<Article>,
  showComment?: boolean,
  showHistory?: boolean,
}

export type UserProfileDateFieldFormat = {
  dateNoYearPattern: string,
  datePattern: string,
  pattern: string,
};

export interface UserGeneralProfileLocale {
  language: string;
  locale: string;
}

export type UserGeneralProfile = {
  $type: string,
  id: string,
  searchContext?: ?Folder,
  timezone: {
    id: string,
  },
  dateFieldFormat: UserProfileDateFieldFormat,
  star: {
    id: string,
  },
  locale: UserGeneralProfileLocale,
}

export type Folder = {
  $type: string,
  id: ?string,
  ringId: ?string,
  shortName: ?string,
  name: ?string,
  query: ?string,
  pinned: ?string,
  issuesUrl: ?string,
  fqFolderId?: ?string,
  isUpdatable: ?string,
  template: boolean,
}
