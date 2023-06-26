import Adapter from 'enzyme-adapter-react-16';
import chai, {should} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiEnzyme from 'chai-enzyme';
import Enzyme from 'enzyme';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
import sinonChai from 'sinon-chai';

import log from 'components/log/log';
import {__setStorageState} from 'components/storage/storage';
import {buildStyles, DEFAULT_THEME} from 'components/theme/theme';
import {mockReactNativeNotification} from './jest-mock__react-native-notifications';

import * as ReactNative from 'react-native';


Enzyme.configure({adapter: new Adapter()});

log.disableLog();

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);
should();

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


jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
}));

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

jest.doMock('react-native', () => {
  return Object.setPrototypeOf(
    ReactNative,
    {
      NativeModules: {
        ...ReactNative.NativeModules,
        Linking: {
          getInitialURL: jest.fn(),
          addEventListener: jest.fn(),
        },
      },
    },
  );
});
