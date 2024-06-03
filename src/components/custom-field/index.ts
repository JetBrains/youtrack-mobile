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
    dataSource: () => {
      const api = getApi();
      if (field.hasStateMachine && issueId) {
        return api.getStateMachineEvents(issueId, field.id).then(
          (
            items: {
              id: string;
              presentation: string;
            }[]
          ) =>
            items.flatMap(it => ({
              name: `${it.id} (${it.presentation})`,
            }))
        );
      }

      return api.getCustomFieldValues(projectCustomField?.bundle?.id, projectCustomField.field.fieldType.valueType);
    },
    onChangeSelection,
    onSelect,
  };
};
