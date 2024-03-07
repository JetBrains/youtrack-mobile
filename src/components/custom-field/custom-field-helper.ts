import type {
  CustomField,
  CustomFieldBase,
  CustomFieldText,
  CustomFieldValue,
  ProjectCustomField,
} from 'types/CustomFields';

export type AnyCustomField = Partial<CustomField & CustomFieldText>;

const isProjectCustomField = (customField: ProjectCustomField): boolean => {
  return customField?.$type ? customField.$type.indexOf('ProjectCustomField') !== -1 : false;
};

const getSimpleCustomFieldType = (customField: ProjectCustomField | null | undefined): string | null | undefined => {
  if (!customField) {
    return null;
  }

  const fieldType = isProjectCustomField(customField) ? customField.field.fieldType : customField.fieldType;
  return fieldType ? fieldType.valueType : null;
};

const isTextCustomField = (customField: ProjectCustomField): boolean => {
  if (!customField) {
    return false;
  }

  const valueType: string | null | undefined = getSimpleCustomFieldType(customField);
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

const getCustomFieldName = (customField: CustomField): string => {
  return customField?.localizedName || customField?.name || '';
};

const isSLAField = (cf: CustomField): boolean => cf.$type === 'SlaIssueCustomField';

export {
  getCustomFieldName,
  getIssueTextCustomFields,
  getIssueCustomFieldsNotText,
  getSimpleCustomFieldType,
  isTextCustomField,
  isRequiredCustomField,
  isSLAField,
  updateCustomFieldValue,
};
