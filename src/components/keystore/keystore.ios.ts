import {
  getInternetCredentials,
  setInternetCredentials,
} from 'react-native-keychain';
export default {
  getInternetCredentials(server: string): any {
    return getInternetCredentials(server);
  },

  setInternetCredentials(
    server: string,
    username: string,
    password: string,
  ): any {
    return setInternetCredentials(server, username, password);
  },
};