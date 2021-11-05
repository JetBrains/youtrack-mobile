/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from '../../components/analytics/analytics-ids';
import {getApi} from '../../components/api/api__instance';
import {getCustomFieldName} from '../../components/custom-field/custom-field-helper';
import {IconAngleDown} from '../../components/icon/icon';

import styles from './issues.styles';

import type API from '../../components/api/api';
import type {Folder} from '../../flow/User';
import type {CustomFilterField, IssueSortField, SearchSuggestions} from '../../flow/Sorting';

const issueSortFieldType: string = 'IssueFieldSortProperty';

type Props = {
  context: Folder,
  onApply: (sortProperties: Array<IssueSortField>) => any,
  query: string,
};

const MAX_NUMBER_PARTICIPATING_IN_SORTING_PROPERTIES: number = 4;


const IssuesSortBy = (props: Props) => {
  const api: API = getApi();

  const [selectedSortProperties, updateSelectedSortProperties] = useState([]);
  const [isSelectVisible, updateSelectVisible] = useState(false);

  const doAssist = useCallback(async (params: ?Object): Promise<SearchSuggestions> => {
    return await api.search.assist({
      folder: props.context.id ? props.context : undefined,
      query: props.query || '',
      ...params,
    });
  }, [api.search, props.context, props.query]);

  const loadAppliedSortProperties = useCallback(async (): Promise<SearchSuggestions> => {
    const searchSuggestions: SearchSuggestions = await doAssist();
    updateSelectedSortProperties(searchSuggestions.sortProperties);
  }, [doAssist]);

  const getUniqueSortProperties = (): Array<IssueSortField> => {
    const sortPropertiesIds = {};
    return selectedSortProperties.filter(
      (it: SearchSuggestions) => sortPropertiesIds[it.id] ? false : sortPropertiesIds[it.id] = true
    );
  };

  const getSortPropertyName = (sortProperty: IssueSortField): string => {
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

  useEffect(() => {
    loadAppliedSortProperties();
  }, [loadAppliedSortProperties, props.query]);

  const applySorting = async (sortProperties: Array<IssueSortField>) => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'issues-sort-by');
    const sProps: Array<SearchSuggestions> = sortProperties.filter(
      (sortProperty: SearchSuggestions) => !sortProperty.readOnly
    );
    const response: SearchSuggestions = await doAssist({sortProperties: sProps});
    props.onApply(response.query);
  };

  const loadSortProperties = async (): Promise<Array<IssueSortField>> => {
    const filterFields: Array<CustomFilterField> = await api.customFields.filterFields({
      // query: props.query,
      fld: props?.context?.id,
      getUnusedVisibleFields: true,
      fieldTypes: ['custom', 'predefined'],
    });
    return (
      filterFields
        .map((filterField: CustomFilterField) => ({
          $type: issueSortFieldType,
          asc: filterField.defaultSortAsc,
          id: filterField.id,
          sortField: filterField,
        }))
    );
  };

  const renderSortPropertiesSelect = (): React$Element<Select> => {
    const hideSelect = (): void => {updateSelectVisible(false);};
    const selectProps = {
      multi: true,
      selectedItems: selectedSortProperties,
      emptyValue: null,
      placeholder: 'Filter items',
      getTitle: (it: IssueSortField) => getSortPropertyName(it),
      dataSource: loadSortProperties,
      onSelect: (selectedItems: Array<IssueSortField>) => {
        updateSelectedSortProperties(selectedItems);
        hideSelect();
        applySorting(selectedItems);
      },
      onCancel: hideSelect,
    };
    return (
      <Select {...selectProps}/>
    );
  };

  const createSortButtonTitle = (): string => (
    getUniqueSortProperties(selectedSortProperties)
      .slice(0, MAX_NUMBER_PARTICIPATING_IN_SORTING_PROPERTIES)
      .map((it) => getSortPropertyName(it))
      .join(', ')
  );

  const renderSortButton = (): ?Node => {
    return selectedSortProperties.length ? (
      <AnimatedView
        testID= "test:id/issuesSortBy"
        accessibilityLabel= "issuesSortBy"
        accessible={true}
        useNativeDriver
        duration={500}
        animation="fadeIn"
      >
        <TouchableOpacity
          style={[styles.toolbarAction, styles.toolbarActionSortBy]}
          onPress={() => updateSelectVisible(true)}
        >
          <Text
            style={[styles.toolbarText, styles.toolbarSortByText]}
            numberOfLines={1}
          >
            Sort by {createSortButtonTitle()}
          </Text>
          <IconAngleDown size={20} color={styles.toolbarText.color}/>
        </TouchableOpacity>
      </AnimatedView>
    ) : null;
  };


  return (
    <>
      {renderSortButton()}
      {isSelectVisible && renderSortPropertiesSelect()}
    </>
  );
};

export default (React.memo<Props>(IssuesSortBy): React$AbstractComponent<Props, mixed>);
