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
  localizedName: string,
  description: string,
  assembleDate: string,
  ordinal: number,
  ringId: string,
  login: string,
  released: boolean,
  archived: boolean,
  releaseDate: string,
  hasRunningJob: boolean,
  isResolved: boolean,
  IssueUsersCount: number,
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
    localizedName: string,
    isPublic: boolean,
    fieldType: {
      valueType: string,
      isMultiValue: boolean
    }
  },
  defaultValues: Array<BundleValue>
}

declare type FieldValue = {
  $type: string,
  id: string,
  name: string,
  localizedName: string,
  ringId: string,
  fullName: string,
  avatarUrl: string,
  login: string,
  minutes: number,
  presentation: string,
  isResolved: boolean,
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
