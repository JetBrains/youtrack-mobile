import {RegistrationError} from 'react-native-notifications';

export type NotificationCompletion = {
  badge?: boolean;
  alert?: boolean;
  sound?: boolean;
};
export type Token = string | null | typeof undefined;
export type TokenHandler = (token: RegistrationError | string) => void;
export type NotificationRouteData = {
  issueId?: string;
  articleId?: string;
  backendUrl?: string;
  navigateToActivity?: string;
};
