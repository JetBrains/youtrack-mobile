/* @flow */
import DeviceInfo from 'react-native-device-info';
import {Analytics, Hits as GAHits} from 'react-native-google-analytics';

const VERSION = process.env.npm_package_version || 'dev.dev.dev';

const [major, minor, build] = VERSION.split('.');
export const VERSION_STRING = `${major}.${minor} (build ${build})`;

const googleAnalyiticsId = process.env.ANALYTICS_ID;
let isAnalyticsEnabled = false;

const clientId = DeviceInfo.getUniqueID();

const ga = new Analytics(googleAnalyiticsId, clientId, 1, DeviceInfo.getUserAgent());

const usage = {
  init(statisticsEnabled: boolean) {
    isAnalyticsEnabled = statisticsEnabled;
  },

  trackScreenView(screenName: string) {
    if (!isAnalyticsEnabled) {
      return;
    }

    const screenView = new GAHits.ScreenView('YouTrack Mobile', screenName, VERSION);
    return ga.send(screenView);
  },

  trackEvent(eventName: string, ...params: Array<any>) {
    if (!isAnalyticsEnabled) {
      return;
    }
    const gaEvent = new GAHits.Event(eventName, ...params);
    return ga.send(gaEvent);
  },

  trackError(error: any, additionalMessage: ?string) {
    //We are not allowed to gather error itself because of Privacy Policy
    return usage.trackEvent('exception', {
      'exDescription': additionalMessage
    });
  },

  onGlobalError(error: any, isFatal: boolean) {
    return usage.trackError(error, 'Global error happened', `isFatal:${isFatal.toString()}`);
  }
};

const originalHandler = global.ErrorUtils.getGlobalHandler();

global.ErrorUtils.setGlobalHandler((...params) => {
  usage.onGlobalError(...params);
  return originalHandler(...params);
});

export default usage;
