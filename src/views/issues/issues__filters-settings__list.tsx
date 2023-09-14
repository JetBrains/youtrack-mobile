import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

// @ts-ignore
import DraggableFlatList from 'react-native-draggable-dynamic-flatlist';
import {View as AnimatedView} from 'react-native-animatable';

import Header from 'components/header/header';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Select, {SelectModal} from 'components/select/select';
import {EllipsisVertical, IconAdd, IconCheck, IconClose} from 'components/icon/icon';
import {getApi} from 'components/api/api__instance';
import {i18n} from 'components/i18n/i18n';
import {until} from 'util/util';

import styles from './issues.styles';

import {FilterSetting} from 'views/issues/index';
import {FilterField} from 'types/CustomFields';
import {isSplitView} from 'components/responsive/responsive-helper';


const IssuesFiltersSettingList = ({
  filters,
  onApply,
  onBack,
}: {
  filters: FilterSetting[],
  onApply: (filters: FilterSetting[]) => void;
  onBack: () => void;
}) => {
  const cachedFilterFields = React.useRef<FilterField[] | null>(null);
  const [sorted, setSorted] = React.useState<FilterSetting[]>([]);
  const [modalChildren, updateModalChildren] = useState(null);

  React.useEffect(() => {
    if (filters) {
      setSorted(filters);
    }
  }, [filters]);

  const renderItem = ({
    item,
    move,
    isActive,
  }: {
    item: FilterSetting;
    move: () => any;
    isActive: boolean;
  }): React.JSX.Element => {
    const filterField: FilterField = item.filterField?.[0];
    const presentation: string = filterField ? filterField.customField?.localizedName || filterField.name : item.name;
    return (
      <AnimatedView
        animation="fadeIn"
        duration={500}
        useNativeDriver
      >
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
              {presentation}
            </Text>
          </View>
          <View style={styles.rowLine}>
            <TouchableOpacity
              style={styles.sortIconButton}
              onPress={() => setSorted(
                sorted.filter((it: FilterSetting) => it.id !== item.id)
              )}
            >
              <IconClose size={20} color={styles.sortIcon.color} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </AnimatedView>
    );
  };

  const renderAddItemComponent = () => {
    const isSplitViewMode: boolean = isSplitView();
    const Container: typeof Select | typeof SelectModal = isSplitViewMode ? SelectModal : Select;
    const toItem = (it: any) => ({...it, name: it.name || it.filterField?.[0]?.name});
    const component = (
      <Container
        multi={true}
        selectedItems={sorted.map(toItem)}
        onCancel={() => {
          if (isSplitViewMode) {
            updateModalChildren(null);
          } else {
            onBack();
          }
        }}
        dataSource={async (q: string) => {
          let _filters;
          if (cachedFilterFields.current) {
            _filters = cachedFilterFields.current;
          } else {
            const [error, response] = await until(getApi().customFields.getFilters());
            cachedFilterFields.current = response;
            _filters = error ? [] : response;
          }
          const filteredFilters = q ? _filters.filter((it: FilterField) => {
            return it.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
          }) : _filters;

          return filteredFilters.map(toItem);
        }}
        onSelect={(selected: FilterSetting[]) => {
          setSorted(selected);
          onBack();
        }}
      />
    );

    if (isSplitViewMode) {
      updateModalChildren(component);
    } else {
      Router.PageModal({
        children: component,
      });
    }
  };

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
          onApply(sorted);
          onBack();
        }}
        extraButton={
          <TouchableOpacity
            style={styles.sortIconButton}
            onPress={renderAddItemComponent}
          >
            <IconAdd
              size={21}
              style={styles.sortByListAddIcon}
              color={styles.link.color}
            />
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
        onMoveEnd={({data}: { data: FilterSetting[] }) => {
          setSorted(data);
        }}
        scrollPercent={5}
        keyExtractor={(it: FilterSetting) => it.id}
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


export default React.memo(IssuesFiltersSettingList);

