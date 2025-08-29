import React from 'react';

import {TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';

import {defaultActionsOptions} from 'components/action-sheet/action-sheet';
import {HIT_SLOP} from 'components/common-styles';
import {IconMoreOptions} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {AppState} from 'reducers';
import type {UITheme} from 'types/Theme';

interface Props {
  options: Array<{title: string; execute?: () => void}>;
  uiTheme: UITheme;
  title: string;
  showActionSheetWithOptions: (options: any, callback: (index?: number) => void) => void;
}

export const ThreadSettings = ({options, uiTheme, title, showActionSheetWithOptions}: Props) => {
  const isOnline: boolean = useSelector((state: AppState) => !!state.app.networkState?.isConnected);

  return (
    <View style={styles.threadTitleActions}>
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        disabled={!isOnline}
        testID="test:id/inboxThreadsThreadSettings"
        accessibilityLabel="inboxThreadsThreadSettings"
        accessible={true}
        onPress={() => {
          showActionSheetWithOptions(
            {
              ...defaultActionsOptions(uiTheme),
              options: options.map(action => action.title),
              title,
              cancelButtonIndex: options.length - 1,
            },
            (index?: number) => options[index as number]?.execute?.(),
          );
        }}
        style={styles.threadTitleAction}
      >
        <IconMoreOptions color={isOnline ? styles.icon.color : styles.disabled.color} />
      </TouchableOpacity>
    </View>
  );
};
