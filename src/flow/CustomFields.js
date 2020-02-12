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
  plugins?: {
    timeTrackingSettings: {
      enabled: boolean,
      timeSpent: ?TimeTrackingFieldInfo
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
  color: ColorField
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

export type ProjectCustomFieldShort = {
  field: {
    id: string,
    name: string
  }
}

export type FieldValue = {
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

export type FieldValueShort = {
  id: string,
  name: string,
  ringId: string,
  avatarUrl: string,
  login: string,
  presentation: string,
  color: ColorField
}

export type CustomField = {
  $type: string,
  id: string,
  name: string,
  hasStateMachine: boolean,
  value: FieldValue|number,
  projectCustomField: ProjectCustomField
}

export type CustomFieldShort = {
  id: string,
  name: string,
  value: FieldValueShort | number,
  projectCustomField: ProjectCustomFieldShort
}

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
  imageDimension: ?ImageDimensions,
  thumbnailURL: string
}

export type IssueComment = {
  $type: string,
  id: string,
  created: number,
  textPreview: string,
  deleted: boolean,
  text: string,
  usesMarkdown: boolean,
  author: User
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
  trimmedIssues: Array<IssueOnList>
}
