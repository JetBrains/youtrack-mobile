import chai, {should} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import 'babel-polyfill';
import log from '../src/components/log/log';

log.disableLog();

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);
should();

jest.mock('react-native', () => {
  return require('./mocks/react-native');
});

//Fixes https://github.com/sinonjs/sinon/issues/1051
global.location = {host: 'localhost', protocol: 'http'};
