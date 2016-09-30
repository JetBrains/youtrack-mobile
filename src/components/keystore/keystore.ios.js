/* @flow */
import NativeKeychain from 'react-native-keychain';

export default {
  getInternetCredentials(server: string) {
    return NativeKeychain.getInternetCredentials(server);
  },

  setInternetCredentials(server: string, username: string, password: string) {
    return NativeKeychain.setInternetCredentials(server, username, password);
  }
};
