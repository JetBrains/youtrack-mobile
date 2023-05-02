export type NotificationCompletion = {
  // TS interfaces that are used in `react-native-notifications` module
  badge?: boolean;
  alert?: boolean;
  sound?: boolean;
};
export type Token = string | null | typeof undefined;
export type TokenHandler = (token: string) => void;
export type NotificationRouteData = {
  issueId: string | undefined;
  backendUrl: string | undefined;
  navigateToActivity: string | undefined;
};
