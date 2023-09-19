import gt from './i18n-gettext';
import log from 'components/log/log';
export const DEFAULT_DOMAIN: string = 'messages';
gt.setTextDomain(DEFAULT_DOMAIN);
const DEFAULT_LANGUAGE: string = 'en';
export function loadTranslation(
  localeString: string = '',
  language: string = '',
) {
  try {
    const translationsMap = {
      de: require('../../../translations/locale_de.json'),
      ru: require('../../../translations/locale_ru.json'),
      es: require('../../../translations/locale_es.json'),
      fr: require('../../../translations/locale_fr.json'),
      cs: require('../../../translations/locale_cs.json'),
      he: require('../../../translations/locale_he.json'),
      hu: require('../../../translations/locale_hu.json'),
      ja: require('../../../translations/locale_ja.json'),
      ko: require('../../../translations/locale_ko.json'),
      zh: require('../../../translations/locale_zh.json'),
      pt: require('../../../translations/locale_pt.json'),
      pl: require('../../../translations/locale_pl.json'),
      it: require('../../../translations/locale_it.json'),
      uk: require('../../../translations/locale_uk.json'),
      tr: require('../../../translations/locale_tr.json'),
    };
    const lang: string = language.toLowerCase();
    const translations: Record<string, any> | null | undefined =
      lang && lang !== DEFAULT_LANGUAGE ? translationsMap[lang] : null;
    gt.setLocale(localeString);

    if (translations) {
      gt.addTranslations(localeString, DEFAULT_DOMAIN, translations);
    }
  } catch (e) {
    log.warn('Translation for locale can\'t be loaded', localeString);
  }
}
