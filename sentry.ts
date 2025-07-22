import * as Sentry from '@sentry/react-native';
import DeviceInfo from 'react-native-device-info';

import appPackage from './package.json';
import {hash, isIOSPlatform} from 'util/util';

export const hasSentryDsn = () => appPackage.config.SENTRY_DSN.length > 0;
const getDeviceId = async () => DeviceInfo.getUniqueId();

export const initSentry = async (dsn: string) => {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    integrations: [Sentry.breadcrumbsIntegration({console: false})],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    beforeSend(event) {
      const frames = event.exception?.values?.[0]?.stacktrace?.frames;
      if (frames) {
        // Filter out events where all frames are from node_modules
        const hasNonNodeModulesFrame = frames.some(
          (frame) => !frame.filename?.includes('node_modules')
        );
        if (!hasNonNodeModulesFrame) {
          return null; // Discard the event
        }
      }
      return event;
    },
    tracePropagationTargets: __DEV__ ? [] : [/^\/api\//],
    // spotlight: __DEV__,
  });

  const deviceId = await getDeviceId();
  Sentry.setUser({
    id: hash(deviceId, 12),
    OS: isIOSPlatform() ? 'iOS' : 'Android',
    version: DeviceInfo.getVersion(),
    tablet: DeviceInfo.isTablet(),
  });
};
export const captureException = (error: Error) => {
  if (hasSentryDsn()) {
    Sentry.captureException(error);
  }
};
