/* @flow */

import {Client, Configuration} from 'bugsnag-react-native';
import log from '../log/log';
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions

class Bugsnag {
  bugsnag: Client;
  config: Configuration;

  constructor() {
    this.config = new Configuration(appPackage.bugsnag.token);
    this.config.appVersion = appPackage.bugsnag.version;
    this.bugsnag = new Client(this.config);
    log.info(`Exception reporter instance created`);
  }

  notify(error: String | Object | null): void {
    const err = new Error(error);
    const buildNumber = appPackage.version.split('-').pop();
    this.bugsnag.notify(err, (report) => {
      report.metadata = {
        Build: {
          build: buildNumber,
        }
      };
    });

    log.info(`Reporting exception`, err);
  }
}

export default new Bugsnag();
