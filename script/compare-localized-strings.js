const dirName = require('path').resolve(__dirname, `../translations`);
const fs = require('fs');
const path = require('path');
const po = require('gettext-parser').po;


function check() {
  const prevLength = Object.keys(require('../translations/locale_de.json').translations['']).length;

  const poFileName = fs.readdirSync(dirName).filter(file => file.match(new RegExp(`default.pot`, 'i')))[0];
  const translations = fs.readFileSync(path.join(dirName, '', poFileName));
  const parsedTranslations = po.parse(translations);
  const newLength = Object.keys(parsedTranslations.translations[''] || []).length;

  // eslint-disable-next-line no-console
  console.log(`
  ----------------------------------------------------
  Length of localized strings: prev - ${prevLength}, new - ${newLength}
  ----------------------------------------------------`
  );

  if (prevLength > newLength) {
    throw new Error('Localization: UI string was deleted! If this is intentional, please update the *.json files accordingly and commit them.');
  }
}

check();
