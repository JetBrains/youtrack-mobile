import {NativeModules} from 'react-native';
const SafariWebAuth = NativeModules.SafariWebAuth;
type Options = {
  url: string;
  scheme: string;
};
export default {
  requestAuth(options: Options): Promise<string> {
    return new Promise((resolve, reject) => {
      SafariWebAuth.requestAuth(options.url, options.scheme, result => {
        if (result === 'error') {
          reject();
        }

        resolve(result);
      });
    });
  },
};