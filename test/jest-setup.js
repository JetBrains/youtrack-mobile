import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';

import log from 'components/log/log';
import {__setStorageState} from 'components/storage/storage';
import {buildStyles, DEFAULT_THEME} from 'components/theme/theme';
import {mockReactNativeNotification} from './jest-mock__react-native-notifications';

log.disableLog();

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

mockReactNativeNotification();

beforeAll(() => {
  buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME);
  __setStorageState({});
});


jest.mock('react-native-device-log', () => ({
  init: jest.fn(),
  InMemoryAdapter: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  options: {logToConsole: false},
}));

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-gesture-handler', () => ({}));

jest.mock('react-native-tab-view', () => ({}));


/*
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
}));
*/

jest.mock('react-native-device-info', () => mockDeviceInfo);

jest.mock('react-native-image-crop-picker', () => ({
  openCamera: jest.fn(),
  openPicker: jest.fn(),
}));

global.AbortController = jest.fn().mockReturnValue({
  signal: {},
  abort: jest.fn(),
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-document-picker', () => ({
  default: jest.fn(),
}));

jest.mock('react-native-document-picker', () => ({
  default: jest.fn(),
}));

jest.mock('react-native-webview', () => 'View');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => jest.fn().mockReturnValue({top: 0, right: 0, bottom: 0, left: 0}),
}));

jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => {
    return {
      logScreenView: jest.fn(),
      logEvent: jest.fn(),
    };
  }),
}));

