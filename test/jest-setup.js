import {NativeModules} from 'react-native';

import * as mockLocalize from 'react-native-localize/mock.js';
import Adapter from 'enzyme-adapter-react-16';
import chai, {should} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiEnzyme from 'chai-enzyme';
import Enzyme from 'enzyme';
import log from '../src/components/log/log';
import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
import mockReanimated from 'react-native-reanimated/mock';
import sinonChai from 'sinon-chai';
import {
  mockReactNativeNotification,
} from './jest-mock__react-native-notifications';

Enzyme.configure({adapter: new Adapter()});

log.disableLog();

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);

should();


// Modules mocks

jest.mock('react-native-device-log', () => ({
  init: jest.fn(),
  InMemoryAdapter: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  options: {logToConsole: false},
}));

// RNDeviceInfo mock
NativeModules.RNDeviceInfo = {
  uniqueId: 'unique-id',
  userAgent: 'user-agent',
};

NativeModules.RNKeychainManager = {
  getInternetCredentialsForServer: jest.fn(),
  setInternetCredentialsForServer: jest.fn(),
};

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('react-native-reanimated', () => mockReanimated);

jest.mock('react-native-gesture-handler', () => ({}));

jest.mock('react-native-tab-view', () => ({}));

jest.mock('react-native-appearance', () => ({
  Appearance: {getColorScheme: () => 'light'},
}));

mockReactNativeNotification();

NativeModules.RNEncryptedStorage = {
  getItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
};

jest.mock('react-native-device-info', () => mockDeviceInfo);

jest.mock('react-native-localize', () => mockLocalize);

global.AbortController = jest.fn().mockReturnValue({
  signal: {},
  abort: jest.fn(),
});
