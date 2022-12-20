import type {CustomError} from 'types/Error';
import type {PermissionCacheItem} from 'types/Permission';
const ACCEPT_HEADER = 'application/json, text/plain, */*';

async function loadPermissions(
  token_type: string,
  access_token: string,
  permissionsCacheUrl: string,
): Promise<Array<PermissionCacheItem>> {
  return fetch(permissionsCacheUrl, {
    headers: {
      Accept: ACCEPT_HEADER,
      'User-Agent': 'USER_AGENT',
      Authorization: `${token_type} ${access_token}`,
    },
  })
    .then(res => res.json())
    .then((response: Array<PermissionCacheItem> | CustomError) => {
      if (response.error) {
        throw response;
      }

      return response;
    })
    .catch(async err => {
      throw err;
    });
}

export default {
  loadPermissions,
};
