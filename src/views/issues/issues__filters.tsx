import React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import IssuesFilterField from 'views/issues/issues__filters-filter';
import {guid} from 'util/util';
import {IconClose} from 'components/icon/icon';
import {openFilterFieldSelect, resetFilterFields} from 'views/issues/issues-actions';

import styles from './issues.styles';

import {AppState} from 'reducers';
import {FilterSetting, IssuesSettings} from 'views/issues/index';


const IssuesFilters = (): React.JSX.Element | null => {
  const dispatch = useDispatch();

  const disabled: boolean = useSelector((state: AppState) => state.issueList.isRefreshing);
  const settings: IssuesSettings = useSelector((state: AppState) => state.issueList.settings);

  const isResetEnabled: boolean = Object.keys(settings.search.filters).some(
    (key: string) => settings.search.filters[key].selectedValues.length > 0
  );
  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={styles.searchPanelFilters}
    >
      <View style={styles.filters}>
        {
          Object.keys(settings.search.filters).map((it: string) => {
            const fs: FilterSetting = settings.search.filters[it];
            return fs.filterField[0] ? (
              <IssuesFilterField
                key={guid()}
                filterSetting={fs}
                disabled={disabled}
                onPress={(filterSetting: FilterSetting) => {
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
  );
};


export default React.memo(IssuesFilters);
