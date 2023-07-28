import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {Filter} from 'types/CustomFields';
import {getApi} from 'components/api/api__instance';
import {until} from 'util/util';

import styles from './issues.styles';

import {CustomError} from 'types/Error';
import {IconAngleDown} from 'components/icon/icon';
import {User} from 'types/User';

const IssuesFilters = ({
  disabled,
  onApply,
  query,
  user,
}: {
  disabled: boolean;
  onApply: (query: string) => void;
  query: string;
  user: User;
}): React.JSX.Element => {
  const defaultConfig: string[] = (
    user.profiles?.helpdesk?.isReporter
      ? ['project', 'state', 'assignee', 'type']
      : ['state', 'assignee', 'project']
  );
  const config: string[] = user.profiles?.appearance?.liteUiFilters || defaultConfig;

  const [filtersData, setFiltersData] = React.useState<{
    allFilters: Filter[];
    visibleFilters: Filter[];
  }>({
    allFilters: [],
    visibleFilters: [],
  });

  const loadFilters = React.useCallback(async () => {
    const apiCustomFields = getApi().customFields;
    const [error, fs] = await until(
      apiCustomFields.getFilters()
    ) as [CustomError | null, Filter[]];
    return error ? [] : fs;
  }, []);

  React.useEffect(() => {
    loadFilters().then((allFilters: Filter[]) => {
      const filtersMap: { [key: string]: Filter } = allFilters.reduce((akk, it) => (
        {...akk, [it.name.toLowerCase()]: it}),
        {}
      );
      const visibleFilters = config.reduce(
        (akk: Filter[], filterName: string) => [...akk, filtersMap[filterName]],
        []
      );
      setFiltersData({
        allFilters,
        visibleFilters,
      });
    });
  }, [config, loadFilters]);


  return (
    <View style={styles.filters}>
      {filtersData.visibleFilters.map((it: Filter) => {
        return (
          <TouchableOpacity
            style={styles.filtersButton}
            disabled={disabled}
            onPress={() => {
              onApply?.(query);
            }}
          >
            <Text style={styles.filtersButtonText}>
              {it.name}
            </Text>
            <IconAngleDown color={styles.filtersIcon.color} size={12}/>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};


export default React.memo(IssuesFilters);
