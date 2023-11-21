import type {CustomError} from 'types/Error';
import type {PermissionCacheItem} from 'types/Permission';
const ACCEPT_HEADER = 'application/json, text/plain, */*';

async function loadPermissions(
  token_type: string,
  access_token: string,
  permissionsCacheUrl: string,
): Promise<PermissionCacheItem[]> {
  return fetch(permissionsCacheUrl, {
    headers: {
      Accept: ACCEPT_HEADER,
      'User-Agent': 'USER_AGENT',
      Authorization: `${token_type} ${access_token}`,
    },
  })
    .then(res => res.json())
    .then((response: PermissionCacheItem[] | CustomError) => {
      if ((response as CustomError).error) {
        throw response;
      }

      return response as PermissionCacheItem[];
    })
    .catch(async err => {
      throw err;
    });
}

export {
  loadPermissions,
};
