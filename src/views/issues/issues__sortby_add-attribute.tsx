import React from 'react';
import {View} from 'react-native';

import Select, {ISelectProps} from 'components/select/select';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {getSortPropertyName} from 'views/issues/issues-helper';
import {SELECT_ITEM_HEIGHT} from 'components/select/select.styles';
import {until} from 'util/util';

import type {Folder} from 'types/User';
import type {FilterField, IssueFieldSortProperty} from 'types/Sorting';

interface Props {
  context: Folder;
  onApply: (sortProperties: IssueFieldSortProperty[]) => void;
  query: string;
  selected: IssueFieldSortProperty[];
  onHide: () => void;
}

const IssuesSortByAddAttribute = (props: Props) => {

  const loadSortProperties = async (): Promise<IssueFieldSortProperty[]> => {
    const [error, filterFields] = await until<FilterField[]>(
      getApi().customFields.getSortableFilters(props?.context?.id)
    );
    return error ? [] : filterFields
      .filter((it: FilterField) => it.sortable)
      .map((filterField: FilterField) => {
        return {
          $type: 'IssueFieldSortProperty',
          asc: filterField.defaultSortAsc,
          id: filterField.id,
          sortField: filterField,
        };
      });
  };

  const applySorting = async (
    sortProperties: IssueFieldSortProperty[],
  ) => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'issues-sort-by');
    props.onApply(sortProperties);
  };

  const renderSortPropertiesSelect = () => {
    const selectProps: ISelectProps = {
      multi: true,
      getWrapperComponent: () => View,
      getWrapperProps: () => ({}),
      selectedItems: props.selected,
      emptyValue: null,
      getTitle: (it: IssueFieldSortProperty) => getSortPropertyName(it),
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

export default React.memo<Props>(IssuesSortByAddAttribute);
