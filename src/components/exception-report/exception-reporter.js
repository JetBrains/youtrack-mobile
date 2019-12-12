/* @flow */

import {Client, Configuration} from 'bugsnag-react-native';
import log from '../log/log';
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import DeviceInfo from 'react-native-device-info';

class ExceptionReporter {
  exceptionReporter: Client;
  config: Configuration;

  constructor() {
    this.config = new Configuration(appPackage.bugsnag.token);
    this.config.automaticallyCollectBreadcrumbs = false;
    this.config.appVersion = appPackage.bugsnag.version;
    this.exceptionReporter = new Client(this.config);
    this.exceptionReporter.setUser(
      DeviceInfo.getBrand(),
      DeviceInfo.getSystemName(),
      DeviceInfo.getSystemVersion()
    );
    log.info(`Exception reporter instance created`);
  }

  notify(error: String | Object | null): void {
    const err = new Error(error);
    const buildNumber = appPackage.version.split('-').pop();
    this.exceptionReporter.notify(err, (report) => {
      report.metadata = {
        Build: {
          build: buildNumber,
        }
      };
    });

    log.info(`Reporting exception`, err);
  }
}

export default new ExceptionReporter();
