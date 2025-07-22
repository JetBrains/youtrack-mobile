if (__DEV__) {
  require('./ReactotronConfig');
}

import * as Sentry from '@sentry/react-native';
import appPackage from './package.json';
import {AppRegistry} from 'react-native';
import {hasSentryDsn, initSentry} from './sentry';

import YouTrackMobileApp from './src/app';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import {name as appName} from './app.json';

let app = YouTrackMobileApp;
if (hasSentryDsn()) {
  app = Sentry.wrap(YouTrackMobileApp);
  initSentry(appPackage.config.SENTRY_DSN);
}

AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(app));
