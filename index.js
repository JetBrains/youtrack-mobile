if (__DEV__) {
    require('./ReactotronConfig');
}

import {AppRegistry} from 'react-native';

import YouTrackMobileApp from './src/app';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(YouTrackMobileApp));
