/* @flow */

import React, {useContext} from 'react';

import {ThemeContext} from '../theme/theme-context';

import NoProjectFound from 'assets/no-project-found.svg';
import NoProjectFoundDark from 'assets/no-project-found-dark.svg';
import NothingFound from 'assets/not-found.svg';
import NothingFoundDark from 'assets/not-found-dark.svg';
import NothingSelected from 'assets/nothing-selected.svg';
import NothingSelectedDark from 'assets/nothing-selected-dark.svg';
import NoNotifications from './assets/notifications-light.svg';
import NoNotificationsDark from './assets/notifications-dark.svg';
import {DEFAULT_THEME} from '../theme/theme';

import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  size?: number,
  style?: ViewStyleProp
}

export const ICON_PICTOGRAM_DEFAULT_SIZE: number = 240;

const Icon = (props: {...Props, icon: { dark: any, default: any } }) => {
  const theme: ?Theme = useContext(ThemeContext);
  const size: number = props.size || ICON_PICTOGRAM_DEFAULT_SIZE;
  const ThemedIcon: any = (theme?.uiTheme || DEFAULT_THEME).dark ? props.icon.dark : props.icon.default;

  return (
    <ThemedIcon
      width={size}
      height={size}
      style={props.style}
    />
  );
};

const IconNothingFound = (props: Props): Node =>
  <Icon {...{
    ...props,
    icon: {
      dark: NothingFoundDark,
      default: NothingFound,
    },
  }} />;

const IconNoProjectFound = (props: Props): Node =>
  <Icon {...{
    ...props,
    icon: {
      dark: NoProjectFoundDark,
      default: NoProjectFound,
    },
  }} />;

const IconNothingSelected = (props: Props): Node =>
  <Icon {...{
    ...props,
    icon: {
      dark: NothingSelectedDark,
      default: NothingSelected,
    },
  }} />;

const IconNoNotifications = (props: Props): Node =>
  <Icon {...{
    ...props,
    icon: {
      dark: NoNotificationsDark,
      default: NoNotifications,
    },
  }} />;

export {
  IconNothingFound,
  IconNoProjectFound,
  IconNothingSelected,
  IconNoNotifications,
};
