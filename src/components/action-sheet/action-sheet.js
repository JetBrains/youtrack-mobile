/* @flow */
type Action = {title: string, execute?: Function}
type ActionSheet = {showActionSheetWithOptions: Function};

export function showActions(actions: Array<Action>, actionSheetInstance: ActionSheet) {
  const cancelIndex = actions.length - 1;

  return new Promise((resolve: Function, reject: Function) => {

    actionSheetInstance.showActionSheetWithOptions({
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
