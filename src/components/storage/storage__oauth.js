/* @flow */

import EncryptedStorage from 'react-native-encrypted-storage';

import {getStorageState, storageStateAuthParamsKey} from './storage';

import type {OAuthParams2} from '../../flow/Auth';


const getAuthParamsKey = (): string => getStorageState()[storageStateAuthParamsKey] || '';

const storeSecurelyAuthParams = async (
  authParams: OAuthParams2 | null,
  authParamsKey: string
): Promise<OAuthParams2 | null> => {
  if (authParamsKey && authParams) {
    await EncryptedStorage.setItem(authParamsKey, JSON.stringify(authParams));
  }
  return authParams;
};

const getStoredSecurelyAuthParams = async (authParamsKey: string): Promise<?OAuthParams2> => {
  if (authParamsKey) {
    const authParams: ?string = await EncryptedStorage.getItem(authParamsKey);
    return typeof authParams === 'string' ? JSON.parse(authParams) : null;
  }
  return null;
};


export {
  getAuthParamsKey,
  getStoredSecurelyAuthParams,
  storeSecurelyAuthParams,
};
