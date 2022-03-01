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
  ])
  .parseFilesGlob('./src/**/!(*.spec).js');

extractor.savePotFile('./translations/default.pot');

extractor.printStats();
