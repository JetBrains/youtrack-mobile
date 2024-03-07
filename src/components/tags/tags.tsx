import React from 'react';
import {View, TouchableOpacity} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {useSelector} from 'react-redux';

import ColorField from 'components/color-field/color-field';
import {guid} from 'util/util';
import {i18n} from 'components/i18n/i18n';

import styles from './tags.styles';

import type {Tag} from 'types/CustomFields';
import type {ViewStyleProp} from 'types/Internal';
import {ActionSheetAction} from 'types/Action';
import {AppState} from 'reducers';
import {issuesSearchSettingMode} from 'views/issues';

interface Props {
  tags: Tag[];
  onTagPress?: (query: string) => void;
  onTagRemove?: (id: string) => void;
  style?: ViewStyleProp;
  multiline?: boolean;
}

const Tags = (props: Props): React.JSX.Element | null => {
  const {showActionSheetWithOptions} = useActionSheet();

  const isFilterMode: boolean = useSelector((state: AppState) => {
    return state.issueList?.settings?.search?.mode === issuesSearchSettingMode.filter;
  });

  const getContextActions = (tag: Tag): ActionSheetAction[] => {
    const actions: ActionSheetAction[] = [];
    if (!isFilterMode && props?.onTagPress) {
      actions.push({
        title: i18n('Show all issues tagged with "{{tagName}}"...', {
          tagName: tag.name,
        }),
        execute: () => props?.onTagPress?.(tag.query),
      });
    }
    if (props.onTagRemove) {
      actions.push({
        title: i18n('Remove tag'),
        execute: () => props?.onTagRemove?.(tag.id),
      });
    }

    if (actions.length > 0) {
      actions.push({
        title: i18n('Cancel'),
      });
    }
    return actions;
  };

  const {tags, multiline, style} = props;

    if (!tags || tags?.length === 0) {
      return null;
    }

    return (
      <View
        testID="test:id/tagsList"
        accessibilityLabel="tagsList"
        accessible={false}
        style={[styles.tags, multiline ? styles.tagsMultiline : null, style]}
      >
        {(tags || []).map((tag: Tag) => {
          return (
            <TouchableOpacity
              style={[styles.tag, multiline ? styles.tagMultiline : null]}
              testID="test:id/tagsListTag"
              accessible={false}
              onPress={() => {
                const contextActions = getContextActions(tag);
                if (contextActions.length > 0) {
                  showActionSheetWithOptions(
                    {
                      options: contextActions.map((it: ActionSheetAction) => it.title),
                      cancelButtonIndex: contextActions.length - 1,
                    },
                    (index: number | undefined): void | Promise<void> => {
                      contextActions[index as number]?.execute?.();
                    },
                  );
                }
              }}
              key={guid()}
            >
              <ColorField
                testID="tagColor"
                text={tag.name}
                color={tag.color}
                fullText={true}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
};

export default React.memo(Tags);
