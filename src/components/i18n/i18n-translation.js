/* @flow */

import gt from './i18n-gettext';
import log from 'components/log/log';

export const DEFAULT_DOMAIN: string = 'messages';

gt.setTextDomain(DEFAULT_DOMAIN);


const DEFAULT_LANGUAGE = 'en';

export function loadTranslation(localeString: string = `${DEFAULT_LANGUAGE}-US`, language: string = '') {
  try {
    const translationsMap = {
      // de: require('translations/translations-de.json'),
      // es: require('translations/translations-es.json'),
      // fr: require('translations/translations-fr.json'),
      // ja: require('translations/translations-ja.json'),
      // ko: require('translations/translations-ko.json'),
      // pt: require('translations/translations-pt.json'),
      // ru: require('translations/translations-ru.json'),
      // zh: require('translations/translations-zh.json'),
    };

    const lang: string = language.toLowerCase();
    const translations: ?Object = lang && lang !== DEFAULT_LANGUAGE ? translationsMap[lang] : null;
    if (translations) {
      gt.addTranslations(localeString, DEFAULT_DOMAIN, translations);
      gt.setLocale(localeString);
    }
  } catch (e) {
    log.warn('Translation for locale can\'t be loaded', localeString);
  }
}
