import React, {useState} from 'react';

import {Text, View, TouchableOpacity} from 'react-native';

import ModalPanelBottom from '../modal-panel-bottom/modal-panel-bottom';
import ReactionIcon from '../reactions/reaction-icon';
import reactionNames from '../reactions/reactions-name-list';
import SelectItem from '../select/select__item';

import {UNIT} from '../variables/variables';
import styles from './comment.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {Reaction} from '../../flow/Reaction';
import type {User} from '../../flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type ReactionsType = {
  comment: IssueComment,
  currentUser: User,
  onReactionSelect?: (comment: IssueComment, reaction: Reaction) => any,
  size?: number,
  style?: ViewStyleProp
}

type ReactionsMap = { key: string, value: Reaction };


const CommentReactions = (props: ReactionsType) => {
  const [selectedReaction, setSelectedReaction] = useState(null);

  if (!props.comment || !props.comment.reactionOrder || props.comment?.reactions?.length === 0) {
    return null;
  }

  const reactionsMap: ReactionsMap = {};
  props.comment.reactions.map((reaction: Reaction) => reactionsMap[reaction.reaction] = reaction);
  const {comment, onReactionSelect, size = UNIT * 2, style} = props;

  return (
    <>
      <View style={{...styles.reactionsContainer, ...style}}>
        {comment.reactionOrder.split('|').map((reactionName: string) => {
          if (!reactionNames.includes(reactionName)) {
            return null;
          }

          const count: number = comment.reactions.filter((it: Reaction) => it.reaction === reactionName).length;
          const reaction: ?Reaction = reactionsMap[reactionName];
          if (reaction) {
            const isUserReacted: boolean = reaction.author.id === props.currentUser.id;
            return (
              <TouchableOpacity
                key={reaction.id}
                disabled={!onReactionSelect}
                style={{
                  ...styles.reactionsReaction,
                  ...(isUserReacted ? styles.reactionsReactionSelected : null),
                }}
                onPress={() => onReactionSelect(props.comment, reaction)}
                onLongPress={() => {
                  setSelectedReaction(reaction);
                }}
              >
                <ReactionIcon name={reactionName} size={size}/>
                {count > 1 && <Text style={styles.reactionsReactionCount}>{count}</Text>}
              </TouchableOpacity>
            );
          }

        })}
      </View>
      {selectedReaction && (
        <ModalPanelBottom
          title={<Text style={styles.reactionTitle}>{selectedReaction.reaction}</Text>}
          onHide={() => setSelectedReaction(null)}
        >
          {comment.reactions.filter((it: Reaction) => it.reaction === selectedReaction.reaction).map((it: Reaction) => {
            return <SelectItem style={styles.reactionAuthor} key={it.id} item={it.author} titleRenderer={() => (
              <Text style={styles.reactionAuthorText}>{it.author.fullName}</Text>
            )}/>;
          })}
        </ModalPanelBottom>
      )}

    </>
  );
};

export default React.memo(CommentReactions);
