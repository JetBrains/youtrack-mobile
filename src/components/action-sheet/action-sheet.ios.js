import {ActionSheetIOS} from 'react-native';

export default ActionSheetIOS;

export function showActions(actions) {
  const cancelIndex = actions.length - 1;

  return new Promise((resolve, reject) => {

    ActionSheetIOS.showActionSheetWithOptions({
      options: actions.map(action => action.title),
      cancelButtonIndex: actions.length - 1
    }, (actionIndex) => {
      const action = actions[actionIndex];

      if (actionIndex === cancelIndex) {
        return reject(action);
      }

      return resolve(action);
    });

  });
}
