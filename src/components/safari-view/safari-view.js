/* @flow */

//$FlowFixMe
import InAppBrowser from 'react-native-inappbrowser-reborn';

type Options = {
  url: string
}

export default {
  show(options: Options): Promise<null> {
    return new Promise(() => {
      InAppBrowser.open(options.url);
    });
  },

  dismiss() {
    InAppBrowser.close();
  },

  async isAvailable(): Promise<boolean> {
    return await InAppBrowser.isAvailable();
  }
};
