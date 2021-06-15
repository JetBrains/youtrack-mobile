/* @flow */

import type {IssueFull, IssueOnList} from './Issue';
import type {Reaction} from './Reaction';
import type {User} from './User';
import type {Visibility} from './Visibility';
import type {WorkItemType} from './Work';

export type TimeTrackingFieldInfo = {
  id: string,
  field: {
    id: string,
    name: string
  }
};

export type IssueProject = {
  $type: string,
  id: string,
  name: string,
  shortName: string,
  archived: boolean,
  ringId: string,
  pinned: boolean,
  plugins?: {
    timeTrackingSettings: {
      enabled: boolean,
      timeSpent: ?TimeTrackingFieldInfo,
      workItemTypes: Array<WorkItemType>
    }
  }
}

export type ColorField = {
  id: string,
  background: string,
  foreground: string
}

export type Tag = {
  id: string,
  name: string,
  query: string,
  pinned?: boolean,
  color: ColorField,
  owner: {
    id: string,
    ringId: string
  },
}

export type BundleValue = {
  $type: string,
  id: string,
  name: string,
  description: string,
  ordinal: number,
  ringId: string,
  login: string,
  released: boolean,
  archived: boolean,
  isResolved: boolean,
  owner: {
    ringId: string,
    login: string
  },
  color: ColorField
}

export type ProjectCustomField = {
  $type: string,
  id: string,
  ordinal: number,
  canBeEmpty: boolean,
  emptyFieldText: ?string,
  isPublic: boolean,
  bundle: {
    id: string,
    isUpdateable: boolean
  },
  field: {
    id: string,
    name: string,
    ordinal: number,
    fieldType: {
      valueType: string,
      isMultiValue: boolean
    }
  },
  defaultValues: Array<BundleValue>
}

export type FieldValue = {
  $type: string,
  id: string,
  ringId: string,

  name: string,

  fullName: string,
  avatarUrl: string,
  login: string,

  minutes: number,

  presentation: string,

  isResolved: boolean,

  color: ColorField
}

export type CustomFieldValue = FieldValue | number | string | Array<any>;

export type CustomField = {
  $type: string,
  id: string,
  name: string,
  hasStateMachine: boolean,
  value: CustomFieldValue,
  projectCustomField: ProjectCustomField
}

export type CustomFieldShort = $Shape<CustomField>

export type ImageDimensions = {
  width: number,
  height: number
};

export type Attachment = {
  $type: string,
  id: string,
  name: string,
  url: string,
  mimeType: string,
  imageDimensions: ?ImageDimensions,
  thumbnailURL: string,
  visibility?: Visibility
}

export type IssueComment = {
  $type: string,
  id: string,
  created: number,
  textPreview: string,
  deleted: boolean,
  text: string,
  usesMarkdown: boolean,
  author: User,
  visibility: Visibility,
  reactionOrder?: string,
  reactions?: Array<Reaction>,
  issue?: IssueFull,
  attachments?: Array<Attachment>
}

export type IssueLinkType = {
  name: string,
  sourceToTarget: string,
  localizedSourceToTarget: ?string,
  targetToSource: string,
  localizedTargetToSource: ?string
}

export type IssueLink = {
  $type: string,
  id: string,
  direction: 'string',
  linkType: IssueLinkType,
  trimmedIssues: Array<IssueOnList>,
  resolved: boolean,
}
