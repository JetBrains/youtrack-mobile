import * as Sentry from '@sentry/react-native';
import DeviceInfo from 'react-native-device-info';

import appPackage from './package.json';
import {hash, anonymizeYTApiEntityId} from 'util/util';

import type {ErrorEvent, EventHint} from '@sentry/core';

export const hasSentryDsn = () => appPackage.config.SENTRY_DSN.length > 0;
const getDeviceId = async () => DeviceInfo.getUniqueId();

export const initSentry = async (dsn: string) => {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    integrations: [Sentry.breadcrumbsIntegration({console: false})],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    // @ts-ignore
    beforeSend(event, hint) {
      if (isNoPermissionError(hint) || !isAppCodeError(event)) {
        return null;
      }
      sanitizeEventUrls(event);
      return event;
    },
    tracePropagationTargets: __DEV__ ? [] : [/^\/api\//],
    // spotlight: __DEV__,
  });

  const deviceId = await getDeviceId();
  Sentry.setUser({
    id: hash(deviceId, 12),
    tablet: DeviceInfo.isTablet(),
    geo: {
      country_code: '',
      region: '',
      city: '',
    },
  });
};

export const captureException = (error: Error) => {
  if (hasSentryDsn()) {
    Sentry.captureException(error);
  }
};

function isAppCodeError(event: ErrorEvent) {
  const frames = event.exception?.values?.[0]?.stacktrace?.frames;
  if (Array.isArray(frames)) {
    return frames.some(frame => !frame.filename?.includes('node_modules'));
  }
  return true;
}

function isNoPermissionError(hint: EventHint) {
  const error = hint?.originalException;
  if (!error || typeof error !== 'object') {
    return false;
  }
  let errorCode: number | null = 'status' in error && typeof error.status === 'number' ? error.status : null;
  if (errorCode === null && 'statusCode' in error && typeof error.statusCode === 'number') {
    errorCode = error.statusCode;
  }
  return typeof errorCode === 'number' && errorCode === 401;
}

function sanitizeEventUrls(event: ErrorEvent) {
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs.forEach(b => {
      if((b.category === 'xhr' || b.category === 'fetch') && b.data?.url) {
        b.data.url = anonymizeYTApiEntityId(b.data.url);
      }
    });
  }
}
