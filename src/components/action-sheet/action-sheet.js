/* @flow */

import type {ActionSheetProvider} from '@expo/react-native-action-sheet';

type Action = {title: string, execute?: Function}

export function showActions(actions: Array<Action>, actionSheetInstance: ActionSheetProvider): Promise<?Action> {
  const cancelIndex = actions.length - 1;

  return new Promise((resolve: Function) => {
    actionSheetInstance.getContext().showActionSheetWithOptions({
      options: actions.map(action => action.title),
      cancelButtonIndex: actions.length - 1
    }, (actionIndex) => {
      const action = actions[actionIndex];

      if (actionIndex === cancelIndex) {
        return resolve(null);
      }

      return resolve(action);
    });

  });
}
