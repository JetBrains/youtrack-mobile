import React, {useState} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';

import {useSelector} from 'react-redux';

import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import ReactionIcon from 'components/reactions/reaction-icon';
import reactionNames from 'components/reactions/reactions-name-list';
import SelectItem from 'components/select/select__item';
import {UNIT} from 'components/variables';

import styles from './comment.styles';

import type {AppState} from 'reducers';
import type {IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';

interface ReactionsType {
  children: JSX.Element | null;
  comment: IssueComment;
  currentUser: User | null;
  onReactionSelect?: (comment: IssueComment, reaction: Reaction) => any;
  size?: number;
  style?: ViewStyleProp;
}

interface ReactionsMap {
  [key: string]: Reaction;
}

type SelectedReaction = Reaction | null;

const CommentReactions = (props: ReactionsType) => {
  const isOnline: boolean = useSelector(
    (state: AppState) => state.app.networkState?.isConnected,
  ) || true;
  const [selectedReaction, setSelectedReaction] = useState<SelectedReaction>(null);

  if (
    !props.comment ||
    !props.comment.reactionOrder ||
    props.comment?.reactions?.length === 0
  ) {
    return null;
  }

  const reactionsMap: ReactionsMap = props.comment.reactions.reduce((map: ReactionsMap, r: Reaction) => {
    return {...map, [r.reaction]: r};
  }, {});

  const {comment, onReactionSelect, size = UNIT * 2, style} = props;
  return (
    <>
      <View style={[styles.reactionsContainer, style]}>
        {comment.reactionOrder.split('|').map((reactionName: string) => {
          if (!reactionNames.includes(reactionName)) {
            return null;
          }

          const count: number = comment.reactions.filter(
            (it: Reaction) => it.reaction === reactionName,
          ).length;
          const reaction: Reaction | undefined = reactionsMap[reactionName];

          if (reaction && props.currentUser) {
            const isUserReacted: boolean =
              reaction.author.id === props.currentUser.id;
            return (
              <TouchableOpacity
                key={reaction.id}
                disabled={!onReactionSelect || !isOnline}
                style={[styles.reactionsReaction, isUserReacted && styles.reactionsReactionSelected]}
                onPress={() => onReactionSelect?.(props.comment, reaction)}
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
        {props?.children}
      </View>
      {!!selectedReaction && (
        <BottomSheetModal
          isVisible={!!selectedReaction}
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
