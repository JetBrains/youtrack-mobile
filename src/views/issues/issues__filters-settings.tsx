import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import IssuesFiltersSettingList from 'views/issues/issues__filters-settings__list';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Select, {SelectModal} from 'components/select/select';
import {getApi} from 'components/api/api__instance';
import {IconAngleRight} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {until} from 'util/util';

import styles from './issues.styles';

import {FilterField} from 'types/CustomFields';
import {User} from 'types/User';


const IssuesFiltersSetting = ({
  onApply,
  onOpen,
  user,
}: {
  onApply: (filters: string[]) => void;
  onOpen: () => void;
  user: User;
}) => {
  const cachedFilterFields = React.useRef<FilterField[] | null>(null);
  const [sorted, setSorted] = React.useState<string[]>([]);
  const [modalChildren, updateModalChildren] = useState<React.JSX.Element | null>(null);

  useEffect(() => {
    if (user.profiles?.appearance?.liteUiFilters?.length) {
      setSorted(user.profiles?.appearance?.liteUiFilters);
    }
  }, [sorted, user.profiles?.appearance?.liteUiFilters]);

  const onBack = () => {
    if (isSplitView()) {
      updateModalChildren(null);
    } else {
      Router.pop(true);
    }
  };

  const Title = ({onPress}: { onPress: () => void; }) => {
    return (
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={onPress}
      >
        <Text
          numberOfLines={1}
          style={styles.settingsItemText}
        >
          {sorted?.join(', ')}
        </Text>
        <IconAngleRight
          size={19}
          color={styles.settingsItemIcon.color}
        />
      </TouchableOpacity>
    );
  };

  const renderAddItemComponent = () => {
    const isSplitViewMode: boolean = isSplitView();
    const Container: typeof Select | typeof SelectModal = isSplitViewMode ? SelectModal : Select;
    const toSorted = (it: {id: string, name: string}) => it.name;
    const toSelectItem = (it: string) => ({id: it, name: it});
    const component = (
      <Container
        multi={true}
        selectedItems={sorted.map(toSelectItem)}
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
          return filteredFilters.map((it: FilterField) => ({id: it.name, name: it.name}));
        }}
        onSelect={(selected: string[]) => {
          setSorted(sorted.concat(selected.map(toSorted)));
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

  const renderSortableList = () => {
    return (
      <IssuesFiltersSettingList
        filters={sorted}
        onApply={(filters) => onApply(filters)}
        onBack={onBack}
        onAdd={renderAddItemComponent}
        />
    );
  };

  return (
    <>
      <View
        testID="test:id/issuesFiltersSetting"
        accessibilityLabel="issuesFiltersSetting"
        accessible={true}
      >
        <Title
          onPress={() => {
            const sortableList = renderSortableList();
            if (isSplitView()) {
              updateModalChildren(sortableList);
            } else {
              onOpen();
              Router.PageModal({
                children: sortableList,
              });
            }
          }}
        />
      </View>

      {isSplitView() && (
        <ModalPortal onHide={() => updateModalChildren(null)}>
          {modalChildren}
        </ModalPortal>
      )}
    </>
  );
};


export default React.memo(IssuesFiltersSetting);

