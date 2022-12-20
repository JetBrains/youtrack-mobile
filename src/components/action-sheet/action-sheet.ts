import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {DEFAULT_THEME} from '../theme/theme';
import styles from './action-sheet.styles';
import type {ActionSheetOptions} from '@expo/react-native-action-sheet';
export type ActionSheetOption = {
  title: string;
  execute?: (...args: any[]) => any;
};
// @ts-expect-error: any-typed ActionSheetOptions
export type ShowActionSheetWithOptions = (
  options: ActionSheetOptions,
  callback: (i: number) => void,
) => void;
export const defaultActionsOptions = {
  titleTextStyle: {
    color: styles.icon?.color || DEFAULT_THEME.colors.$icon,
  },
  messageTextStyle: {
    color: styles.icon?.color || DEFAULT_THEME.colors.$icon,
  },
  separatorStyle: {
    backgroundColor:
      styles.separator?.backgroundColor || DEFAULT_THEME.colors.$boxBackground,
  },
  containerStyle: {
    backgroundColor:
      styles.container?.backgroundColor || DEFAULT_THEME.colors.$background,
  },
  textStyle: {
    color: styles.text?.color || DEFAULT_THEME.colors.$text,
  },
  showSeparators: true,
};

async function doShowActions(
  options: ActionSheetOption[],
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  title?: string | null,
  message?: string | null,
) {
  const cancelIndex: number = options.length - 1;
  return new Promise((resolve: (...args: any[]) => any) => {
    showActionSheetWithOptions(
      {
        title,
        message,
        options: options.map(action => action.title),
        cancelButtonIndex: cancelIndex,
        ...defaultActionsOptions,
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
  title?: string | null,
  message?: string | null,
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
  title?: string | null,
  message?: string | null,
): Promise<ActionSheetOption | null | undefined> {
  return doShowActions(options, showActionSheetWithOptions, title, message);
}
