import React, {useContext} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {IconAngleDown} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issues.styles';

import {defaultIssuesFilterFieldConfig} from 'views/issues/index';
import {i18n} from 'components/i18n/i18n';
import {getFilterFieldName} from 'views/issues/issues-helper';
import {Theme} from 'types/Theme';

import type {FilterFieldSetting} from 'views/issues/index';


const IssuesFilterField = ({
  filterSetting,
  disabled,
  onPress,
}: {
  filterSetting: FilterFieldSetting,
  disabled?: boolean;
  onPress: (filterSetting: FilterFieldSetting) => void;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme: Theme = useContext(ThemeContext);

  const filterFields = filterSetting.filterField;
  const values = filterSetting.selectedValues;
  const presentation = values.length
      ? values.join(', ')
      : getFilterFieldName(filterFields[0]) === defaultIssuesFilterFieldConfig.project ? i18n('All projects') : filterFields[0].name;

  return (
    <TouchableOpacity
      key={filterFields[0].id}
      testID="test:id/issuesFilterField"
      accessibilityLabel="issuesFilterField"
      style={[
        styles.filtersButton,
        values.length > 0 && styles.filtersButtonHighlighted,
      ]}
      disabled={disabled}
      onPress={() => onPress(filterSetting)}
    >
      <Text
        numberOfLines={1}
        style={styles.filtersButtonText}
        testID="test:id/issuesFilterFieldText"
        accessibilityLabel="issuesFilterFieldText"
      >
        {presentation}
      </Text>
      <IconAngleDown style={styles.filtersIcon} color={styles.filtersIcon.color} size={18}/>
    </TouchableOpacity>
  );
};


export default React.memo(IssuesFilterField);
