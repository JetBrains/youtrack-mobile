import {getApi} from 'components/api/api__instance';

import {CustomField, FieldValue} from 'types/CustomFields';
import {ISelectProps} from 'components/select/select';

export const getCustomFieldSelectProps = ({
  field,
  onChangeSelection,
  onSelect,
  issueId,
}: {
  field: CustomField;
  onChangeSelection: (selectedItems: FieldValue[], current: FieldValue) => unknown;
  onSelect: (value: FieldValue) => unknown;
  issueId?: string;
}): ISelectProps => {
  const projectCustomField = field.projectCustomField;

  return {
    multi: projectCustomField.field.fieldType.isMultiValue,
    selectedItems: new Array().concat(field.value).filter(Boolean),
    emptyValue: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
    dataSource: async () => {
      if (field.hasStateMachine && issueId) {
        const items = await getApi().getStateMachineEvents(issueId, field.id);
        return items.map(it => ({id: it.id, name: `${it.id} (${it.presentation})`}));
      }

      return getApi().getCustomFieldValues(
        projectCustomField?.bundle?.id,
        projectCustomField.field.fieldType.valueType
      );
    },
    onChangeSelection,
    onSelect,
  };
};
