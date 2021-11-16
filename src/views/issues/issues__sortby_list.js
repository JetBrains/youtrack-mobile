/* @flow */

import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import DraggableFlatList from 'react-native-draggable-flatlist';
import Header from '../../components/header/header';
import IconAscending from '../../components/icon/assets/ascending.svg';
import IconDescending from '../../components/icon/assets/descending.svg';
import IssuesSortByAddAttribute from './issues__sortby_add-attribute';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from '../../components/analytics/analytics-ids';
import {doAssist, getSortPropertyName, isRelevanceSortProperty} from './issues__sortby-helper';
import {EllipsisVertical, IconAdd, IconCheck, IconClose} from '../../components/icon/icon';

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
    return doAssist({context: props.context, query: props.query, sortProperties: sProps}).then(
      (response: SearchSuggestions) => {
        props.onApply(sortProperties, response.query);
      }
    );
  };

  const onUpdate = (sortProperties: Array<IssueFieldSortProperty>): void => {
    updateSelectedSortProperties(sortProperties);
  };

  const renderItem = ({item, drag, isActive}: { item: IssueFieldSortProperty, drag: () => any, isActive: boolean }) => {
    const IconSort: any = item.asc ? IconAscending : IconDescending;
    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.sortByListItem,
            isActive ? styles.sortByListItemActive : null,
          ]}
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
            {!isRelevanceSortProperty(item) && (
              <TouchableOpacity
                style={styles.sortIconButton}
                onPress={() => {
                  onUpdate(
                    selectedSortProperties.map((it: IssueFieldSortProperty) => ({
                      ...it,
                      asc: it.id === item.id ? !it.asc : it.asc,
                    }))
                  );
                }}
              >
                <IconSort size={20} color={styles.sortIcon.color}/>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.sortIconButton}
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

        leftButton={<IconClose size={21} color={styles.link.color}/>}
        onBack={() => Router.pop(true)}

        rightButton={<IconCheck size={20} color={styles.link.color}/>}
        onRightButtonClick={() => {
          applySorting(selectedSortProperties);
          Router.pop();
        }}

        extraButton={<TouchableOpacity
          style={styles.sortIconButton}
          onPress={() => Router.PageModal({
            children: (
              <IssuesSortByAddAttribute
                context={props.context}
                selected={selectedSortProperties}
                onApply={onUpdate}
                query={props.query}
              />
            ),
          })}
        >
          <IconAdd size={21} style={styles.sortByListAddIcon} color={styles.link.color}/>
        </TouchableOpacity>}
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
        onDragEnd={({data}: {data: Array<IssueFieldSortProperty>}) => {
          updateSelectedSortProperties(data);
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
