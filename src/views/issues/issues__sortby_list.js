/* @flow */

import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import DraggableFlatList from 'react-native-draggable-flatlist';
import Header from '../../components/header/header';
import IssuesSortByAddAttribute from './issues__sortby_add-attribute';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from '../../components/analytics/analytics-ids';
import {doAssist, getSortPropertyName} from './issues__sortby-helper';
import {EllipsisVertical, IconAdd, IconBack} from '../../components/icon/icon';

import styles from './issues.styles';

import type {Folder} from '../../flow/User';
import type {IssueFieldSortProperty, SearchSuggestions} from '../../flow/Sorting';


type Props = {
  context: Folder,
  onApply: (sortProperties: Array<IssueFieldSortProperty>, query: string) => any,
  query: string,
  selectedSortProperties: Array<IssueFieldSortProperty>,
};

const MAX_SORT_ATTRIBUTES_AMOUNT: number = 4;


const IssuesSortByList = (props: Props) => {

  const [selectedSortProperties, updateSelectedSortProperties] = useState([]);

  useEffect(() => {
    updateSelectedSortProperties(props.selectedSortProperties);
  }, [props.selectedSortProperties]);

  const applySorting = async (sortProperties: Array<IssueFieldSortProperty>) => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'issues-sort-by');
    const sProps: Array<IssueFieldSortProperty> = sortProperties.filter(
      (sortProperty: IssueFieldSortProperty) => !sortProperty.readOnly
    );
    doAssist({context: props.context, query: props.query, sortProperties: sProps}).then(
      (response: SearchSuggestions) => {
        props.onApply(sortProperties, response.query);
      }
    );
  };

  const renderItem = ({ item, drag, isActive }: { item: IssueFieldSortProperty, drag : () => any, isActive: boolean }) => {
    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
        style={styles.sortByListItem}
      >
        <TouchableOpacity
          style={styles.sortByListItem}
          disabled={isActive}
          onLongPress={drag}
        >
          <EllipsisVertical size={20} color={styles.sortDrugIcon.color} styles={styles.sortDrugIcon}/>
          <Text style={styles.sortByListItemText}>{getSortPropertyName(item)}</Text>
        </TouchableOpacity>
      </AnimatedView>
    );
  };


  if (!props?.selectedSortProperties?.length) {
    return null;
  }

  return (
    <View style={styles.listContainer}>
      <Header
        showShadow={true}
        leftButton={<IconBack color={styles.link.color}/>}
        rightButton={<IconAdd style={styles.addLinkButton} color={styles.link.color} size={20}/>}
        onRightButtonClick={() => Router.Page({
          children: (
            <IssuesSortByAddAttribute
              context={props.context}
              selected={selectedSortProperties}
              onApply={(sortProperties: Array<IssueFieldSortProperty>) => {
                updateSelectedSortProperties(sortProperties);
                applySorting(sortProperties);
              }}
              query={props.query}
            />
          ),
        })}
        onBack={() => Router.pop()}
      >
        <Text style={styles.headerTitle}>Sort Attributes</Text>
      </Header>

      {selectedSortProperties.length > MAX_SORT_ATTRIBUTES_AMOUNT && (
        <Text style={styles.toolbarText}>
          Issues can be sorted by up to 4 attributes
        </Text>
      )}

      <DraggableFlatList
        containerStyle={styles.sortByList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"

        scrollEventThrottle={50}

        data={selectedSortProperties}
        onDragEnd={({ data }) => {
          //TODO
        }}
        keyExtractor={(item: IssueFieldSortProperty) => item.id}
        renderItem={renderItem}

        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}
      />
    </View>
  );
};

export default (React.memo<Props>(IssuesSortByList): React$AbstractComponent<Props, mixed>);
