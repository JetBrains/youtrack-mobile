import type {IssueFull, IssueOnList} from './Issue';
import type {Reaction} from './Reaction';
import type {User} from './User';
import type {Visibility} from './Visibility';
import {Entity, EntityBase} from 'types/Entity';
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

interface ICustomFieldValue {
  $type: string;
  id: string;
  name: string;
  localizedName: string;
}

export interface ICustomField extends ICustomFieldValue {
  fieldType: {
    isMultiValue: boolean;
    valueType: string;
  };
}

export interface ProjectCustomField extends EntityBase {
  canBeEmpty: boolean;
  emptyFieldText: string | null;
  isPublic: boolean;
  bundle: {
    id: string;
    isUpdateable: boolean;
  };
  field: ICustomField;
  defaultValues: BundleValue[];
}

export interface UserFieldValue extends EntityBase {
  avatarUrl: string;
  fullName: string;
  login: string;
  name: string;
  ringId: string;
}

export interface PeriodFieldValue extends EntityBase {
  minutes: number;
  presentation: string;
}

export interface StateFieldValue extends ICustomFieldValue {
  isResolved: boolean;
}

export type FloatIntNumberFieldValue = number;


export interface TextFieldValue {
  id: string;
  text: string;
}

export interface FieldValue extends ICustomFieldValue {
  ringId: string;
  fullName: string;
  avatarUrl: string;
  login: string;
  color: ColorField;
  text: string;
}

export type CustomFieldValue =
  | FloatIntNumberFieldValue
  | TextFieldValue
  | UserFieldValue
  | PeriodFieldValue
  | StateFieldValue;

export interface CustomFieldBase extends EntityBase {
  name: string;
  projectCustomField: ProjectCustomField;
  value: CustomFieldValue | CustomFieldValue[];
}

export interface CustomFieldSLA extends CustomFieldBase {
  pausedTime?: number;
}

export interface CustomField extends CustomFieldBase {
  localizedName?: string | null;
  hasStateMachine?: boolean;
}

export interface CustomFieldText extends Omit<CustomFieldBase, 'value'> {
  value: TextFieldValue;
}

export interface CustomFieldPeriod extends Omit<CustomFieldBase, 'value'> {
  value: PeriodFieldValue;
}

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
  imageDimensions?: ImageDimensions;
  thumbnailURL: string;
  visibility?: Visibility | null;
  author?: User;
};
export type IssueComment = {
  $type: string;
  id: string;
  canUpdateVisibility: boolean;
  created: number;
  updated: number;
  textPreview: string;
  deleted: boolean;
  text: string;
  usesMarkdown: boolean;
  author: User;
  visibility?: Visibility | null;
  reactionOrder: string;
  reactions: Reaction[];
  issue?: Partial<IssueFull>;
  article?: { id: string; };
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
