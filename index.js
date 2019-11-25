// create Bugsnag reporter as soon as possible
import Bugsnag from './src/components/report/bugsnag';

import YouTrackMobileApp from './src/app';
import React from 'react-native';

React.AppRegistry.registerComponent('YouTrackMobile', () => YouTrackMobileApp);
