import {checkVersion} from './feature';
import {setApi} from '../api/api__instance';

const version = '2019.1';

beforeEach(() => {
  setApi({
    config: {
      version,
    },
  });
});

describe('Feature', () => {
  it('check smaller version should return true', () => {
    expect(checkVersion('2018.3')).toEqual(true);
  });

  it('check equal version should return true', () => {
    expect(checkVersion('2019.1')).toEqual(true);
  });

  it('check greater version should return false', () => {
    expect(checkVersion('2019.3')).toEqual(false);
  });

  it('should return TRUE if API is not set', () => {
    setApi(null);
    expect(checkVersion('2019.3', true)).toEqual(true);
  });

  it('should return FALSE if API is not set', () => {
    setApi(null);
    expect(checkVersion('2019.3')).toEqual(false);
  });
});
