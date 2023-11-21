import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import {DEFAULT_THEME, getSystemThemeMode, getUITheme} from 'components/theme/theme';
import {getStorageState} from 'components/storage/storage';

import type {ActionSheetOptions} from '@expo/react-native-action-sheet';
import {UITheme} from 'types/Theme';

export type ActionSheetOption = {
  title: string;
  execute?: (...args: any[]) => any;
};

export type ShowActionSheetWithOptions = (
  options: ActionSheetOptions,
  callback: (i: number) => void,
) => void;

export const defaultActionsOptions = (uiTheme: UITheme = DEFAULT_THEME) => {
  const uiThemeColors = uiTheme.colors;
  return ({
    showSeparators: true,
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
  });
};

async function doShowActions(
  options: ActionSheetOption[],
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  title?: string,
  message?: string,
) {
  const cancelIndex: number = options.length - 1;
  const uiTheme = await getUITheme(getSystemThemeMode() || getStorageState().themeMode);
  return new Promise((resolve: (...args: any[]) => any) => {
    showActionSheetWithOptions(
      {
        title,
        message,
        options: options.map(action => action.title),
        cancelButtonIndex: cancelIndex,
        ...defaultActionsOptions(uiTheme),
      },
      actionIndex => {
        const action = options[actionIndex];

        if (actionIndex === cancelIndex) {
          return resolve(null);
        }

        return resolve(action);
      },
    );
  });
}

export function showActions(
  options: ActionSheetOption[],
  actionSheetInstance: typeof ActionSheetProvider,
  title?: string,
  message?: string,
): Promise<ActionSheetOption> {
  return doShowActions(
    options,
    actionSheetInstance.getContext().showActionSheetWithOptions,
    title,
    message,
  );
}
export function showActionSheet(
  options: ActionSheetOption[],
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  title: string,
  message?: string,
): Promise<ActionSheetOption | null | undefined> {
  return doShowActions(options, showActionSheetWithOptions, title, message);
}
