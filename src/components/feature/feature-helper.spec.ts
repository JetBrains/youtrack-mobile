import {isPermissionCacheInYT} from './feature-helper';
import {setApi} from '../api/api__instance';

describe('isPermissionCacheInYT', () => {
  describe('with an explicit version (API not yet initialized)', () => {
    beforeEach(() => {
      // Reproduces the init-order case: the auth layer resolves the URL before
      // `setApi` runs, so `getApi()` would throw.
      setApi(null);
    });

    it('should return TRUE when the version equals the feature version', () => {
      expect(isPermissionCacheInYT('2024.2')).toEqual(true);
    });

    it('should return TRUE when the version is newer than the feature version', () => {
      expect(isPermissionCacheInYT('2025.1')).toEqual(true);
    });

    it('should return FALSE when the version is older than the feature version', () => {
      expect(isPermissionCacheInYT('2024.1')).toEqual(false);
    });
  });

  describe('without an explicit version (falls back to the API config)', () => {
    afterEach(() => {
      setApi(null);
    });

    it('should read the server version from the API when no version is passed', () => {
      setApi({config: {version: '2024.2'}} as any);
      expect(isPermissionCacheInYT()).toEqual(true);
    });

    it('should return FALSE when the API is not initialized and no version is passed', () => {
      setApi(null);
      expect(isPermissionCacheInYT()).toEqual(false);
    });
  });
});
