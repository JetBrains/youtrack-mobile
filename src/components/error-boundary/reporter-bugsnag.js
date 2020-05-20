/* @flow */

import {Client, Configuration} from 'bugsnag-react-native';
import log from '../log/log';
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import {getStorageState} from '../storage/storage';

import type {AppConfig} from '../../flow/AppConfig';

class ReporterBugsnag {
  exceptionReporter: Client;
  config: Configuration;
  buildNumber: string = appPackage.version.split('-').pop();

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
    logMethod('Bugsnag token missing, report not sent.');
  }

  notify(error: String | Object | null): void {
    if (!this.hasToken()) {
      this.logMessage(false);
      return;
    }

    let err;
    if (error instanceof Error) {
      err = error;
    } else {
      err = new Error(typeof error !== 'string' ? JSON.stringify(error) : error);
    }

    log.debug(`Reporting Bugsnag exception...`, err);

    let config: AppConfig | Object = {};
    try {
      config = getStorageState().config;
    } catch (e) {
      //
    }

    try {
      this.exceptionReporter.notify(err, (report) => {

        report.metadata = {
          'build': {
            'buildNumber': this.buildNumber,
          },
          'YouTrack': {
            'version': config?.version
          },
        };
      });
      log.debug(`Bugsnag exception reported`, err);
    } catch (e) {
      //
    }
  }
}

export default new ReporterBugsnag();
