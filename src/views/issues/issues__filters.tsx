import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {FiltersSetting} from 'views/issues/index';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {getFiltersSettingsData, getFilterSettingKey, FilterFieldMap} from 'views/issues/issues-helper';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown} from 'components/icon/icon';
import {until} from 'util/util';

import styles from './issues.styles';

import {CustomError} from 'types/Error';
import {FilterField, FilterFieldValue} from 'types/CustomFields';
import {User} from 'types/User';

const projectKey = 'project';


const IssuesFilters = ({
  disabled,
  filtersSettings = {},
  onPress,
  user,
}: {
  disabled: boolean;
  filtersSettings: FiltersSetting,
  onPress: (filterField: FilterField[]) => void;
  user: User;
}): React.JSX.Element => {
  const defaultConfig: string[] = (
    user.profiles?.helpdesk?.isReporter
      ? [projectKey, 'state', 'assignee', 'type']
      : ['state', 'assignee', projectKey]
  );
  const filtersConfig: string[] = user.profiles?.appearance?.liteUiFilters || defaultConfig;
  const [filtersMap, setFiltersMap] = React.useState<FilterFieldMap | null>(null);

  const loadFilters = React.useCallback(async () => {
    const [error, filters] = await until(getApi().customFields.getFilters()) as [CustomError | null, FilterField[]];
    return error ? [] : filters;
  }, []);

  React.useEffect(() => {
    loadFilters().then((filterFields: FilterField[]) => {
      setFiltersMap(
        filterFields.reduce(
          (akk: FilterFieldMap, it: FilterField) => {
            const key: string = getFilterSettingKey(it);
            return {
              ...akk,
              [key]: [...(akk[key] || []), it],
            };
          },
          {}
        )
      );
    });
  }, [filtersConfig, loadFilters]);


  const visibleFilters: FilterField[][] = (
    filtersMap
      ? filtersConfig.map((filterId: string) => filtersMap[filterId])
      : []
  );
  return (
    <View style={styles.filters}>
      {visibleFilters.map((it: FilterField[]) => {
        const filterData = getFiltersSettingsData(filtersSettings, it);
        const presentation: string = (
          filterData.selectedValues.length
            ? filterData.selectedValues.map((i: FilterFieldValue) => getEntityPresentation(i)).join(', ')
            : filterData.key === projectKey ? i18n('All projects') : it[0].name
        );
        return (
          <TouchableOpacity
            key={it[0].id}
            style={[
              styles.filtersButton,
              filterData.selectedValues.length && styles.filtersButtonHighlighted,
            ]}
            disabled={disabled}
            onPress={() => onPress(it)}
          >
            <Text
              numberOfLines={1}
              style={styles.filtersButtonText}
            >
              {presentation}
            </Text>
            <IconAngleDown color={styles.filtersIcon.color} size={12}/>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};


export default React.memo(IssuesFilters);
