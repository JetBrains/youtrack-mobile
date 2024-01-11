import type {IssueFull, IssueOnList} from './Issue';
import type {Reaction} from './Reaction';
import type {User} from './User';
import type {Visibility} from './Visibility';
import {Entity} from 'types/Entity';
import {Mentions} from 'components/wiki/markdown-view-rules';

export type ColorField = {
  id: string;
  background: string;
  foreground: string;
};
export type Tag = {
  id: string;
  name: string;
  query: string;
  pinned?: boolean;
  color: ColorField;
  owner: {
    id: string;
    ringId: string;
  };
};
export type BundleValue = {
  $type: string;
  id: string;
  name: string;
  description: string;
  ordinal: number;
  ringId: string;
  login: string;
  released: boolean;
  archived: boolean;
  isResolved: boolean;
  owner: {
    ringId: string;
    login: string;
  };
  color: ColorField;
};

interface ProjectCustomFieldBaseField {
  id: string;
  name: string;
  localizedName: string;
}

interface ProjectCustomFieldField  extends ProjectCustomFieldBaseField {
  ordinal: number;
  fieldType: {
    valueType: string;
    isMultiValue: boolean;
  };
}

export interface ProjectCustomFieldBase {
  $type: string;
  field: ProjectCustomFieldBaseField;
}

export interface ProjectCustomField extends Omit<ProjectCustomFieldBase, 'field'> {
  id: string;
  ordinal: number;
  canBeEmpty: boolean;
  emptyFieldText: string | null;
  isPublic: boolean;
  bundle: {
    id: string;
    isUpdateable: boolean;
  };
  field: ProjectCustomFieldField;
  defaultValues: BundleValue[];
}

export type FieldValue = {
  $type: string;
  id: string;
  ringId: string;
  name: string;
  fullName: string;
  avatarUrl: string;
  login: string;
  minutes: number;
  presentation: string;
  isResolved: boolean;
  color: ColorField;
  text: string;
};
export type CustomFieldValue =
  | number
  | string
  | FieldValue
  | Partial<FieldValue>
  | Partial<FieldValue>[]

export type CustomFieldBase = {
  $type: string;
  id: string;
  name: string;
  pausedTime?: number;
  projectCustomField: ProjectCustomField;
};
export type CustomField = {
  $type: string;
  id: string;
  name: string;
  hasStateMachine?: boolean;
  value: CustomFieldValue | CustomFieldValue[];
  localizedName?: string;
  projectCustomField: ProjectCustomField;
};
export type CustomFieldTextValue = {
  id: string | null | undefined;
  text: string;
};
export type CustomFieldText = CustomFieldBase & {
  value: {
    id: string | null | undefined;
    text: string;
  };
};
export type CustomFieldShort = Partial<CustomField>;
export type ImageDimensions = {
  width: number;
  height: number;
};
export type Attachment = {
  $type: string;
  id: string;
  name: string;
  url: string;
  mimeType: string;
  imageDimensions: ImageDimensions | undefined;
  thumbnailURL: string;
  visibility?: Visibility | null;
  author?: User;
};
export type IssueComment = {
  $type: string;
  id: string;
  created: number;
  updated: number;
  textPreview: string;
  deleted: boolean;
  text: string;
  usesMarkdown: boolean;
  author: User;
  visibility: Visibility | null;
  reactionOrder: string;
  reactions: Reaction[];
  issue?: Partial<IssueFull>;
  attachments?: Attachment[];
  mentions?: Mentions;
};
export type IssueLinkType = {
  id: string;
  name: string;
  sourceToTarget: string;
  localizedSourceToTarget: string | null | undefined;
  targetToSource: string;
  localizedTargetToSource: string | null | undefined;
  readOnly: string;
  aggregation: boolean;
  directed: boolean;
  localizedName: string;
};
export type IssueLink = {
  $type: string;
  id: string;
  idReadable: string;
  fields: CustomField[];
  direction: string;
  linkType: IssueLinkType;
  trimmedIssues: IssueOnList[];
  resolved: boolean;
  issuesSize: number;
  unresolvedIssuesSize: number;
};

export interface DraftCommentData {
  entity: Entity;
  getCommentDraft: () => Promise<IssueComment | null>,
  setDraft: Function;
}

export interface FilterField {
  $type: string,
  id: string,
  name: string,
  sortable?: string,
  customField?: {
    $type: string,
    id: string,
    name: string,
    aliases: string,
    localizedName: string,
    fieldType: {
      valueType: string,
      presentation: string,
      isBundleType: string,
      isMultiValue: string,
    },
  },
}

export interface FilterFieldValue {
  $type: string,
  id: string,
  presentation: string,
  query: string,
}
