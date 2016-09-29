/* @flow */
import DeviceInfo from 'react-native-device-info';
import {Analytics, Hits as GAHits} from 'react-native-google-analytics';

const VERSION = process.env.npm_package_version;
const BUILD_NUMBER = process.env.npm_package_config_buildnumber;
const VERSTION_STRING = `${VERSION || 'dev'}-${BUILD_NUMBER || 'dev'}`;

const googleAnalyiticsId =  process.env.npm_package_config_analyticsid;
const isAnalyticsEnabled = googleAnalyiticsId !== null;

const clientId = DeviceInfo.getUniqueID();

const ga = new Analytics(googleAnalyiticsId, clientId, 1, DeviceInfo.getUserAgent());

const usage = {
  trackScreenView(screenName: string) {
    if (!isAnalyticsEnabled) {
      return;
    }

    const screenView = new GAHits.ScreenView('YouTrack Mobile', screenName, VERSTION_STRING);
    return ga.send(screenView);
  },

  trackEvent(eventName: string, ...params: Array<any>) {
    if (!isAnalyticsEnabled) {
      return;
    }
    const gaEvent = new GAHits.Event(eventName, ...params);
    return ga.send(gaEvent);
  }
};

export default usage;
