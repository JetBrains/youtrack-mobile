import type {Article} from './Article';
export type User = {
  $type: string;
  avatarUrl: string;
  email?: string;
  featureFlags?: FeatureFlags[];
  fullName?: string;
  name?: string;
  guest?: boolean;
  banned: boolean;
  id: string;
  issueRelatedGroup?: IssueRelatedGroup;
  login?: string;
  profiles?: UserProfiles;
  ringId?: string;
  endUserAgreementConsent?: {
    accepted: boolean;
    majorVersion: string;
    minorVersion: string;
  };
};
export type UserCurrent = User & {
  ytCurrentUser?: User;
};
export type IssueRelatedGroup = {
  $type: string;
  icon: string;
};
export type FeatureFlags = {
  $type: string;
  enabled: boolean;
  id: string;
};
export type UserProfiles = {
  $type: string;
  appearance?: UserAppearanceProfile;
  articles: UserArticlesProfile;
  general: UserGeneralProfile;
  issuesList?: Record<string, any>;
  notifications?: Record<string, any>;
  teamcity?: Record<string, any>;
  timetracking?: Record<string, any>;
};
export type UserAppearanceProfile = {
  $type: string;
  exceptionsExpanded?: boolean;
  expandChangesInActivityStream?: boolean;
  firstDayOfWeek?: number;
  linksPanelExpanded?: boolean;
  naturalCommentsOrder?: boolean;
  showPropertiesOnTheLeft?: boolean;
  showSimilarIssues?: boolean;
  uiTheme?: string;
  useAbsoluteDates?: boolean;
};
export type UserArticlesProfile = {
  $type?: string;
  lastVisitedArticle?: Partial<Article>;
  showComment?: boolean;
  showHistory?: boolean;
};
export type UserProfileDateFieldFormat = {
  dateNoYearPattern: string;
  datePattern: string;
  pattern: string;
};
export interface UserGeneralProfileLocale {
  language: string;
  locale: string;
}
export type UserGeneralProfile = {
  $type: string;
  id: string;
  searchContext?: Folder | null | undefined;
  timezone: {
    id: string;
  };
  dateFieldFormat: UserProfileDateFieldFormat;
  star: {
    id: string;
  };
  locale: UserGeneralProfileLocale;
};
export type Folder = {
  $type: string;
  id: string | null | undefined;
  ringId: string | null | undefined;
  shortName: string | null | undefined;
  name: string | null | undefined;
  query: string | null | undefined;
  pinned: string | null | undefined;
  issuesUrl: string | null | undefined;
  fqFolderId?: string | null | undefined;
  isUpdatable: string | null | undefined;
  template: boolean;
};
