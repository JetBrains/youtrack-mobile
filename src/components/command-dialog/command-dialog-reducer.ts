import {
  commandDialogActionMap,
  CLOSE_COMMAND_DIALOG,
  OPEN_COMMAND_DIALOG,
  RECEIVE_COMMAND_SUGGESTIONS,
  START_APPLYING_COMMAND,
  STOP_APPLYING_COMMAND,
} from './command-dialog-action-types';
import type {CommandSuggestionResponse} from 'flow/Issue';
export const createCommandDialogTypeMap: Record<string, any> = (
  namespace: string = '',
) =>
  Object.keys(commandDialogActionMap).reduce(
    (map: typeof commandDialogActionMap, it: string) => ({
      ...map,
      [it]: `${namespace}.${it}`,
    }),
    {} as any,
  );
export const createCommandDialogReducers = (
  namespace: string = '',
): Record<string, any> => ({
  [`${namespace}.${OPEN_COMMAND_DIALOG}`]: (
    state: any,
    action: {
      initialCommand: string;
    },
  ): any => {
    return {
      ...state,
      showCommandDialog: true,
      initialCommand: action.initialCommand,
    };
  },
  [`${namespace}.${CLOSE_COMMAND_DIALOG}`]: (state: any): any => {
    return {
      ...state,
      showCommandDialog: false,
      commandSuggestions: null,
      initialCommand: '',
    };
  },
  [`${namespace}.${RECEIVE_COMMAND_SUGGESTIONS}`]: (
    state: any,
    action: {
      suggestions: CommandSuggestionResponse;
    },
  ): any => {
    return {...state, commandSuggestions: action.suggestions};
  },
  [`${namespace}.${START_APPLYING_COMMAND}`]: (state: any): any => {
    return {...state, commandIsApplying: true};
  },
  [`${namespace}.${STOP_APPLYING_COMMAND}`]: (state: any): any => {
    return {...state, commandIsApplying: false};
  },
});