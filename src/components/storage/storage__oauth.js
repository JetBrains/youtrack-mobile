/* @flow */

import EncryptedStorage from 'react-native-encrypted-storage';

import {getStorageState, storageStateAuthParamsKey, storageStateOAuthParamsKey} from './storage';

import type {AuthParams, OAuthParams} from '../../flow/Auth';

function getAuthParamsKey(): string {
  return getStorageState()[storageStateAuthParamsKey] || '';
}

const getOAuthParamsKey = (): string => {
  return getStorageState()[storageStateOAuthParamsKey] || '';
};

const getAuthStorageKey = (): string => {
  return getOAuthParamsKey() || getAuthParamsKey();
};

const storeSecurelyAuthParams = async (
  authParams: OAuthParams | AuthParams | null,
  authParamsKey: string
): Promise<OAuthParams | AuthParams | null> => {
  if (authParamsKey && authParams) {
    await EncryptedStorage.setItem(authParamsKey, JSON.stringify(authParams));
  }
  return authParams;
};

const getStoredSecurelyAuthParams = async (authParamsKey: string): Promise<OAuthParams | AuthParams | null> => {
  if (authParamsKey) {
    const authParams: ?string = await EncryptedStorage.getItem(authParamsKey);
    return typeof authParams === 'string' ? JSON.parse(authParams) : null;
  }
  return null;
};

export {
  getAuthStorageKey,
  getAuthParamsKey,
  getOAuthParamsKey,
  getStoredSecurelyAuthParams,
  storeSecurelyAuthParams,
};
