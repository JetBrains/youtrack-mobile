import React from 'react';
import {View} from 'react-native';

import IssuesFilterField from 'views/issues/issues__filters-filter';

import styles from './issues.styles';

import {FilterSetting} from 'views/issues/index';


const IssuesFilters = ({
  filters,
  disabled,
  onPress,
}: {
  filters: FilterSetting[],
  disabled?: boolean;
  onPress: (filterSetting: FilterSetting, values: string[]) => void;
}): React.JSX.Element | null => {

  return (
    <View style={styles.filters}>
      {
        filters.map((it: FilterSetting) => (
          <IssuesFilterField
            key={it.filterField[0].id}
            filterSetting={it}
            disabled={disabled}
            onPress={(filterSetting: FilterSetting) => {
              onPress(filterSetting, it.selectedValues);
            }}
          />
        ))
      }
    </View>
  );
};


export default React.memo(IssuesFilters);
