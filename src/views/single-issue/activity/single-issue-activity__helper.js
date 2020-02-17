/* @flow */

import type {ActivityEnabledType} from '../../../flow/Activity';
import {flushStoragePart, getStorageState} from '../../../components/storage/storage';
import {checkVersion} from '../../../components/feature/feature';
import {Activity} from '../../../components/activity/activity__category';


export function isActivitiesAPIEnabled() {
  return checkVersion('2018.3');
}

export function getIssueActivitiesEnabledTypes(): Array<ActivityEnabledType> {
  let enabledTypes = getStorageState().issueActivitiesEnabledTypes || [];
  if (!enabledTypes.length) {
    enabledTypes = getIssueActivityAllTypes();
    saveIssueActivityEnabledTypes(enabledTypes);
  }
  return enabledTypes;
}

export function saveIssueActivityEnabledTypes(enabledTypes: Array<Object>) {
  enabledTypes && flushStoragePart({issueActivitiesEnabledTypes: enabledTypes});
}

export function getIssueActivityAllTypes(): Array<ActivityEnabledType> {
  return Object.keys(Activity.ActivityCategories).map(
    (key) => Object.assign({id: key, name: Activity.CategoryPresentation[key]})
  );
}

export function getActivityCategories(categoryTypes: Array<ActivityEnabledType> = []): Array<string> {
  return categoryTypes.reduce(
    (list: Array<string>, category: ActivityEnabledType) => list.concat(Activity.ActivityCategories[category.id]), []
  );
}
