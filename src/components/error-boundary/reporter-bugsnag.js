/* @flow */

import {Client, Configuration} from 'bugsnag-react-native';
import log from '../log/log';
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions

class ReporterBugsnag {
  exceptionReporter: Client;
  config: Configuration;

  constructor() {
    this.config = new Configuration(appPackage.bugsnag.token);
    this.config.automaticallyCollectBreadcrumbs = false;
    this.config.appVersion = appPackage.bugsnag.version;
    this.exceptionReporter = new Client(this.config);
    log.info(`Bugsnag exception reporter instance created`);
  }

  notify(error: String | Object | null): void {
    const err = error instanceof Error ? error : new Error(error);
    const buildNumber = appPackage.version.split('-').pop();

    log.debug(`Reporting Bugsnag exception...`, err);
    this.exceptionReporter.notify(err, (report) => {
      report.metadata = {
        Build: {
          build: buildNumber,
        }
      };
    });
    log.debug(`Bugsnag exception reported`, err);

  }
}

export default new ReporterBugsnag();
