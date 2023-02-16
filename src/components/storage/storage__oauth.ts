import EncryptedStorage from 'react-native-encrypted-storage';
import {getStorageState, storageStateAuthParamsKey} from './storage';
import type {AuthParams} from 'types/Auth';

const getAuthParamsKey = (): string =>
  getStorageState()[storageStateAuthParamsKey] || '';

const storeSecurelyAuthParams = async (
  authParams: AuthParams | null,
  authParamsKey: string,
): Promise<AuthParams | null> => {
  if (authParamsKey && authParams) {
    await EncryptedStorage.setItem(authParamsKey, JSON.stringify(authParams));
  }

  return authParams;
};

const getStoredSecurelyAuthParams = async (authParamsKey: string | null): Promise<AuthParams | null> => {
  if (authParamsKey) {
    const authParams: | string | null = await EncryptedStorage.getItem(authParamsKey);
    return typeof authParams === 'string' ? JSON.parse(authParams) : null;
  }

  return null;
};

export {getAuthParamsKey, getStoredSecurelyAuthParams, storeSecurelyAuthParams};
