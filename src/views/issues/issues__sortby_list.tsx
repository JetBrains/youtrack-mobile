import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {View as AnimatedView} from 'react-native-animatable';
import DraggableFlatList from 'react-native-draggable-dynamic-flatlist';
import Header from 'components/header/header';
import IconAscending from 'components/icon/assets/ascending.svg';
import IconDescending from 'components/icon/assets/descending.svg';
import IssuesSortByAddAttribute from './issues__sortby_add-attribute';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Select from 'components/select/select';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {
  doAssist,
  getSortPropertyName,
  isRelevanceSortProperty,
} from './issues-helper';
import {
  EllipsisVertical,
  IconAdd,
  IconCheck,
  IconClose,
} from 'components/icon/icon';
import {i18n} from 'components/i18n/i18n';
import {isSplitView} from 'components/responsive/responsive-helper';
import styles from './issues.styles';
import type {Folder} from 'types/User';
import type {IssueFieldSortProperty, SearchSuggestions} from 'types/Sorting';
type Props = {
  context: Folder;
  onApply: (
    sortProperties: IssueFieldSortProperty[],
    query: string,
  ) => any;
  query: string;
  selectedSortProperties: IssueFieldSortProperty[];
  onBack?: () => any;
};
const MAX_SORT_ATTRIBUTES_AMOUNT: number = 4;

const IssuesSortByList = (props: Props) => {
  const [selectedSortProperties, updateSelectedSortProperties] = useState([]);
  const [modalChildren, updateModalChildren] = useState(null);
  useEffect(() => {
    updateSelectedSortProperties(props.selectedSortProperties);
  }, [props.selectedSortProperties]);

  const applySorting = async (
    sortProperties: IssueFieldSortProperty[],
  ) => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'issues-sort-by');
    const sProps: IssueFieldSortProperty[] = sortProperties.filter(
      (sortProperty: IssueFieldSortProperty) => !sortProperty.readOnly,
    );
    return doAssist({
      context: props.context,
      query: props.query,
      sortProperties: sProps,
    }).then((response: SearchSuggestions | null | undefined) => {
      props.onApply(sortProperties, response?.query || '');
    });
  };

  const onUpdate = (sortProperties: IssueFieldSortProperty[]): void => {
    updateSelectedSortProperties(sortProperties);
  };

  const renderItem = ({
    item,
    move,
    isActive,
  }: {
    item: IssueFieldSortProperty;
    move: () => any;
    isActive: boolean;
  }) => {
    const IconSort: any = item.asc ? IconAscending : IconDescending;
    return (
      <AnimatedView useNativeDriver duration={500} animation="fadeIn">
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.sortByListItem,
            isActive ? styles.sortByListItemActive : null,
          ]}
          disabled={isActive}
          onLongPress={move}
        >
          <View style={styles.rowLine}>
            <EllipsisVertical size={22} color={styles.sortIcon.color} />
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
                    selectedSortProperties.map(
                      (it: IssueFieldSortProperty) => ({
                        ...it,
                        asc: it.id === item.id ? !it.asc : it.asc,
                      }),
                    ),
                  );
                }}
              >
                <IconSort size={20} color={styles.sortIcon.color} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.sortIconButton}
              onPress={() => {
                onUpdate(
                  selectedSortProperties.filter(
                    (it: IssueFieldSortProperty) => it.id !== item.id,
                  ),
                );
              }}
            >
              <IconClose size={20} color={styles.sortIcon.color} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </AnimatedView>
    );
  };

  const {onBack = () => Router.pop(true)} = props;

  if (!props?.selectedSortProperties?.length) {
    return null;
  }

  return (
    <View style={styles.listContainer}>
      <Header
        showShadow={true}
        leftButton={
          <IconClose
            size={21}
            color={styles.link.color}
            style={styles.sortIconBack}
          />
        }
        onBack={onBack}
        rightButton={
          <IconCheck
            size={20}
            color={styles.link.color}
            style={styles.sortByListAddIcon}
          />
        }
        onRightButtonClick={() => {
          applySorting(selectedSortProperties);
          onBack();
        }}
        extraButton={
          <TouchableOpacity
            style={styles.sortIconButton}
            onPress={() => {
              const isSplitViewMode: boolean = isSplitView();
              const issuesSortByAddAttribute = (
                <IssuesSortByAddAttribute
                  context={props.context}
                  selected={selectedSortProperties}
                  onApply={onUpdate}
                  query={props.query}
                  onHide={() => {
                    if (isSplitViewMode) {
                      updateModalChildren(null);
                    } else {
                      onBack();
                    }
                  }}
                />
              );

              if (isSplitViewMode) {
                updateModalChildren(issuesSortByAddAttribute);
              } else {
                Router.PageModal({
                  children: issuesSortByAddAttribute,
                });
              }
            }}
          >
            <IconAdd
              size={21}
              style={styles.sortByListAddIcon}
              color={styles.link.color}
            />
          </TouchableOpacity>
        }
      >
        <Text style={styles.headerTitle}>{i18n('Sort Attributes')}</Text>
      </Header>

      {selectedSortProperties.length > MAX_SORT_ATTRIBUTES_AMOUNT && (
        <View style={styles.searchContextPinned}>
          <Text style={styles.sortByListWarning}>
            {i18n('Issues can be sorted by up to 4 attributes')}
          </Text>
        </View>
      )}

      <DraggableFlatList
        containerStyle={styles.sortByList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={50}
        data={selectedSortProperties}
        onMoveEnd={({data}: {data: IssueFieldSortProperty[]}) => {
          updateSelectedSortProperties(data);
        }}
        scrollPercent={5}
        keyExtractor={(item: IssueFieldSortProperty) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}
      />

      <ModalPortal onHide={() => updateModalChildren(null)} hasOverlay={false}>
        {modalChildren}
      </ModalPortal>
    </View>
  );
};

export default React.memo<Props>(IssuesSortByList);
