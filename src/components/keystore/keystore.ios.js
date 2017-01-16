/* @flow */
import {getInternetCredentials, setInternetCredentials} from 'react-native-keychain';

export default {
  getInternetCredentials(server: string) {
    return getInternetCredentials(server);
  },

  setInternetCredentials(server: string, username: string, password: string) {
    return setInternetCredentials(server, username, password);
  }
};
