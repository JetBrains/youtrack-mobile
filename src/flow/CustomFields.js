declare type IssueUser = {
  $type: string,
  login: string,
  id: string,
  ringId: string,
  avatarUrl: string,
  fullName: string
};

declare type IssueProject = {
  $type: string,
  id: string,
  name: string,
  shortName: string,
  ringId: string
}

declare type ColorField = {
  id: string,
  background: string,
  foreground: string
}

declare type Tag = {
  id: string,
  name: string,
  query: string,
  color: ColorField
}

declare type BundleValue = {
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

declare type ProjectCustomField = {
  $type: string,
  id: string,
  ordinal: number,
  canBeEmpty: boolean,
  emptyFieldText: ?string,
  bundle: {
    id: string,
    isUpdateable: boolean
  },
  field: {
    id: string,
    name: string,
    ordinal: number,
    isPublic: boolean,
    fieldType: {
      valueType: string,
      isMultiValue: boolean
    }
  },
  defaultValues: Array<BundleValue>
}

declare type ProjectCustomFieldShort = {
  field: {
    id: string,
    name: string
  }
}

declare type FieldValue = {
  $type: string,
  id: string,
  name: string,
  ringId: string,
  fullName: string,
  avatarUrl: string,
  login: string,
  minutes: number,
  presentation: string,
  isResolved: boolean,
  color: ColorField
}

declare type FieldValueShort = {
  id: string,
  name: string,
  ringId: string,
  avatarUrl: string,
  login: string,
  color: ColorField
}

declare type CustomField = {
  $type: string,
  id: string,
  name: string,
  hasStateMachine: boolean,
  value: FieldValue|number,
  projectCustomField: ProjectCustomField
}

declare type CustomFieldShort = {
  id: string,
  name: string,
  value: FieldValueShort | number,
  projectCustomField: ProjectCustomFieldShort
}

declare type Attachment = {
  $type: string,
  id: string,
  name: string,
  url: string,
  mimeType: string
}

declare type IssueComment = {
  $type: string,
  id: string,
  text: string,
  created: number,
  textPreview: string,
  author: IssueUser
}

declare type IssueLinkType = {
  uid: number,
  name: string,
  sourceToTarget: string,
  localizedSourceToTarget: ?string,
  targetToSource: string,
  localizedTargetToSource: ?string
}

declare type IssueLink = {
  $type: string,
  id: string,
  direction: 'string',
  linkType: IssueLinkType,
  trimmedIssues: Array<IssueOnList>
}
