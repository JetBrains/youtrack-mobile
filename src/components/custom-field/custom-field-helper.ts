import type {
  CustomField,
  CustomFieldBase,
  CustomFieldText,
  CustomFieldValue,
  ProjectCustomField,
} from 'types/CustomFields';
type AnyCustomField = Partial<CustomField & CustomFieldText>;

const isProjectCustomField = (customField: ProjectCustomField): boolean => {
  return customField?.$type
    ? customField.$type.indexOf('ProjectCustomField') !== -1
    : false;
};

const getSimpleCustomFieldType = (
  customField: ProjectCustomField | null | undefined,
): string | null | undefined => {
  if (!customField) {
    return null;
  }

  const fieldType = isProjectCustomField(customField)
    ? customField.field.fieldType
    : customField.fieldType;
  return fieldType ? fieldType.valueType : null;
};

const isTextCustomField = (customField: ProjectCustomField): boolean => {
  if (!customField) {
    return false;
  }

  const valueType: string | null | undefined = getSimpleCustomFieldType(
    customField,
  );
  return valueType ? valueType === 'text' : false;
};

const isRequiredCustomField = (
  customField: CustomFieldBase | CustomFieldText | CustomField,
): boolean => {
  if (!customField || !customField?.projectCustomField) {
    return false;
  }

  return !customField.projectCustomField.canBeEmpty;
};

const getIssueTextCustomFields = (
  issueCustomFields: AnyCustomField[] = [],
): CustomFieldText[] =>
  issueCustomFields.filter((field: AnyCustomField) =>
    isTextCustomField(field.projectCustomField),
  );

const getIssueCustomFieldsNotText = (
  issueCustomFields: AnyCustomField[] = [],
): CustomField[] =>
  issueCustomFields.filter(
    (field: AnyCustomField) => !isTextCustomField(field.projectCustomField),
  );

const updateCustomFieldValue = (
  fields: AnyCustomField[] = [],
  cf: AnyCustomField,
  value: CustomFieldValue,
): AnyCustomField[] => {
  const index: number = fields.findIndex((f: AnyCustomField) => f.id === cf.id);
  return index >= 0
    ? [
        ...fields.slice(0, index),
        {...fields[index], value},
        ...fields.slice(index + 1),
      ]
    : fields;
};

const getCustomFieldName = (customField: Partial<AnyCustomField>): string => {
  return customField?.localizedName || customField?.name || '';
};

export {
  getCustomFieldName,
  getIssueTextCustomFields,
  getIssueCustomFieldsNotText,
  getSimpleCustomFieldType,
  isTextCustomField,
  isRequiredCustomField,
  updateCustomFieldValue,
};
