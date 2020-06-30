/* @flow */

import {flushStoragePart, getStorageState} from '../../../components/storage/storage';
import {checkVersion} from '../../../components/feature/feature';
import {Activity} from '../../../components/activity/activity__category';

import type {ActivityType, ActivityItem} from '../../../flow/Activity';
import type {IssueComment} from '../../../flow/CustomFields';
import type {StorageState} from '../../../components/storage/storage';


export function isActivitiesAPIEnabled() {
  return checkVersion('2018.3');
}

export function getIssueActivitiesEnabledTypes(): Array<ActivityType> {
  let enabledTypes = getStorageState().issueActivitiesEnabledTypes || [];
  if (!enabledTypes.length) {
    enabledTypes = getIssueActivityAllTypes();
    saveIssueActivityEnabledTypes(enabledTypes);
  }
  return enabledTypes;
}

export function saveIssueActivityEnabledTypes(enabledTypes: Array<ActivityType>) {
  enabledTypes && flushStoragePart({issueActivitiesEnabledTypes: enabledTypes});
}

export async function toggleIssueActivityEnabledType(type: ActivityType, enable: boolean): Promise<StorageState> {
  let enabledTypes: Array<ActivityType> = getIssueActivitiesEnabledTypes();

  if (enable) {
    enabledTypes.push(type);
  } else {
    enabledTypes = enabledTypes.filter(it => it.id !== type.id);
  }

  return flushStoragePart({issueActivitiesEnabledTypes: enabledTypes});
}

export function getIssueActivityAllTypes(): Array<ActivityType> {
  return Object.keys(Activity.ActivityCategories).map(
    (key) => Object.assign({id: key, name: Activity.CategoryPresentation[key]})
  );
}

export function getActivityCategories(categoryTypes: Array<ActivityType> = []): Array<string> {
  return categoryTypes.reduce(
    (list: Array<string>, category: ActivityType) => list.concat(Activity.ActivityCategories[category.id]), []
  );
}

export function convertCommentsToActivityPage(comments: Array<IssueComment> = []): Array<ActivityItem> {
  return comments.map((comment: IssueComment) => createActivityItemFrom(comment));
}

function createActivityItemFrom(comment: IssueComment): ActivityItem {
  return {
    $type: 'CommentActivityItem',
    added: [comment],
    author: comment.author,
    authorGroup: null,
    category: {id: 'CommentsCategory', $type: 'ActivityCategory'},
    field: {$type: 'PredefinedFilterField', presentation: 'comments', id: 'comments'},
    id: `${comment.id}.0-0`,
    removed: [],
    target: {$type: 'IssueComment', created: comment.created, id: comment.id, usesMarkdown: comment.usesMarkdown},
    targetMember: null,
    timestamp: comment.created
  };
}
