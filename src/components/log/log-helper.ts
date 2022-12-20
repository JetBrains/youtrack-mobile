import log from './log';
import usage from '../usage/usage';
export const logEvent = ({
  message,
  isError,
  analyticsId,
}: {
  message: string;
  isError?: boolean;
  analyticsId?: string;
}): void => {
  log[isError ? 'warn' : 'log'](message);

  if (analyticsId) {
    usage.trackEvent(analyticsId, message);
  }
};
