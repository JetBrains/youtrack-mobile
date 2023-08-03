import React from 'react';
import {View} from 'react-native';
import Select from 'components/select/select';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {getCustomFieldName} from 'components/custom-field/custom-field-helper';
import {SELECT_ITEM_HEIGHT} from 'components/select/select.styles';
import type API from 'components/api/api';
import type {Folder} from 'types/User';
import type {
  CustomFilterField,
  IssueFieldSortProperty,
  PredefinedFilterField,
} from 'types/Sorting';
import {FilterField} from 'types/CustomFields';
type Props = {
  context: Folder;
  onApply: (sortProperties: IssueFieldSortProperty[]) => any;
  query: string;
  selected: IssueFieldSortProperty[];
  onHide: () => any;
};

const IssuesSortByAddAttribute = (props: Props) => {
  const api: API = getApi();

  const getSortPropertyName = (
    sortProperty: (
      | IssueFieldSortProperty
      | CustomFilterField
      | PredefinedFilterField
    ) &
      any,
  ): string => {
    const name = sortProperty
      ? sortProperty?.sortField?.sortablePresentation ||
        sortProperty.localizedName ||
        getCustomFieldName(sortProperty.sortField)
      : sortProperty;
    return name && sortProperty?.sortField?.$type === 'PredefinedFilterField'
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : name;
  };

  const loadSortProperties = async (): Promise<
    Array<IssueFieldSortProperty>
  > => {
    const filterFields: FilterField[] = await api.customFields.getSortableFilters(props?.context?.id);
    return filterFields.filter((it: FilterField) => it.sortable).map((filterField: any) => ({
      $type: 'IssueFieldSortProperty',
      asc: filterField.defaultSortAsc,
      id: filterField.id,
      sortField: filterField,
    }));
  };

  const applySorting = async (
    sortProperties: IssueFieldSortProperty[],
  ) => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'issues-sort-by');
    props.onApply(sortProperties);
  };

  const renderSortPropertiesSelect = (): React.ReactElement<
    React.ComponentProps<typeof Select>,
    typeof Select
  > => {
    const selectProps = {
      multi: true,
      getWrapperComponent: () => View,
      getWrapperProps: () => ({}),
      selectedItems: props.selected,
      emptyValue: null,
      getTitle: (it: CustomFilterField | IssueFieldSortProperty) =>
        getSortPropertyName(it),
      dataSource: loadSortProperties,
      onSelect: (selectedItems: IssueFieldSortProperty[]) => {
        applySorting(selectedItems);
        props.onHide();
      },
      onCancel: props.onHide,
      style: {
        marginBottom: SELECT_ITEM_HEIGHT,
      },
    };
    return <Select {...selectProps} />;
  };

  return renderSortPropertiesSelect();
};

export default React.memo<Props>(
  IssuesSortByAddAttribute,
) as React$AbstractComponent<Props, unknown>;
