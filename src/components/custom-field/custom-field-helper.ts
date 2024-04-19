import {
  CustomField,
  CustomFieldBase,
  CustomFieldText,
  CustomFieldValue,
  ICustomField,
  ProjectCustomField,
} from 'types/CustomFields';

export type AnyCustomField = Partial<CustomField & CustomFieldText>;

export const getCustomFieldType = (customField: ICustomField): string | null => {
  if (customField.fieldType) {
    return customField.fieldType?.valueType || null;
  }
  return null;
};

const getFieldType = (f: ProjectCustomField | ICustomField | null): string | null => {
  if (!f) {
    return null;
  }
  if ('field' in f) {
    return getCustomFieldType(f.field);
  }
  return 'fieldType' in f ? getCustomFieldType(f) : null;
};

const isTextCustomField = (customField: ProjectCustomField): boolean => {
  if (!customField) {
    return false;
  }

  const valueType: string | null = getFieldType(customField);
  return valueType ? valueType === 'text' : false;
};

const isRequiredCustomField = (customField: CustomFieldBase | CustomFieldText | CustomField): boolean => {
  if (!customField || !customField?.projectCustomField) {
    return false;
  }

  return !customField.projectCustomField.canBeEmpty;
};

const getIssueTextCustomFields = (issueCustomFields: CustomFieldBase[] = []) =>
  issueCustomFields.filter((field: CustomFieldBase) => isTextCustomField(field.projectCustomField));

const getIssueCustomFieldsNotText = (issueCustomFields: CustomFieldBase[] = []): CustomField[] =>
  issueCustomFields.filter(field => !isTextCustomField(field.projectCustomField));

const updateCustomFieldValue = (
  fields: CustomFieldBase[] = [],
  cf: CustomFieldBase,
  value: CustomFieldValue
): CustomFieldBase[] => {
  const index: number = fields.findIndex(f => f.id === cf.id);
  return index >= 0 ? [...fields.slice(0, index), {...fields[index], value}, ...fields.slice(index + 1)] : fields;
};

const getLocalizedName = (customField: {localizedName?: string | null; name?: string}): string => {
  return customField?.localizedName || customField?.name || '';
};

const isSLAField = (cf: CustomField): boolean => cf.$type === 'SlaIssueCustomField';

const projectCustomFieldTypeToFieldType = ($type: string, isMultiValue: boolean): string => {
  const prefix = isMultiValue ? 'Multi' : 'Single';
  const map: {
    [k: string]: string | undefined;
  } = {
    BuildProjectCustomField: `${prefix}BuildIssueCustomField`,
    StateProjectCustomField: 'StateMachineIssueCustomField',
    VersionProjectCustomField: `${prefix}VersionIssueCustomField`,
    EnumProjectCustomField: `${prefix}EnumIssueCustomField`,
    UserProjectCustomField: `${prefix}UserIssueCustomField`,
    GroupProjectCustomField: `${prefix}GroupIssueCustomField`,
    OwnedProjectCustomField: `${prefix}OwnedIssueCustomField`,
    PeriodProjectCustomField: 'PeriodIssueCustomField',
    SimpleProjectCustomField: 'SimpleIssueCustomField',
    SlaIssueCustomField: 'SlaIssueCustomField',
    TextProjectCustomField: 'TextIssueCustomField',
  };
  return map[$type] || $type;
};

export {
  getLocalizedName,
  getIssueTextCustomFields,
  getIssueCustomFieldsNotText,
  getFieldType,
  isTextCustomField,
  isRequiredCustomField,
  isSLAField,
  projectCustomFieldTypeToFieldType,
  updateCustomFieldValue,
};
