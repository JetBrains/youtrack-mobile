/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';

import {IconAngleDown} from '../../components/icon/icon';
import {COLOR_BLACK, COLOR_DARK, COLOR_FONT_GRAY, UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/typography';
import {elevation1} from '../../components/common-styles/shadow';

import type {TextStyleProp, ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export function renderNavigationItem(item: {
  key: string,
  label: string,
  onPress: () => any,
  style?: ViewStyleProp,
  textStyle?: TextStyleProp,
  showBottomBorder?: boolean,
  isLoading: boolean
}) {

  return (
    <View style={[
      styles.navigationItem,
      item.style,
      item.showBottomBorder ? styles.navigationItemBorder : null
    ]}>
      <TouchableOpacity
        key={item.key}
        style={styles.navigationItemButton}
        disabled={item.isLoading}
        onPress={item.onPress}
      >
        <Text
          style={[
            styles.navigationItemButtonText,
            item.textStyle,
            item.isLoading ? styles.navigationItemButtonTextDisabled : null
          ]}
          numberOfLines={1}
        >
          {`${item.label} `}
        </Text>
        <IconAngleDown
          size={17}
          color={item.isLoading ? COLOR_FONT_GRAY : COLOR_BLACK}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationItem: {
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  navigationItemBorder: {
    ...elevation1
  },
  navigationItemButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: UNIT,
    paddingLeft: 0,
    marginBottom: UNIT,
  },
  navigationItemButtonText: {
    ...mainText,
    fontWeight: '500',
    color: COLOR_DARK
  },
  navigationItemButtonTextDisabled: {
    color: COLOR_FONT_GRAY
  }
});
