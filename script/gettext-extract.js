const { GettextExtractor, JsExtractors } = require('gettext-extractor');
const fs = require('fs');

const dir = './translations';

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

const extractor = new GettextExtractor();

extractor
  .createJsParser([
    JsExtractors.callExpression('i18n', {
      arguments: {
        text: 0,
        context: 1,
      },
    }),
    JsExtractors.callExpression('i18nPlural', {
      arguments: {
        text: 1,
        textPlural: 2,
        context: 3,
      },
    }),
  ])
  .parseFilesGlob('./src/**/!(*.spec).@(ts|js|tsx|jsx)');

extractor.savePotFile('./translations/default.pot');

extractor.printStats();
