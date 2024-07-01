import analytics, {FirebaseAnalyticsTypes} from '@react-native-firebase/analytics';
import DeviceInfo from 'react-native-device-info';

import appPackage from '../../../package.json';
import {whiteSpacesRegex} from 'components/wiki/util/patterns.ts';

const splitRegExp = /[\.-]/i;
const VERSION = appPackage.version || 'dev.dev.dev-dev';
const [major, minor, patch, build] = VERSION.split(splitRegExp);
const patchPart = parseInt(patch) === 0 ? '' : `.${patch}`;
export const VERSION_STRING: string = `${major}.${minor}${patchPart} (build ${build})`;
export const USER_AGENT: string = `YouTrackMobile/${major}.${minor}${patchPart} (${DeviceInfo.getBrand()} ${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()})`;

let isAnalyticsEnabled: boolean = false;
let _analytics: FirebaseAnalyticsTypes.Module;

const usage = {
  init(statisticsEnabled: boolean) {
    isAnalyticsEnabled = statisticsEnabled;
  },

  getInstance(): FirebaseAnalyticsTypes.Module {
    if (!_analytics) {
      _analytics = analytics();
    }
    return _analytics;
  },

  trackScreenView(screenName: string) {
    if (!isAnalyticsEnabled) {
      return;
    }
    try {
      this.getInstance().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
    } catch (e) {}
  },

  trackEvent(eventName: string, message?: string | null, additionalData?: string | Object) {
    if (!isAnalyticsEnabled) {
      return;
    }
    let params = {};
    if (message) {
      params = {message};
    }
    if (typeof additionalData === 'string') {
      params = Object.assign(params, {additionalData});
    } else if (typeof additionalData === 'object') {
      params = Object.assign(params, additionalData);
    }
    try {
      this.getInstance().logEvent(eventName.replace(whiteSpacesRegex, '_'), params);
    } catch (e) {}
  },

  trackError(eventName: string, e: unknown) {
    return usage.trackEvent(`${eventName}: ERROR`, typeof e === 'string' ? e : JSON.stringify(e));
  },
};

export {isAnalyticsEnabled};

export default usage;
