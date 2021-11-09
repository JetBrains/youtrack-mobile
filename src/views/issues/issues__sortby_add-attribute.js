/* @flow */

import React from 'react';
import {View} from 'react-native';


import Router from '../../components/router/router';
import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from '../../components/analytics/analytics-ids';
import {getApi} from '../../components/api/api__instance';
import {getCustomFieldName} from '../../components/custom-field/custom-field-helper';

import type API from '../../components/api/api';
import type {Folder} from '../../flow/User';
import type {CustomFilterField, IssueFieldSortProperty, PredefinedFilterField} from '../../flow/Sorting';

type Props = {
  context: Folder,
  onApply: (sortProperties: Array<IssueFieldSortProperty>) => any,
  query: string,
  selected: Array<IssueFieldSortProperty>,
};


const IssuesSortByAddAttribute = (props: Props) => {
  const api: API = getApi();

  const getSortPropertyName = (
    sortProperty: (IssueFieldSortProperty | CustomFilterField | PredefinedFilterField) & any
  ): string => {
    const name = (
      sortProperty
        ? (
          sortProperty?.sortField?.sortablePresentation ||
          sortProperty.localizedName ||
          getCustomFieldName(sortProperty.sortField)
        )
        : sortProperty
    );

    return (
      name && sortProperty?.sortField?.$type === 'PredefinedFilterField'
        ? name.charAt(0).toUpperCase() + name.slice(1)
        : name
    );
  };

  const loadSortProperties = async (): Promise<Array<IssueFieldSortProperty>> => {
    const filterFields: Array<CustomFilterField> = await api.customFields.filterFields({
      fld: props?.context?.id,
      getUnusedVisibleFields: true,
      fieldTypes: ['custom', 'predefined'],
    });
    return (
      filterFields
        .map((filterField: any) => ({
          $type: 'IssueFieldSortProperty',
          asc: filterField.defaultSortAsc,
          id: filterField.id,
          sortField: filterField,
        }))
    );
  };

  const applySorting = async (sortProperties: Array<IssueFieldSortProperty>) => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'issues-sort-by');
    props.onApply(sortProperties);
  };

  const renderSortPropertiesSelect = (): React$Element<typeof Select> => {
    const hide = (): void => {Router.pop();};
    const selectProps = {
      multi: true,
      getWrapperComponent: () => View,
      getWrapperProps: () => ({}),
      selectedItems: props.selected,
      emptyValue: null,
      placeholder: 'Filter items',
      getTitle: (it: CustomFilterField | IssueFieldSortProperty) => getSortPropertyName(it),
      dataSource: loadSortProperties,
      onSelect: (selectedItems: Array<IssueFieldSortProperty>) => {
        applySorting(selectedItems);
        hide();
      },
      onCancel: hide,
    };
    return (
      <Select {...selectProps}/>
    );
  };


  return renderSortPropertiesSelect();
};

export default (React.memo<Props>(IssuesSortByAddAttribute): React$AbstractComponent<Props, mixed>);
