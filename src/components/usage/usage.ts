import DeviceInfo from 'react-native-device-info';
// @ts-ignore
import {Analytics, Hits as GAHits} from 'react-native-google-analytics';

import appPackage from '../../../package.json';

// @ts-ignore
import ScreenView from 'react-native-google-analytics/lib/hits/ScreenView';
// @ts-ignore
import Event from 'react-native-google-analytics/lib/hits/Event';


const splitRegExp = /[\.-]/i;
const VERSION = appPackage.version || 'dev.dev.dev-dev';
const [major, minor, patch, build] = VERSION.split(splitRegExp);
const patchPart = parseInt(patch) === 0 ? '' : `.${patch}`;
export const VERSION_STRING: string = `${major}.${minor}${patchPart} (build ${build})`;
export const USER_AGENT: string = `YouTrackMobile/${major}.${minor}${patchPart} (${DeviceInfo.getBrand()} ${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()})`;
const googleAnalyiticsId: string = appPackage.config.ANALYTICS_ID;

let isAnalyticsEnabled: boolean = false;
let gaAnalyticInstance: Analytics | null = null;

const createInstance = async () => {
  const clientId: string = await DeviceInfo.getUniqueId();
  const userAgent: string = await DeviceInfo.getUserAgent();
  return new Analytics(
    googleAnalyiticsId,
    clientId,
    1,
    userAgent || 'YouTrackMobile',
  );
};


const reset = () => {
  gaAnalyticInstance = null;
};


const getInstance = () => {
  if (gaAnalyticInstance !== null) {
    return gaAnalyticInstance;
  }
  return createInstance().then((instance: Analytics) => {
    gaAnalyticInstance = instance;
    return gaAnalyticInstance;
  });
};

const send = async (param: ScreenView | Event): Promise<any> => {
  const instance: Analytics = await getInstance();
  if (instance?.send) {
    return instance.send(param);
  }
  return Promise.reject(new Error('Analytics instance is not ready'));
};

const usage = {
  init(statisticsEnabled: boolean) {
    isAnalyticsEnabled = statisticsEnabled;
  },

  trackScreenView(screenName: string): any | void {
    if (!isAnalyticsEnabled) {
      return;
    }

    const screenView: ScreenView = new GAHits.ScreenView(
      'YouTrack Mobile',
      screenName,
      VERSION,
    );
    return send(screenView);
  },

  trackEvent(eventName: string, ...params: any[]): any | void {
    if (!isAnalyticsEnabled) {
      return;
    }

    const gaEvent = new GAHits.Event(eventName, ...params);
    return send(gaEvent);
  },

  trackError(additionalMessage: string | null | undefined): any | void {
    return usage.trackEvent(
      'exception',
      JSON.stringify({
        exDescription: additionalMessage,
      }),
    );
  },

};


export {
  gaAnalyticInstance,
  getInstance,
  isAnalyticsEnabled,
  reset,
  send,
};

export default usage;
