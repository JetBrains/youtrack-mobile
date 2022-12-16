/* @flow */

import {userNotFoundMessageMap} from 'components/activity-stream/activity__stream-vcs-helper';
import {ResourceTypes} from 'components/api/api__resource-types';

import type {User} from './User';

export type VcsProcessor = {
  $type: string,
  id: string,
  url: string,
  label: string,
}

export type VcsCommand = {
  $type: 'VcsCommand',
  end: number,
  errorText: string,
  hasError: boolean,
  start: number,
};

type NoHubUserReason = {
  $type: 'NoUserReason',
  id: $Keys<typeof userNotFoundMessageMap>,
};

type NoUserReason = {
  $type: string,
  id: $Keys<typeof userNotFoundMessageMap>,
};

export type VcsChange = {
  idExternal?: string,
  urls: Array<string>,
  files: number | -1,
  processors: Array<VcsProcessor>,
  author: User,
  noHubUserReason?: NoHubUserReason,
  fetched: number,
  noUserReason: NoUserReason,
  commands: Array<VcsCommand>,
  date: number,
  state: 0 | 1 | 2 | 3,
  userName: string,
  version: string,
  text: string,
  user: User,
  id: string,
  $type: $Keys<typeof ResourceTypes.VCS_ITEM>,
};

export type PullRequest = {
  author: User,
  date: number,
  fetched: number,
  files: number,
  id: string,
  idExternal: string,
  noHubUserReason: NoHubUserReason,
  noUserReason: NoUserReason,
  text: string,
  title: string,
  url: string,
  user: User,
  userName: string,
};

export type VCSActivity = VcsChange | PullRequest;
