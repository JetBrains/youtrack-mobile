import React from 'react';
import {ScrollView, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import IssuesFilterField from 'views/issues/issues__filters-filter';
import {openFilterFieldSelect} from 'views/issues/issues-actions';

import styles from './issues.styles';

import {AppState} from 'reducers';
import {FilterSetting, IssuesSettings} from 'views/issues/index';
import {guid} from 'util/util';


const IssuesFilters = (): React.JSX.Element | null => {
  const dispatch = useDispatch();

  const disabled: boolean = useSelector((state: AppState) => state.issueList.isRefreshing);
  const settings: IssuesSettings = useSelector((state: AppState) => state.issueList.settings);

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
      </View>
    </ScrollView>
  );
};


export default React.memo(IssuesFilters);
