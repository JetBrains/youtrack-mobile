/* @flow */
import DeviceInfo from 'react-native-device-info';
import {Analytics, Hits as GAHits} from 'react-native-google-analytics';

const VERSION = process.env.npm_package_version;
const BUILD_NUMBER = process.env.npm_package_config_buildnumber;

const clientId = DeviceInfo.getUniqueID();

//todo: pass GA ID in build step
const version = `${VERSION || 'dev'}-${BUILD_NUMBER || 'dev'}`;

const ga = new Analytics('UA-60566164-3', clientId, 1, DeviceInfo.getUserAgent());

const usage = {
  trackScreenView(screenName: string) {
    const screenView = new GAHits.ScreenView('YouTrack Mobile', screenName, version);
    return ga.send(screenView);
  },
  trackEvent(eventName: string, ...params: Array<any>) {
    const gaEvent = new GAHits.Event(eventName, ...params);
    return ga.send(gaEvent);
  }
};

export default usage;
