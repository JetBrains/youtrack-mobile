import React, {useState} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';

import {useSelector} from 'react-redux';

import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import ReactionIcon from 'components/reactions/reaction-icon';
import SelectItem from 'components/select/select__item';
import {UNIT} from 'components/variables';

import styles from './comment.styles';

import type {AppState} from 'reducers';
import type {IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';

interface ReactionsData {
  [id: string]: {
    reaction: Reaction;
    count: number;
    author: User[];
  };
}

const CommentReactions = ({
  children,
  comment,
  currentUser,
  onReactionSelect,
  size = UNIT * 2,
  style,
}: {
  comment: IssueComment;
  currentUser: User | null;
  onReactionSelect?: (comment: IssueComment, reaction: Reaction) => void;
  size?: number;
  style?: ViewStyleProp;
} & React.PropsWithChildren) => {
  const isOnline: boolean = useSelector((state: AppState) => state.app.networkState?.isConnected) || true;
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);

  if (!comment?.reactions?.length) {
    return null;
  }

  const commentReactionsData = comment.reactions.reduce((map, r) => {
    if (!map[r.reaction]) {
      map[r.reaction] = {reaction: r, count: 1, author: [r.author]};
    } else {
      map[r.reaction].count++;
      map[r.reaction].author.push(r.author);
    }
    return map;
  }, {} as ReactionsData);

  const reactionOrder = comment.reactionOrder
    ? comment.reactionOrder.split('|')
    : Array.from(new Set(comment.reactions.map(r => r.reaction)));

  return (
    <>
      <View style={[styles.reactionsContainer, style]}>
        {reactionOrder.map((reactionName: string) => {
          const it = commentReactionsData[reactionName];
          if (it && currentUser) {
            const isUserReacted: boolean = it.author.some(u => u.id === currentUser.id);
            return (
              <TouchableOpacity
                key={it.reaction.id}
                disabled={!onReactionSelect || !isOnline}
                style={[styles.reactionsReaction, isUserReacted && styles.reactionsReactionSelected]}
                onPress={() => onReactionSelect?.(comment, it.reaction)}
                onLongPress={() => {
                  setSelectedReaction(it.reaction);
                }}
              >
                <ReactionIcon name={reactionName} size={size} />
                {it.count > 1 && <Text style={styles.reactionsReactionCount}>{it.count}</Text>}
              </TouchableOpacity>
            );
          }
        })}

        {children}
      </View>

      {!!selectedReaction && (
        <BottomSheetModal isVisible={!!selectedReaction} onClose={() => setSelectedReaction(null)}>
          {comment.reactions
            .filter((it: Reaction) => it.reaction === selectedReaction.reaction)
            .map((it: Reaction) => {
              return (
                <SelectItem
                  style={styles.reactionAuthor}
                  key={it.id}
                  item={it?.author}
                  titleRenderer={() => <Text style={styles.reactionAuthorText}>{it.author.fullName}</Text>}
                />
              );
            })}
        </BottomSheetModal>
      )}
    </>
  );
};

export default React.memo(CommentReactions);
