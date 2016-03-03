import chai, {expect, should} from 'chai';
import chaiEnzyme from 'chai-enzyme'

chai.use(chaiEnzyme());
should();

global.expect = expect;

