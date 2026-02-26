import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';

export function isPermissionCacheInYT(): boolean {
  return checkVersion(FEATURE_VERSION.permissionCache);
}
