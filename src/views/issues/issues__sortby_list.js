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
import {EllipsisVertical, IconAdd, IconBack, IconClose} from '../../components/icon/icon';
import {HIT_SLOP} from '../../components/common-styles/button';

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

  const onUpdate = (sortProperties: Array<IssueFieldSortProperty>): void => {
    updateSelectedSortProperties(sortProperties);
    applySorting(sortProperties);
  };

  const renderItem = ({item, drag, isActive}: { item: IssueFieldSortProperty, drag: () => any, isActive: boolean }) => {
    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
      >
        <TouchableOpacity
          style={styles.sortByListItem}
          disabled={isActive}
          onLongPress={drag}
        >
          <View style={styles.rowLine}>
            <EllipsisVertical
              size={22}
              color={styles.sortIcon.color}
            />
            <Text style={styles.sortByListItemText}>
              {getSortPropertyName(item)}
            </Text>
          </View>
          <View style={styles.rowLine}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => {
                onUpdate(
                  selectedSortProperties.filter((it: IssueFieldSortProperty) => it.id !== item.id)
                );
              }}
            >
              <IconClose size={20} color={styles.sortIcon.color}/>
            </TouchableOpacity>
          </View>
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
              onApply={onUpdate}
              query={props.query}
            />
          ),
        })}
        onBack={() => Router.pop()}
      >
        <Text style={styles.headerTitle}>Sort Attributes</Text>
      </Header>

      {selectedSortProperties.length > MAX_SORT_ATTRIBUTES_AMOUNT && (
        <View style={styles.searchContextPinned}>
          <Text style={styles.sortByListWarning}>
            Issues can be sorted by up to 4 attributes
          </Text>
        </View>
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
