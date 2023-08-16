import React from 'react';
import {ScrollView, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import IssuesFilterField from 'views/issues/issues__filters-filter';
import {getVisibleFilters, openFilterFieldSelect} from 'views/issues/issues-actions';

import styles from './issues.styles';

import {AppState} from 'reducers';
import {FilterSetting, IssuesSettings} from 'views/issues/index';
import {User} from 'types/User';


const IssuesFilters = (): React.JSX.Element | null => {
  const dispatch = useDispatch();

  const settings: IssuesSettings = useSelector((state: AppState) => state.issueList.settings);
  const disabled: boolean = useSelector((state: AppState) => state.issueList.isRefreshing);
  const user: User = useSelector((state: AppState) => state.app.user) as User;
  const filters: FilterSetting[] = getVisibleFilters(user, settings) || [];

  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={styles.searchPanelFilters}
    >
      <View style={styles.filters}>
        {
          filters.map((it: FilterSetting) => (
            <IssuesFilterField
              key={it.filterField[0].id}
              filterSetting={it}
              disabled={disabled}
              onPress={(filterSetting: FilterSetting) => {
                dispatch(openFilterFieldSelect(filterSetting));
              }}
            />
          ))
        }
      </View>
    </ScrollView>
  );
};


export default React.memo(IssuesFilters);
