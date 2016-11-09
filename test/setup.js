import chai, {expect, should} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import 'babel-polyfill';

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);
should();

global.expect = expect;

