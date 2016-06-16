
export function showActions(actions, actionSheetInstance) {
  const cancelIndex = actions.length - 1;

  return new Promise((resolve, reject) => {

    actionSheetInstance.showActionSheetWithOptions({
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
