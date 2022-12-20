import gt from './i18n-gettext';
import log from 'components/log/log';
type Params = Record<string, string | number>;

const i18n = (text: string = '', params?: Params): string => {
  if (!params) {
    return gt.gettext(text);
  }

  return createGettextMessage(gt.gettext(text), params);
};

const i18nPlural = (
  count: number,
  text: string,
  textPlural: string,
  params?: Params,
): string => {
  if (!params) {
    return gt.ngettext(text, textPlural, count);
  }

  return createGettextMessage(gt.ngettext(text, textPlural, count), params);
};

const createGettextMessage = (message: string, params?: Params) => {
  let msg: string = message.slice(0);

  if (params) {
    msg.replace(/{{([^}]+)}}/g, (match: string, paramKey: string): string => {
      const key: string = paramKey.trim();

      if (params.hasOwnProperty(key)) {
        msg = msg.replace(match, params[key]);
      } else {
        log.warn('Interpolation parameter is required');
      }
    });
  }

  return msg;
};

export {i18n, i18nPlural};
