import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import AgileSelectItemStar from 'views/agile-board/agile-board__agile-select-item';
import {IconAngleDown} from 'components/icon/icon';

import styles from './agile-board__renderer.styles';

import type {UITheme} from 'types/Theme';
import {ViewStyleProp, TextStyleProp} from 'types/Internal';
import {BoardOnList} from 'types/Agile';


const renderSelector = (params: {
  key: string;
  label: string;
  onPress: () => any;
  style?: ViewStyleProp;
  textStyle?: TextStyleProp;
  showBottomBorder?: boolean;
  isDisabled?: boolean;
  showLoader?: boolean;
  uiTheme: UITheme;
}): React.ReactNode => (
  <View
    style={[
      styles.selector,
      params.style,
      params.showBottomBorder ? styles.selectorBorder : null,
    ]}
  >
    <TouchableOpacity
      testID="search-context"
      accessibilityLabel="search-context"
      accessible={true}
      key={params.key}
      style={styles.selectorButton}
      disabled={params.isDisabled}
      onPress={params.onPress}
    >
      <Text
        style={[
          styles.selectorButtonText,
          params.textStyle,
          params.isDisabled ? styles.selectorButtonTextDisabled : null,
        ]}
        numberOfLines={1}
      >
        {params.label}
      </Text>
      {((params.showLoader && !params.isDisabled) || !params.showLoader) && (
        <IconAngleDown
          size={17}
          style={styles.selectorIcon}
          color={
            params.isDisabled
              ? params.uiTheme.colors.$icon
              : params.uiTheme.colors.$text
          }
        />
      )}
    </TouchableOpacity>
  </View>
);

const renderAgileSelectItem = (board: BoardOnList) => {
  return <AgileSelectItemStar board={board}/>;
};


export {
  renderSelector,
  renderAgileSelectItem,
};
