import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {IconAngleDown} from 'components/icon/icon';

import styles from './issues.styles';

import {defaultIssuesFilterFieldConfig, FilterSetting} from 'views/issues/index';
import {i18n} from 'components/i18n/i18n';
import {getFilterFieldName} from 'views/issues/issues-helper';


const IssuesFilterField = ({
  filterSetting,
  disabled,
  onPress,
}: {
  filterSetting: FilterSetting,
  disabled?: boolean;
  onPress: (filterSetting: FilterSetting) => void;
}) => {

  const filterFields = filterSetting.filterField;
  const values = filterSetting.selectedValues;
  const presentation = values.length
      ? values.join(', ')
      : getFilterFieldName(filterFields[0]) === defaultIssuesFilterFieldConfig.project ? i18n('All projects') : filterFields[0].name;

  return (
    <TouchableOpacity
      key={filterFields[0].id}
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
      >
        {presentation}
      </Text>
      <IconAngleDown color={styles.filtersIcon.color} size={12}/>
    </TouchableOpacity>
  );
};


export default React.memo(IssuesFilterField);
