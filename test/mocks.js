import MockedStorage from '@react-native-community/async-storage';
import * as storage from '../src/components/storage/storage';
import sinon from 'sinon';
import type {StorageState} from '../src/components/storage/storage';

const sandbox = sinon.sandbox.create();

async function mockStorage() {
  sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([]));
  return await storage.populateStorage();
}

async function setStorage(state: StorageState) {
  return await storage.__setStorageState(state);
}

export default {
  sandbox,
  mockStorage,
  setStorage
};
