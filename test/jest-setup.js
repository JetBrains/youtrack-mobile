import ReactNative from 'react-native';
import chai, {should} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import 'babel-polyfill';
import log from '../src/components/log/log';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import chaiEnzyme from 'chai-enzyme';
import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);
jest.mock('bugsnag-react-native', () => ({
  Configuration: jest.fn(() => ({})),
  Client: jest.fn(() => ({
    notify: jest.fn(),
    leaveBreadcrumb: jest.fn()
  }))
}));

Enzyme.configure({adapter: new Adapter()});

log.disableLog();

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);

should();

// Mocks for RNDeviceInfo
ReactNative.NativeModules.RNDeviceInfo = {
  uniqueId: 'unique-id',
  userAgent: 'user-agent'
};

ReactNative.NativeModules.RNKeychainManager = {
  getInternetCredentialsForServer: jest.fn(),
  setInternetCredentialsForServer: jest.fn()
};
