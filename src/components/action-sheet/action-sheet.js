/* @flow */

import {getThemeMode, getUITheme} from '../theme/theme';

import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import type {ActionSheetOptions} from '@expo/react-native-action-sheet';
import type {UIThemeColors} from '../../flow/Theme';

export type ActionSheetOption = { title: string, execute?: Function }
// $FlowFixMe: any-typed ActionSheetOptions
export type ShowActionSheetWithOptions = (options: ActionSheetOptions, callback: (i: number) => void) => void;

async function doShowActions(
  options: Array<ActionSheetOption>,
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  title?: string | null,
  message?: string | null,
) {
  const cancelIndex: number = options.length - 1;
  const themeMode: string = await getThemeMode();
  const uiThemeColors: UIThemeColors = getUITheme(themeMode).colors;

  return new Promise((resolve: Function) => {
    showActionSheetWithOptions(
      {
        title,
        message,
        options: options.map(action => action.title),
        cancelButtonIndex: cancelIndex,
        titleTextStyle: {
          color: uiThemeColors.$icon,
        },
        messageTextStyle: {
          color: uiThemeColors.$icon,
        },
        separatorStyle: {
          backgroundColor: uiThemeColors.$boxBackground,
        },
        containerStyle: {
          backgroundColor: uiThemeColors.$background,
        },
        textStyle: {
          color: uiThemeColors.$text,
        },
        showSeparators: true,
      },
      (actionIndex) => {
        const action = options[actionIndex];
        if (actionIndex === cancelIndex) {
          return resolve(null);
        }
        return resolve(action);
      }
    );

  });
}

export function showActions(
  options: Array<ActionSheetOption>,
  actionSheetInstance: typeof ActionSheetProvider,
  title?: string | null,
  message?: string | null
): Promise<?ActionSheetOption> {
  return doShowActions(options, actionSheetInstance.getContext().showActionSheetWithOptions, title, message);
}

export function showActionSheet(
  options: Array<ActionSheetOption>,
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  title?: string | null,
  message?: string | null
): Promise<?ActionSheetOption> {
  return doShowActions(options, showActionSheetWithOptions, title, message);
}
