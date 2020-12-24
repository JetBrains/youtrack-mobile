/* @flow */

import {DEFAULT_THEME} from '../theme/theme';

import type {ActionSheetProvider, ActionSheetOptions} from '@expo/react-native-action-sheet';


export type ActionSheetOption = { title: string, execute?: Function }
export type ShowActionSheetWithOptions = (options: ActionSheetOptions, callback: (i: number) => void) => void;

function doShowActions(
  options: Array<ActionSheetOption>,
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  title?: string | null,
  message?: string | null,
) {
  const cancelIndex: number = options.length - 1;

  return new Promise((resolve: Function) => {
    showActionSheetWithOptions(
      {
        title,
        message,
        options: options.map(action => action.title),
        cancelButtonIndex: cancelIndex,
        titleTextStyle: {
          color: DEFAULT_THEME.colors.$text
        },
        separatorStyle: {
          backgroundColor: DEFAULT_THEME.colors.$boxBackground
        },
        showSeparators: true
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
  actionSheetInstance: ActionSheetProvider,
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
