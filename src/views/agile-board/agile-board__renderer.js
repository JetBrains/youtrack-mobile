/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View, StyleSheet, ActivityIndicator} from 'react-native';

import {IconAngleDown} from '../../components/icon/icon';
import {COLOR_BLACK, COLOR_DARK, COLOR_FONT_GRAY, COLOR_PINK, UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/typography';
import {elevation1} from '../../components/common-styles/shadow';

import type {TextStyleProp, ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export function renderSelector(params: {
  key: string,
  label: string,
  onPress: () => any,
  style?: ViewStyleProp,
  textStyle?: TextStyleProp,
  showBottomBorder?: boolean,
  isLoading: boolean,
  showLoader?: boolean
}) {

  return (
    <View style={[
      styles.selector,
      params.style,
      params.showBottomBorder ? styles.selectorBorder : null
    ]}>
      <TouchableOpacity
        key={params.key}
        style={styles.selectorButton}
        disabled={params.isLoading}
        onPress={params.onPress}
      >
        <Text
          style={[
            styles.selectorButtonText,
            params.textStyle,
            params.isLoading ? styles.selectorButtonTextDisabled : null
          ]}
          numberOfLines={1}
        >
          {`${params.label} `}
        </Text>
        {((params.showLoader && !params.isLoading) || (!params.showLoader)) && <IconAngleDown
          size={17}
          style={styles.selectorIcon}
          color={params.isLoading ? COLOR_FONT_GRAY : COLOR_BLACK}
        />}
        {params.showLoader && params.isLoading && <ActivityIndicator color={COLOR_PINK}/>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  selectorBorder: {
    ...elevation1
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: UNIT,
    paddingLeft: 0,
    marginBottom: UNIT,
  },
  selectorButtonText: {
    ...mainText,
    fontWeight: '500',
    color: COLOR_DARK
  },
  selectorButtonTextDisabled: {
    color: COLOR_FONT_GRAY
  },
  selectorIcon: {
    lineHeight: 20
  }
});
