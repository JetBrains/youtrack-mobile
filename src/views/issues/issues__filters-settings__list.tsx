import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

// @ts-ignore
import DraggableFlatList from 'react-native-draggable-dynamic-flatlist';
import {useDispatch} from 'react-redux';
import {View as AnimatedView} from 'react-native-animatable';

import Header from 'components/header/header';
import ModalPortal from 'components/modal-view/modal-portal';
import Select, {SelectModal} from 'components/select/select';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {EllipsisVertical, IconAdd, IconCheck, IconClose} from 'components/icon/icon';
import {getApi} from 'components/api/api__instance';
import {getLocalizedName} from 'components/custom-field/custom-field-helper';
import {getSearchContext} from 'views/issues/issues-actions';
import {i18n} from 'components/i18n/i18n';
import {isSplitView} from 'components/responsive/responsive-helper';
import {until} from 'util/util';

import styles from './issues.styles';

import type {FilterField} from 'types/Sorting';
import type {FilterFieldSetting} from 'views/issues/index';
import type {ICustomField} from 'types/CustomFields';
import type {ReduxThunkDispatch} from 'types/Redux';
import usage from 'components/usage/usage';

const IssuesFiltersSettingList = ({
  filters,
  onApply,
  onBack,
}: {
  filters: FilterFieldSetting[];
  onApply: (filters: FilterFieldSetting[]) => void;
  onBack: () => void;
}) => {
  const isSplitViewMode = isSplitView();
  const dispatch: ReduxThunkDispatch = useDispatch();

  const contextId = dispatch(getSearchContext()).id;
  const cachedFilterFields = React.useRef<Array<FilterField> | null>(null);

  const [sorted, setSorted] = React.useState<FilterFieldSetting[]>([]);
  const [addFilterComponent, setAddFilterComponent] = useState<React.ReactNode>(null);

  React.useEffect(() => {
    usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'Display filter settings');
    if (filters) {
      setSorted(filters);
    }
  }, [filters]);

  const getPredefinedFilterPresentation = (ff: FilterField) => {
    if ('customFiled' in ff) {
      return getLocalizedName(ff.customFiled as ICustomField);
    }
    return ff.name || ff.id;
  };

  const getFilterSettingPresentation = (fs: FilterFieldSetting) => {
    const filterField = fs.filterField[0];
    return filterField ? getPredefinedFilterPresentation(filterField) : fs.id;
  };

  const getFilterPresentation = (ff: FilterFieldSetting | FilterField) => {
    let name: string;
    if ('filterField' in ff) {
      name = getFilterSettingPresentation(ff);
    } else {
      name = getPredefinedFilterPresentation(ff);
    }
    return `${name[0].toUpperCase()}${name.slice(1)}`;
  };

  const toSelectItem = (i: FilterField) => {
    return {
      filterField: [i.customField],
      id: i.name.toLowerCase(),
      name: i.name,
      selectedValues: [],
    };
  };

  const renderItem = ({item, move, isActive}: {item: FilterFieldSetting; move: () => void; isActive: boolean}) => {
    return (
      <AnimatedView animation="fadeIn" duration={500} useNativeDriver>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.sortByListItem, isActive ? styles.sortByListItemActive : null]}
          disabled={isActive}
          onLongPress={move}
        >
          <View style={styles.rowLine}>
            <EllipsisVertical color={styles.sortIcon.color} />
            <Text style={styles.sortByListItemText}>{getFilterPresentation(item)}</Text>
          </View>
          <View style={styles.rowLine}>
            <TouchableOpacity
              style={styles.sortIconButton}
              onPress={() => setSorted(sorted.filter((it: FilterFieldSetting) => it.id !== item.id))}
            >
              <IconClose color={styles.sortIcon.color} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </AnimatedView>
    );
  };

  const renderAddItemTitle = (el: FilterFieldSetting) => (
    <Text style={styles.sortByListItemText}>{el.name}</Text>
  );

  const renderAddItemComponent = () => {
    const Container: React.ElementType = isSplitViewMode ? SelectModal : Select;
    setAddFilterComponent(
      <Container
        multi={true}
        selectedItems={sorted}
        onCancel={() => setAddFilterComponent(null)}
        titleRenderer={renderAddItemTitle}
        dataSource={async (q: string) => {
          let _filters;
          if (cachedFilterFields.current) {
            _filters = cachedFilterFields.current;
          } else {
            const [error, filteredFilters] = await until<Array<FilterField>>(
              getApi().customFields.getFilters(contextId, q)
            );
            cachedFilterFields.current = filteredFilters;
            _filters = error ? [] : filteredFilters;
          }
          return _filters.map(toSelectItem);
        }}
        onSelect={(selected: FilterFieldSetting[]) => {
          setSorted(selected);
          setAddFilterComponent(null);
        }}
      />
    );
  };

  return (
    <View style={styles.listContainer}>
      <Header
        showShadow={true}
        leftButton={<IconClose color={styles.link.color} style={styles.sortIconBack} />}
        onBack={onBack}
        rightButton={<IconCheck color={styles.link.color} style={styles.sortByListAddIcon} />}
        onRightButtonClick={() => {
          usage.trackEvent(ANALYTICS_ISSUES_PAGE, 'Update filter settings');
          onApply(sorted);
          setAddFilterComponent(null);
          onBack();
        }}
        extraButton={
          <TouchableOpacity style={styles.sortIconButton} onPress={renderAddItemComponent}>
            <IconAdd style={styles.sortByListAddIcon} color={styles.link.color} />
          </TouchableOpacity>
        }
      >
        <Text style={styles.headerTitle}>{i18n('Filter Settings')}</Text>
      </Header>

      <DraggableFlatList
        containerStyle={styles.sortByList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={50}
        data={sorted}
        onMoveEnd={({data}: {data: FilterFieldSetting[]}) => {
          setSorted(data);
        }}
        scrollPercent={5}
        keyExtractor={(it: FilterFieldSetting) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}
      />

      {!!addFilterComponent &&
        (isSplitViewMode ? (
          <ModalPortal onHide={() => setAddFilterComponent(null)} hasOverlay={false}>
            {addFilterComponent}
          </ModalPortal>
        ) : (
          addFilterComponent
        ))}
    </View>
  );
};

export default React.memo(IssuesFiltersSettingList);
