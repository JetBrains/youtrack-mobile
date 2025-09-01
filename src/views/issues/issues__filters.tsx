import React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';

import {useSelector} from 'react-redux';
import {useDispatch} from 'hooks/use-dispatch';

import IssuesFilterField from 'views/issues/issues__filters-filter';
import {IconClose} from 'components/icon/icon';
import {openFilterFieldSelect, resetFilterFields} from 'views/issues/issues-actions';

import styles from './issues.styles';

import type {AppState} from 'reducers';
import type {FilterFieldSetting, FilterFiledSettingMap, IssuesSettings} from 'views/issues/index';

const IssuesFilters = (): React.JSX.Element | null => {
  const dispatch = useDispatch();

  const disabled: boolean = useSelector((state: AppState) => state.issueList.isRefreshing);
  const settings: IssuesSettings = useSelector((state: AppState) => state.issueList.settings);

  const getSearchFilters = (): FilterFiledSettingMap => settings.search.filters || {};

  const getSearchFiltersKeys = (): string[] => Object.keys(getSearchFilters());

  const isResetEnabled: boolean = getSearchFiltersKeys().some(
    (key: string) => getSearchFilters()[key].selectedValues.length > 0
  );

  return getSearchFiltersKeys().length ? (
    <ScrollView
      horizontal={true}
      contentContainerStyle={styles.searchPanelFilters}
    >
      <View style={styles.filters}>
        {
          getSearchFiltersKeys().map((it: string) => {
            const fs: FilterFieldSetting = getSearchFilters()[it];
            return fs.filterField[0] ? (
              <IssuesFilterField
                key={fs.id}
                filterSetting={fs}
                disabled={disabled}
                onPress={(filterSetting: FilterFieldSetting) => {
                  dispatch(openFilterFieldSelect(filterSetting));
                }}
              />
            ) : null;
          })
        }
        {isResetEnabled && <TouchableOpacity
          style={styles.filtersButtonReset}
          onPress={() => {
            dispatch(resetFilterFields());
          }}
        >
          <IconClose size={18} color={styles.filtersIcon.color}/>
        </TouchableOpacity>}
      </View>
    </ScrollView>
  ) : null;
};


export default React.memo(IssuesFilters);
