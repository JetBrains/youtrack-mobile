export type NotificationCompletion = { // TS interfaces that are used in `react-native-notifications-latest` module
  badge?: boolean;
  alert?: boolean;
  sound?: boolean;
}

export type Token = string | null | undefined;

export type TokenHandler = (token: string) => void;
