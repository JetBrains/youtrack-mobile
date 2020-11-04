/* @flow */

import React, {Suspense} from 'react';

import {TouchableOpacity, View} from 'react-native';

import availableReactionNames from '../../../components/reactions/reactions-name-list';
import ModalPanelBottom from '../../../components/modal-panel-bottom/modal-panel-bottom';
import ReactionIcon from '../../../components/reactions/reaction-icon';

import {HIT_SLOP} from '../../../components/common-styles/button';
import styles from './single-issue-activity.styles';

import type {Reaction} from '../../../flow/Reaction';

type Props = {
  onHide: () => void,
  onSelect: (reaction: Reaction) => void,
}

const ReactionsPanel = (props: Props) => {

  return (
    <ModalPanelBottom
      testID="reactionsDialog"
      onHide={props.onHide}
    >
      <View style={styles.reactionContainer}>
        <Suspense
          fallback={null}
        >

          {availableReactionNames.map((reactionName: string) => {
            return (
              <View key={reactionName} style={styles.reactionItem}>
                <TouchableOpacity
                  style={styles.reactionButton}
                  hitSlop={HIT_SLOP}
                  onPress={() => props.onSelect({reaction: reactionName})}>
                  <ReactionIcon width={21} name={reactionName}/>
                </TouchableOpacity>
              </View>
            );

          })}

        </Suspense>
      </View>

    </ModalPanelBottom>
  );
};

export default React.memo<Props>(ReactionsPanel);
