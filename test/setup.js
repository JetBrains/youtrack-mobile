import chai, {expect, should} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
should();

global.expect = expect;

