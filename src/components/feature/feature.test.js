import {checkVersion} from './feature';
import {setApi} from '../api/api__instance';

const version = '2019.1';

beforeEach(() => {
  setApi({
    config: {
      version
    }
  });
});

describe('Feature', () => {
  it('check smaller version should return true', () => {
    checkVersion('2018.3').should.be.true;
  });

  it('check equal version should return true', () => {
    checkVersion('2019.1').should.be.true;
  });

  it('check greater version should return false', () => {
    checkVersion('2019.3').should.be.false;
  });
});
