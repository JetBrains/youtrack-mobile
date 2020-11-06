/* @flow */
import {NativeModules} from 'react-native';

const YTSafariViewController = NativeModules.YTSafariViewController;

type Options = {
  url: string
}

export default {
  show(options: Options): Promise<null> {
    return new Promise((resolve, reject) => {
      YTSafariViewController.presentSafari(options.url);
    });
  },

  dismiss() {
    YTSafariViewController.dismiss();
  },

  isAvailable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      YTSafariViewController.isAvailable((error) => {
        if (error) {
          return reject(error);
        }

        resolve(true);
      });
    });
  }
};
