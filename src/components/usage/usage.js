/* @flow */
import DeviceInfo from 'react-native-device-info';
import {Analytics, Hits as GAHits} from 'react-native-google-analytics';
import appPackage from '../../../package.json';

const splitRegExp = /[\.-]/i;
const VERSION = appPackage.version || 'dev.dev.dev-dev';

const [major, minor, patch, build] = VERSION.split(splitRegExp);
const patchPart = parseInt(patch) === 0 ? '' : `.${patch}`;

export const VERSION_STRING = `${major}.${minor}${patchPart} (build ${build})`;

export const USER_AGENT = `YouTrackMobile/${major}.${minor}${patchPart} (${DeviceInfo.getBrand()} ${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()})`;

const googleAnalyiticsId = appPackage.config.ANALYTICS_ID;
let isAnalyticsEnabled = false;

const clientId = DeviceInfo.getUniqueID();

const ga = new Analytics(googleAnalyiticsId, clientId, 1, DeviceInfo.getUserAgent());

const usage = {
  init(statisticsEnabled: boolean) {
    isAnalyticsEnabled = statisticsEnabled;
  },

  trackScreenView(screenName: string): any | void {
    if (!isAnalyticsEnabled) {
      return;
    }

    const screenView = new GAHits.ScreenView('YouTrack Mobile', screenName, VERSION);
    return ga.send(screenView);
  },

  trackEvent(eventName: string, ...params: Array<any>): any | void {
    if (!isAnalyticsEnabled) {
      return;
    }
    const gaEvent = new GAHits.Event(eventName, ...params);
    return ga.send(gaEvent);
  },

  trackError(error: any, additionalMessage: ?string): any | void {
    //We are not allowed to gather error itself because of Privacy Policy
    return usage.trackEvent('exception', JSON.stringify({
      'exDescription': additionalMessage,
    }));
  },

  onGlobalError(error: any, isFatal: boolean): any | void {
    return usage.trackError(error, `Global error happened, isFatal:${isFatal.toString()}`);
  },
};

const originalHandler = global.ErrorUtils.getGlobalHandler();

global.ErrorUtils.setGlobalHandler((...params) => {
  usage.onGlobalError(...params);
  return originalHandler(...params);
});

export default usage;
