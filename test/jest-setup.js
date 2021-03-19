import ReactNative from 'react-native';
import chai, {should} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import log from '../src/components/log/log';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import chaiEnzyme from 'chai-enzyme';
import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import mockReanimated from 'react-native-reanimated/mock';
import mockReactNativeNotification from './jest-mock__react-native-notifications';

Enzyme.configure({adapter: new Adapter()});

log.disableLog();

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);

should();


// Modules mocks

// RNDeviceInfo mock
ReactNative.NativeModules.RNDeviceInfo = {
  uniqueId: 'unique-id',
  userAgent: 'user-agent'
};

ReactNative.NativeModules.RNKeychainManager = {
  getInternetCredentialsForServer: jest.fn(),
  setInternetCredentialsForServer: jest.fn()
};

jest.mock('bugsnag-react-native', () => {
  return {
    Client: jest.fn(() => ({notify: jest.fn()})),
    Configuration: jest.fn()
  };
});

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('react-native-reanimated', () => mockReanimated);

jest.mock('react-native-gesture-handler', () => ({}));

jest.mock('react-native-tab-view', () => ({}));

jest.mock('react-native-appearance', () => ({
  Appearance: {getColorScheme: () => 'light'}
}));

jest.mock('StatusBar', () => ({
  addListener: jest.fn()
}));

// react-native-notification mock
mockReactNativeNotification();
