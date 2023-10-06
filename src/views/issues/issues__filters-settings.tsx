import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {useSelector} from 'react-redux';

import IssuesFiltersSettingList from 'views/issues/issues__filters-settings__list';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import {IconAngleRight} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';

import styles from './issues.styles';

import {AppState} from 'reducers';
import {defaultIssuesFilterFieldConfig, FilterSetting} from 'views/issues/index';
import {User} from 'types/User';


const IssuesFiltersSetting = ({
  onApply,
  onOpen,
  user,
}: {
  onApply: (filterNames: string[]) => void;
  onOpen: () => void;
  user: User;
}) => {
  const [sorted, setSorted] = React.useState<FilterSetting[]>([]);
  const [modalChildren, updateModalChildren] = useState<React.JSX.Element | null>(null);
  const issuesSettings = useSelector((state: AppState) => state.issueList.settings);

  useEffect(() => {
    const userProfileFiltersNames: string[] = (user.profiles?.appearance?.liteUiFilters || []).filter(Boolean);
    const filterFields = (
      userProfileFiltersNames.length > 0
        ? userProfileFiltersNames
        : Object.values(defaultIssuesFilterFieldConfig)
    );
    if (issuesSettings.search?.filters) {
      const list: FilterSetting[] | undefined = filterFields.reduce(
        (akk: FilterSetting[], it: string) => {
          return [...akk, issuesSettings.search.filters[it?.toLowerCase()]];
        },
        []
      ).filter(Boolean);
      setSorted(list);
    }
  }, [issuesSettings, user.profiles?.appearance?.liteUiFilters]);

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
          {sorted.map((it: FilterSetting) => it?.filterField?.[0]?.name || it).join(', ')}
        </Text>
        <IconAngleRight
          size={19}
          color={styles.settingsItemIcon.color}
        />
      </TouchableOpacity>
    );
  };

  const renderSortableList = () => {
    return (
      <IssuesFiltersSettingList
        filters={sorted}
        onApply={(filters: FilterSetting[]) => {
          setSorted(filters);
          onApply(filters.map((it: FilterSetting) => (it?.name?.toLowerCase?.() || it.id)));
        }}
        onBack={onBack}
      />
    );
  };

  return sorted.length ? (
    <>
      <View
        testID="test:id/issuesFiltersSetting"
        accessibilityLabel="issuesFiltersSetting"
        accessible={true}
      >
        <Title
          onPress={() => {
            if (isSplitView()) {
              updateModalChildren(renderSortableList());
            } else {
              onOpen();
              Router.PageModal({
                children: renderSortableList(),
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
  ) : null;
};


export default React.memo(IssuesFiltersSetting);

