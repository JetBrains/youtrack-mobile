/* @flow */

import type {Node} from 'React';
import React from 'react';
import {Text, TouchableOpacity, View, ActivityIndicator} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {IconAngleDown} from '../../components/icon/icon';
import {UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/typography';
import {elevation1} from '../../components/common-styles/shadow';

import type {TextStyleProp, ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from '../../flow/Theme';


export function renderSelector(params: {
  key: string,
  label: string,
  onPress: () => any,
  style?: ViewStyleProp,
  textStyle?: TextStyleProp,
  showBottomBorder?: boolean,
  isLoading?: boolean,
  showLoader?: boolean,
  uiTheme: UITheme
}): Node {

  return (
    <View style={[
      styles.selector,
      params.style,
      params.showBottomBorder ? styles.selectorBorder : null,
    ]}>
      <TouchableOpacity
        testID="search-context"
        accessibilityLabel="search-context"
        accessible={true}
        key={params.key}
        style={styles.selectorButton}
        disabled={params.isLoading}
        onPress={params.onPress}
      >
        <Text
          style={[
            styles.selectorButtonText,
            params.textStyle,
            params.isLoading ? styles.selectorButtonTextDisabled : null,
          ]}
          numberOfLines={1}
        >
          {`${params.label} `}
        </Text>
        {((params.showLoader && !params.isLoading) || (!params.showLoader)) && <IconAngleDown
          size={17}
          style={styles.selectorIcon}
          color={params.isLoading ? params.uiTheme.colors.$icon : params.uiTheme.colors.$text}
        />}
        {params.showLoader && params.isLoading && <ActivityIndicator color={params.uiTheme.colors.$link}/>}
      </TouchableOpacity>
    </View>
  );
}

const styles = EStyleSheet.create({
  selector: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  selectorBorder: {
    ...elevation1,
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
    color: '$text',
  },
  selectorButtonTextDisabled: {
    color: '$icon',
  },
  selectorIcon: {
    lineHeight: 20,
  },
});
