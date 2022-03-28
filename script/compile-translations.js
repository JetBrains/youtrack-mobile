const fs = require('fs');
const path = require('path');
const po = require('gettext-parser').po;

const dirName = require('path').resolve(__dirname, `../translations`);

function getFileByExtensionFromPath(_path, extension) {
  return fs.readdirSync(_path).filter(file => file.match(new RegExp(`.*\.(${extension})$`, 'i')));
}

function createJSONTranslationsFromPO() {
  const poFiles = getFileByExtensionFromPath(dirName, 'po');
  poFiles.forEach((fileName) => {
    const translations = fs.readFileSync(path.join(dirName, '', fileName));
    const parsedTranslations = po.parse(translations);
    const jsonFileName = path.join(dirName, '', `${fileName.split('.')[0]}.json`);
    fs.writeFileSync(
      jsonFileName,
      JSON.stringify(parsedTranslations)
    );
    // eslint-disable-next-line no-console
    console.log('Created', jsonFileName);
  });
}

createJSONTranslationsFromPO();
