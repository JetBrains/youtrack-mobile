import chai, {should} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import 'babel-polyfill';
import log from '../src/components/log/log';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import chaiEnzyme from 'chai-enzyme';

Enzyme.configure({adapter: new Adapter()});

log.disableLog();

jest.mock('react-native', () => {
  return require('./mocks/react-native');
});

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);
should();

//Fixes https://github.com/sinonjs/sinon/issues/1051
global.location = {host: 'localhost', protocol: 'http'};
