import DeviceInfo from 'react-native-device-info';
import {Analytics, Hits as GAHits} from 'react-native-google-analytics';
import appPackage from '../../../package.json';
const splitRegExp = /[\.-]/i;
const VERSION = appPackage.version || 'dev.dev.dev-dev';
const [major, minor, patch, build] = VERSION.split(splitRegExp);
const patchPart = parseInt(patch) === 0 ? '' : `.${patch}`;
export const VERSION_STRING: string = `${major}.${minor}${patchPart} (build ${build})`;
export const USER_AGENT: string = `YouTrackMobile/${major}.${minor}${patchPart} (${DeviceInfo.getBrand()} ${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()})`;
const googleAnalyiticsId: string = appPackage.config.ANALYTICS_ID;
let isAnalyticsEnabled: boolean = false;
const clientId: string = DeviceInfo.getUniqueId();
let gaAnalyticInstance: Analytics;

const createInstance = async () => {
  const userAgent: string = await DeviceInfo.getUserAgent();
  gaAnalyticInstance = new Analytics(
    googleAnalyiticsId,
    clientId,
    1,
    userAgent || 'YouTrackMobile',
  );
};

const getInstance = () => gaAnalyticInstance;

createInstance();
const usage = {
  init(statisticsEnabled: boolean) {
    isAnalyticsEnabled = statisticsEnabled;
  },

  trackScreenView(screenName: string): any | void {
    if (!isAnalyticsEnabled) {
      return;
    }

    const screenView = new GAHits.ScreenView(
      'YouTrack Mobile',
      screenName,
      VERSION,
    );
    return getInstance().send(screenView);
  },

  trackEvent(eventName: string, ...params: any[]): any | void {
    if (!isAnalyticsEnabled) {
      return;
    }

    const gaEvent = new GAHits.Event(eventName, ...params);
    return getInstance().send(gaEvent);
  },

  trackError(additionalMessage: string | null | undefined): any | void {
    return usage.trackEvent(
      'exception',
      JSON.stringify({
        exDescription: additionalMessage,
      }),
    );
  },

  onGlobalError(error: any, isFatal: boolean): any | void {
    return usage.trackError(
      `Global error happened, isFatal:${isFatal.toString()}`,
    );
  },
};
const originalHandler = global.ErrorUtils.getGlobalHandler();
global.ErrorUtils.setGlobalHandler((...params) => {
  usage.onGlobalError(...params);
  return originalHandler(...params);
});
export default usage;
