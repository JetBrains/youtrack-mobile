/* @flow */

import React from 'react';

import {TouchableOpacity, View} from 'react-native';

import availableReactionNames from 'components/reactions/reactions-name-list';
import BottomSheetModal from '../../../components/modal-panel-bottom/bottom-sheet-modal';
import ReactionIcon from 'components/reactions/reaction-icon';

import {HIT_SLOP} from 'components/common-styles/button';
import styles from './issue-activity.styles';

import type {Reaction} from 'flow/Reaction';

type Props = {
  onHide: () => void,
  onSelect: (reaction: Reaction) => void,
}

const ReactionsPanel = (props: Props) => {

  return (
    <BottomSheetModal
      isVisible={true}
      testID="reactionsDialog"
      onClose={props.onHide}
    >
      <View style={styles.reactionContainer}>
        {availableReactionNames.map((reactionName: string) => {
          return (
            <View key={reactionName} style={styles.reactionItem}>
              <TouchableOpacity
                style={styles.reactionButton}
                hitSlop={HIT_SLOP}
                onPress={() => props.onSelect({reaction: reactionName})}>
                <ReactionIcon size={21} name={reactionName}/>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </BottomSheetModal>
  );
};

export default (React.memo<Props>(ReactionsPanel): React$AbstractComponent<Props, mixed>);
