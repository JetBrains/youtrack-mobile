/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';

import {IconAngleDown} from '../../components/icon/icon';
import {COLOR_BLACK, COLOR_DARK, COLOR_FONT_GRAY, UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/issue';

import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export function renderNavigationItem(selectData: {
  key: string,
  label: string,
  onPress: () => any,
  textStyle?: TextStyleProp,
  isLoading: boolean
}) {

  return (
    <View style={styles.navigationItem}>
      <TouchableOpacity
        key={selectData.key}
        style={styles.navigationItemButton}
        disabled={selectData.isLoading}
        onPress={selectData.onPress}
      >
        <Text
          style={[
            styles.navigationItemButtonText,
            selectData.textStyle,
            selectData.isLoading ? styles.navigationItemButtonTextDisabled : null
          ]}
          numberOfLines={1}
        >
          {`${selectData.label} `}
        </Text>
        <IconAngleDown
          size={15}
          color={selectData.isLoading ? COLOR_FONT_GRAY : COLOR_BLACK}
          style={styles.navigationItemButtonIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  },
  navigationItemButtonIcon: {
    lineHeight: 19
  },
});
