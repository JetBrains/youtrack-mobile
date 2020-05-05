/* @flow */

import {Client, Configuration} from 'bugsnag-react-native';
import log from '../log/log';
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions

class ReporterBugsnag {
  exceptionReporter: Client;
  config: Configuration;

  constructor() {
    const token = this.hasToken();
    if (!token) {
      this.logMessage(true);
      return;
    }

    this.config = new Configuration(token);
    this.config.automaticallyCollectBreadcrumbs = false;
    this.config.appVersion = appPackage.bugsnag.version;
    this.config.notifyReleaseStages = ['production'];
    this.exceptionReporter = new Client(this.config);
    log.info(`Bugsnag exception reporter instance created`);
  }

  hasToken(): ?string {
    return appPackage.bugsnag.token;
  }

  logMessage(isWarning: boolean) {
    const logMethod = isWarning ? log.warn : log.debug;
    logMethod('Bugsnag token missing. Bugsnag reporter disabled.');
  }

  notify(error: String | Object | null): void {
    if (!this.hasToken()) {
      this.logMessage(false);
      return;
    }
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
