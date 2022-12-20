import React, {useState} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import BottomSheetModal from '../modal-panel-bottom/bottom-sheet-modal';
import ReactionIcon from '../reactions/reaction-icon';
import reactionNames from '../reactions/reactions-name-list';
import SelectItem from '../select/select__item';
import {UNIT} from '../variables/variables';
import {useSelector} from 'react-redux';
import styles from './comment.styles';
import type {AppState} from '../../reducers';
import type {IssueComment} from 'flow/CustomFields';
import type {Reaction} from 'flow/Reaction';
import type {User} from 'flow/User';
import type {ViewStyleProp} from 'flow/Internal';
type ReactionsType = {
  comment: IssueComment;
  currentUser: User;
  onReactionSelect?: (comment: IssueComment, reaction: Reaction) => any;
  size?: number;
  style?: ViewStyleProp;
};
type ReactionsMap = {
  key: string;
  value: Reaction;
};

const CommentReactions = (props: ReactionsType) => {
  const isOnline: boolean = useSelector(
    (state: AppState) => state.app.networkState?.isConnected,
  );
  const [selectedReaction, setSelectedReaction] = useState(null);

  if (
    !props.comment ||
    !props.comment.reactionOrder ||
    props.comment?.reactions?.length === 0
  ) {
    return null;
  }

  const reactionsMap: ReactionsMap = {};
  props.comment.reactions.map(
    (reaction: Reaction) => (reactionsMap[reaction.reaction] = reaction),
  );
  const {comment, onReactionSelect, size = UNIT * 2, style} = props;
  return (
    <>
      <View style={{...styles.reactionsContainer, ...style}}>
        {comment.reactionOrder.split('|').map((reactionName: string) => {
          if (!reactionNames.includes(reactionName)) {
            return null;
          }

          const count: number = comment.reactions.filter(
            (it: Reaction) => it.reaction === reactionName,
          ).length;
          const reaction: Reaction | null | undefined =
            reactionsMap[reactionName];

          if (reaction && props.currentUser) {
            const isUserReacted: boolean =
              reaction.author.id === props.currentUser.id;
            return (
              <TouchableOpacity
                key={reaction.id}
                disabled={!onReactionSelect || !isOnline}
                style={{
                  ...styles.reactionsReaction,
                  ...(isUserReacted ? styles.reactionsReactionSelected : null),
                }}
                onPress={() => onReactionSelect(props.comment, reaction)}
                onLongPress={() => {
                  setSelectedReaction(reaction);
                }}
              >
                <ReactionIcon name={reactionName} size={size} />
                {count > 1 && (
                  <Text style={styles.reactionsReactionCount}>{count}</Text>
                )}
              </TouchableOpacity>
            );
          }
        })}
      </View>
      {!!selectedReaction && (
        <BottomSheetModal
          isVisible={!!selectedReaction}
          title={
            <Text style={styles.reactionTitle}>
              {selectedReaction.reaction}
            </Text>
          }
          onClose={() => setSelectedReaction(null)}
        >
          {comment.reactions
            .filter((it: Reaction) => it.reaction === selectedReaction.reaction)
            .map((it: Reaction) => {
              return (
                <SelectItem
                  style={styles.reactionAuthor}
                  key={it.id}
                  item={it?.author}
                  titleRenderer={() => (
                    <Text style={styles.reactionAuthorText}>
                      {it.author.fullName}
                    </Text>
                  )}
                />
              );
            })}
        </BottomSheetModal>
      )}
    </>
  );
};

export default React.memo(CommentReactions);
