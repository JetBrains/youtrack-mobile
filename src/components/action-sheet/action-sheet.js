/* @flow */

import type {ActionSheetProvider, ActionSheetOptions} from '@expo/react-native-action-sheet';

export type ActionSheetOption = { title: string, execute?: Function }
export type ShowActionSheetWithOptions = (options: ActionSheetOptions, callback: (i: number) => void) => void;

function doShowActions(options: Array<ActionSheetOption>, showActionSheetWithOptions: ShowActionSheetWithOptions, message?: string) {
  const cancelIndex: number = options.length - 1;

  return new Promise((resolve: Function) => {
    showActionSheetWithOptions(
      {
        message,
        options: options.map(action => action.title),
        cancelButtonIndex: cancelIndex
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
  message?: string
): Promise<?ActionSheetOption> {
  return doShowActions(options, actionSheetInstance.getContext().showActionSheetWithOptions, message);
}

export function showActionSheet(
  options: Array<ActionSheetOption>,
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  message?: string
): Promise<?ActionSheetOption> {
  return doShowActions(options, showActionSheetWithOptions, message);
}
