/* @flow */

export type NotificationCompletion = { // TS interfaces that are used in `react-native-notifications-latest` module
  badge?: boolean;
  alert?: boolean;
  sound?: boolean;
}

export type Token = string | null | typeof undefined;

export type TokenHandler = (token: string) => void;

export type NotificationRouteData = { issueId?: string, backendUrl?: string };
