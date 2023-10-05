import Api from 'components/api/api';
import {ActivityCategory} from 'components/activity/activity__category';
import {checkVersion} from 'components/feature/feature';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {getActivityAllTypes} from 'components/activity/activity-helper';

import type {ActivityType} from 'types/Activity';
import type {StorageState} from 'components/storage/storage';
import {IssueFull} from 'types/Issue';

export function isIssueActivitiesAPIEnabled(): any {
  return checkVersion('2018.3');
}

export function getIssueActivitiesEnabledTypes(): ActivityType[] {
  let enabledTypes: ActivityType[] =
    getStorageState().issueActivitiesEnabledTypes || [];
  const activityAllTypes: ActivityType[] = getActivityAllTypes();

  if (!enabledTypes.length) {
    enabledTypes = activityAllTypes;
    saveIssueActivityEnabledTypes(enabledTypes);
  }

  if (
    !getStorageState().vcsChanges &&
    !enabledTypes.find(
      (it: ActivityType) => it.id === ActivityCategory.Source?.VCS_ITEM,
    )
  ) {
    const vcs: ActivityType | null | undefined = activityAllTypes.find(
      (it: ActivityType) => it.id === ActivityCategory.Source?.VCS_ITEM,
    );
    vcs && enabledTypes.push(vcs);
    flushStoragePart({
      vcsChanges: true,
    });
  }

  return enabledTypes;
}
export function saveIssueActivityEnabledTypes(
  enabledTypes: ActivityType[],
) {
  enabledTypes &&
    flushStoragePart({
      issueActivitiesEnabledTypes: enabledTypes,
    });
}
export async function toggleIssueActivityEnabledType(
  type: ActivityType,
  enable: boolean,
): Promise<StorageState> {
  let enabledTypes: ActivityType[] = getIssueActivitiesEnabledTypes();

  if (enable) {
    enabledTypes.push(type);
  } else {
    enabledTypes = enabledTypes.filter(it => it.id !== type.id);
  }

  return flushStoragePart({
    issueActivitiesEnabledTypes: enabledTypes,
  });
}

export function makeIssueWebUrl(
  api: Api,
  issue: IssueFull,
  id?: string,
): string {
  const commentHash: string = id ? `#focus=Comments-${id}` : '';
  const issueId: string = issue.idReadable || issue.id;
  const url: string = `${api.config.backendUrl}/issue`;
  return (
    issueId && commentHash
      ? `${url}/${issueId}${commentHash}`
      : `${url}s`
  );
}
