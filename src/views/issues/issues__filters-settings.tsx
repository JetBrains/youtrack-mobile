import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {useSelector} from 'react-redux';

import IssuesFiltersSettingList from 'views/issues/issues__filters-settings__list';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';

import styles from './issues.styles';

import type {AppState} from 'reducers';
import {defaultIssuesFilterFieldConfig, FilterSetting} from 'views/issues/index';
import type {User} from 'types/User';


const IssuesFiltersSetting = ({
  onApply,
  onOpen,
  user,
}: {
  onApply: (filterNames: string[]) => void;
  onOpen: () => void;
  user: User;
}) => {
  const [filters, setFilters] = React.useState<FilterSetting[]>([]);
  const [modalChildren, updateModalChildren] = useState<React.JSX.Element | null>(null);
  const issuesSettings = useSelector((state: AppState) => state.issueList.settings);
  const isHelpdeskMode = useSelector((state: AppState) => state.issueList.helpDeskMode);

  const getFilters = React.useCallback((): string[] => {
    const profiles = user.profiles;
    return ((isHelpdeskMode ? profiles.helpdesk.ticketFilters : profiles.appearance?.liteUiFilters) || []).filter(Boolean);
  }, [isHelpdeskMode, user.profiles]);

  useEffect(() => {
    const userProfileFiltersNames: string[] = getFilters();
    const filterFields = (
      userProfileFiltersNames.length > 0
        ? userProfileFiltersNames
        : Object.values(defaultIssuesFilterFieldConfig)
    );
    if (issuesSettings.search?.filters) {
      const list: FilterSetting[] | undefined = filterFields.reduce(
        (akk: FilterSetting[], it: string) => {
          return [...akk, (issuesSettings.search.filters || {})[it?.toLowerCase()]];
        },
        []
      ).filter(Boolean);
      setFilters(list);
    }
  }, [getFilters, issuesSettings]);

  const onBack = () => {
    if (isSplitView()) {
      updateModalChildren(null);
    } else {
      Router.pop(true);
    }
  };

  const Title = ({onPress}: { onPress: () => void; }) => {
    return (
      <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
        <Text numberOfLines={1} style={[styles.settingsItemText, !filters.length && styles.settingsItemTextEmpty]}>
          {filters.length
            ? filters.map((it: FilterSetting) => it?.filterField?.[0]?.name || it.id).join(', ')
            : i18n('Add filter')}
        </Text>
        <IconAngleRight size={19} color={styles.settingsItemIcon.color} />
      </TouchableOpacity>
    );
  };

  const renderSortableList = () => {
    return (
      <IssuesFiltersSettingList
        filters={filters}
        onApply={(fs: FilterSetting[]) => {
          setFilters(fs);
          onApply(fs.map((it: FilterSetting) => it.id.toLowerCase()));
        }}
        onBack={onBack}
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
  );
};


export default React.memo(IssuesFiltersSetting);

