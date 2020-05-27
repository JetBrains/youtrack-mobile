/* @flow */

import {flushStoragePart, getStorageState} from '../storage/storage';
import {Alert} from 'react-native';

import type {Token} from '../../flow/Notification';

const messageDefaultButton: Object = {
  text: 'Close',
  onPress: () => {}
};


async function storeDeviceToken(token: Token) {
  await flushStoragePart({deviceToken: token});
}

function getStoredDeviceToken(): Token {
  return getStorageState().deviceToken;
}

function isDeviceTokenChanged(deviceToken: Token) {
  const storedDeviceToken: Token = getStoredDeviceToken();
  return storedDeviceToken && deviceToken && storedDeviceToken !== deviceToken;
}

function showInfoMessage(title: string, message: string, buttons: Array<Object> = [messageDefaultButton]) {
  Alert.alert(
    title,
    message,
    buttons,
    {cancelable: false}
  );
}


export default {
  storeDeviceToken,
  getStoredDeviceToken,
  isDeviceTokenChanged,
  showInfoMessage
};
