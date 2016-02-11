import Platform from 'Platform';
import NativeKeychain from 'react-native-keychain';

export default {
    getInternetCredentials(server) {
        return NativeKeychain.getInternetCredentials(server);
    },

    setInternetCredentials(server, username, password) {
        return NativeKeychain.setInternetCredentials(server, username, password);
    }
}