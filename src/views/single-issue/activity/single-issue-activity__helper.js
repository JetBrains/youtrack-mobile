/* @flow */

import {flushStoragePart, getStorageState} from '../../../components/storage/storage';
import {checkVersion} from '../../../components/feature/feature';
import {Activity} from '../../../components/activity/activity__category';

import type {ActivityEnabledType, ActivityItem} from '../../../flow/Activity';
import type {IssueComment} from '../../../flow/CustomFields';


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
