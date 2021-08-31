/* @flow */

import {userNotFoundMessageMap} from '../components/activity-stream/activity__stream-vcs-helper';
import {ResourceTypes} from '../components/api/api__resource-types';

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

export type VcsChangeState = {
  attached: 0,
  detached: 0,
  legacy: any,
}

export type VcsChange = {
  idExternal?: string,
  urls: Array<string>,
  files: number | -1,
  processors: Array<VcsProcessor>,
  author: User,
  noHubUserReason?: {
    $type: 'NoUserReason',
    id: $Keys<typeof userNotFoundMessageMap>,
  },
  fetched: number,
  noUserReason: {
    $type: string,
    id: $Keys<typeof userNotFoundMessageMap>,
  },
  commands: Array<VcsCommand>,
  date: number,
  state: VcsChangeState,
  userName: string,
  version: string,
  text: string,
  user: User,
  id: string,
  $type: $Keys<typeof ResourceTypes.VCS_ITEM>,
};

