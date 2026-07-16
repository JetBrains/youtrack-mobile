import {checkVersion, convertToNumber, FEATURE_VERSION} from 'components/feature/feature';

export function isPermissionCacheInYT(version?: string): boolean {
  // `version` is passed explicitly when the check runs before the API instance
  // exists (e.g. from the auth layer during initialization), so we cannot rely
  // on `checkVersion` reading the version from `getApi()`.
  return version != null
    ? convertToNumber(version) >= convertToNumber(FEATURE_VERSION.permissionCache)
    : checkVersion(FEATURE_VERSION.permissionCache);
}
