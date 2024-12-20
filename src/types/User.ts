import type {Article} from './Article';
import {EntityBase} from 'types/Entity';

export enum UserTypeId {
  AGENT = 'AGENT',
  STANDARD_USER = 'STANDARD_USER',
  REPORTER = 'REPORTER'
}

export interface UserType {
  id: keyof typeof UserTypeId;
}

export interface UserBase extends EntityBase {
  avatarUrl: string;
  fullName: string;
  login: string;
  name: string;
  ringId: string;
  userType: UserType;
}

export interface UserCC extends Omit<UserBase, 'id'> {
  email: string;
  id?: string;
  isReporter: boolean;
}

export interface UserHubCC extends EntityBase {
  guest: boolean;
  name: string;
  login: string;
  userType: {
    id: string;
  },
  profile: {
    avatar: {
      url: string;
    },
    email: {
      email: string
    }
  }
}

export interface UserHub {
  id: string;
  name: string;
  guest: boolean;
  banned: boolean;
  endUserAgreementConsent: {
    accepted: boolean;
  };
  profile: {
    avatar: {
      url: string;
    };
  };
}

export interface User extends UserBase {
  email: string;
  guest: boolean;
  banned: boolean;
  issueRelatedGroup?: IssueRelatedGroup;
  profiles: UserProfiles;
  endUserAgreementConsent?: {
    accepted: boolean;
  };
}

export type UserCurrent = UserHub & {
  ytCurrentUser?: User;
};
export type IssueRelatedGroup = {
  $type?: string;
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
  helpdesk: UserHelpdeskProfile;
};
export type UserAppearanceProfile = {
  $type?: string;
  exceptionsExpanded?: boolean;
  expandChangesInActivityStream?: boolean;
  firstDayOfWeek?: number;
  linksPanelExpanded?: boolean;
  naturalCommentsOrder?: boolean;
  showPropertiesOnTheLeft?: boolean;
  showSimilarIssues?: boolean;
  uiTheme?: string;
  useAbsoluteDates?: boolean;
  liteUiFilters?: string[];
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
  searchContext?: Folder | null;
  timezone: {
    id: string;
  };
  dateFieldFormat: UserProfileDateFieldFormat;
  star: {
    id: string;
  };
  locale: UserGeneralProfileLocale;
};

export interface UserHelpdeskProfile {
  isAgent: boolean;
  isReporter: boolean;
  helpdeskFolder?: Folder
  agentInProjects: {
    id: string;
  }[];
  reporterInProjects: {
    id: string;
  }[];
  ticketFilters: string[],
}

export interface Folder extends EntityBase {
  ringId: string;
  shortName: string;
  name: string;
  query: string;
  pinned: boolean;
  pinnedInHelpdesk: boolean;
  issuesUrl: string;
  fqFolderId?: string;
  isUpdatable: boolean;
  template: boolean;
  owner?: {
    id: string;
    ringId: string;
  };
}

export interface UserMentions {
  users: User[];
}
