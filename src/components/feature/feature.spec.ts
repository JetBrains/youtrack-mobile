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
  it('should return TRUE if server version is greater then the version ot check', () => {
    expect(checkVersion('2018.3')).toEqual(true);
  });
  it('should return TRUE if fn throws with the guard param', () => {
    setApi(null);
    expect(checkVersion('2019.3', true)).toEqual(true);
  });
  it('should return TRUE if versions are equal', () => {
    expect(checkVersion('2019.1')).toEqual(true);
  });
  it('should return FALSE if a version to check is older then a server version', () => {
    expect(checkVersion('2019.3')).toEqual(false);
  });
  it('should return FALSE if there is no version field in the `config`', () => {
    setApi({
      config: {},
    });
    expect(checkVersion('2019.3')).toEqual(false);
  });
  it('should return FALSE if there is no version to check', () => {
    expect(checkVersion('')).toEqual(false);
  });
  it('should return FALSE if API is not set', () => {
    setApi(null);
    expect(checkVersion('2019.3')).toEqual(false);
  });
});