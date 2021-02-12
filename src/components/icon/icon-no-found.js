/* @flow */

import React, {useContext} from 'react';

import {ThemeContext} from '../theme/theme-context';

import NoProjectFound from '../../assets/no-project-found.svg';
import NoProjectFoundDark from '../../assets/no-project-found-dark.svg';
import NothingFound from '../../assets/not-found.svg';
import NothingFoundDark from '../../assets/not-found-dark.svg';

import type {Theme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  size?: number,
  style?: ViewStyleProp
}

export const ICON_NOT_FOUND_DEFAULT_SIZE: number = 240;

const Icon = (props: Props & { icon: { dark: any, default: any } }) => {
  const theme: Theme = useContext(ThemeContext);
  const size: number = props.size || ICON_NOT_FOUND_DEFAULT_SIZE;
  const Icon = theme.uiTheme.dark ? props.icon.dark : props.icon.default;

  return (
    <Icon
      width={size}
      height={size}
      style={props.style}
    />
  );
};

const IconNothingFound = (props: Props) =>
  <Icon {...{
    ...props,
    icon: {
      dark: NothingFoundDark,
      default: NothingFound
    }
  }} />;

const IconNoProjectFound = (props: Props) =>
  <Icon {...{
    ...props,
    icon: {
      dark: NoProjectFoundDark,
      default: NoProjectFound
    }
  }} />;

export {
  IconNothingFound,
  IconNoProjectFound
};
