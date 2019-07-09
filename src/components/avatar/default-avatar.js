/* @flow */
import {Text, View} from 'react-native';
// $FlowFixMe: cannot typecheck react-native-linear-gradient module because of mistakes there
import LinearGradient from 'react-native-linear-gradient';
import React, {PureComponent} from 'react';

import styles from './default-avatar.styles';

type Props = {|
  text: string,
  size: number,
  style?: ?Object
|};

function extractLetters(name: string): string {
  const names = name.split(new RegExp('[\\s._]+')).filter(it => !!it);

  if (names.length >= 2) {
    return `${names[0][0].toUpperCase()}${names[1][0].toUpperCase()}`;
  } else if (names.length === 1) {
    if (names[0].length >= 2) {
      return names[0].toUpperCase().substr(0, 2);
    } else {
      return `${names[0][0].toUpperCase()}X`;
    }
  }

  return 'XX';
}

const COLOR_PARIS = [
  ['#60A800', '#D5CA00'],
  ['#21D370', '#03E9E1'],
  ['#3BA1FF', '#36E97D'],
  ['#00C243', '#00FFFF'],
  ['#4BE098', '#627FFF'],
  ['#168BFA', '#26F7C7'],
  ['#9D4CFF', '#39D3C3'],
  ['#0A81F6', '#0ACFF6'],
  ['#765AF8', '#5A91F8'],
  ['#9E54FF', '#0ACFF6'],
  ['#B345F1', '#669DFF'],
  ['#765AF8', '#C059EE'],
  ['#9039D0', '#C239D0'],
  ['#9F2AFF', '#FD56FD'],
  ['#AB3AF2', '#E40568'],
  ['#9F2AFF', '#E9A80B'],
  ['#D50F6B', '#E73AE8'],
  ['#ED5502', '#E73AE8'],
  ['#ED358C', '#DBED18'],
  ['#ED358C', '#F9902E']
];

function hashCode(value) {
  let hash = 0, i, chr;
  if (value.length === 0) return hash;
  for (i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export default class DefaultAvatar extends PureComponent<Props, void> {
  render() {
    const {text, size, style} = this.props;
    if (!text) {
      return null;
    }

    const shortText = extractLetters(text);
    const colors = COLOR_PARIS[Math.abs(hashCode(text.toLowerCase()) % COLOR_PARIS.length)];
    const textStyle = [styles.text, {
      fontSize: size / 3.4,
      lineHeight: size / 3.5,
      paddingLeft: size / 4
    }];

    return (
      <LinearGradient colors={colors} style={[styles.size40, style]}>
        <View>
          <Text style={textStyle}>
            {shortText}
          </Text>
          <Text style={textStyle}>_</Text>
        </View>
      </LinearGradient>
    );
  }
}
