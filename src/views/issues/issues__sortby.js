/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import IssuesSortByList from './issues__sortby_list';
import Router from '../../components/router/router';
import {doAssist, getSortPropertyName} from './issues__sortby-helper';
import {IconAngleDown} from '../../components/icon/icon';

import styles from './issues.styles';

import type {Folder} from '../../flow/User';
import type {IssueFieldSortProperty, SearchSuggestions} from '../../flow/Sorting';


type Props = {
  context: Folder,
  onApply: (query: string) => any,
  query: string,
};

const MAX_NUMBER_SORTING_PROPERTIES: number = 4;


const IssuesSortBy = (props: Props) => {
  const [selectedSortProperties, updateSelectedSortProperties] = useState([]);

  const loadSortingProperties = useCallback(() => {
    doAssist({context: props.context, query: props.query}).then((searchSuggestions: SearchSuggestions ) => {
      updateSelectedSortProperties(searchSuggestions.sortProperties);
    });
  }, [props.context, props.query]);

  useEffect(() => {
    loadSortingProperties();
  }, [loadSortingProperties]);


  const getUniqueSortProperties = (sortProperties: Array<IssueFieldSortProperty>): Array<IssueFieldSortProperty> => {
    const sortPropertiesIds = {};
    return sortProperties.filter(
      (it: IssueFieldSortProperty) => sortPropertiesIds[it.id] ? false : sortPropertiesIds[it.id] = true
    );
  };

  const createSortButtonTitle = (sortProperties: Array<IssueFieldSortProperty>): string => {
    const uniqueSortProperties = getUniqueSortProperties(sortProperties);
    return (
      uniqueSortProperties
        .slice(0, MAX_NUMBER_SORTING_PROPERTIES)
        .map((it: IssueFieldSortProperty) => getSortPropertyName(it))
        .join(', ')
    );
  };


  return (
    selectedSortProperties.length ? (
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
          onPress={() => {
            Router.PageModal({
              children: (
                <IssuesSortByList
                  context={props.context}
                  onApply={(sortProperties: Array<IssueFieldSortProperty>, query: string) => {
                    updateSelectedSortProperties(sortProperties);
                    props.onApply(query);
                    if (sortProperties.length === 0) {
                      loadSortingProperties();
                      Router.pop();
                    }
                  }}
                  query={props.query}
                  selectedSortProperties={selectedSortProperties}
                />
              ),
            });
          }}
        >
          <Text
            style={[styles.toolbarText, styles.toolbarSortByText]}
            numberOfLines={1}
          >
            Sort by {createSortButtonTitle(selectedSortProperties)}
          </Text>
          <IconAngleDown size={20} color={styles.toolbarText.color}/>
        </TouchableOpacity>
      </AnimatedView>
    ) : null
  );
};

export default (React.memo<Props>(IssuesSortBy): React$AbstractComponent<Props, mixed>);
