import {NativeModules} from 'react-native';

const YTSafariViewController = NativeModules.YTSafariViewController;

/**
 * High-level docs for the SafariViewManager iOS API can be written here.
 */

export default {
  show(options) {
    return new Promise((resolve, reject) => {
      YTSafariViewController.presentSafari(options.url);
    });
  },

  dismiss() {
    YTSafariViewController.dismiss();
  },

  isAvailable() {
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
