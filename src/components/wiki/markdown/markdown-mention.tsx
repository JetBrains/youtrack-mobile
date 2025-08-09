import React from 'react';
import {Text, TextStyle} from 'react-native';

import Router from 'components/router/router';
import UserCard from 'components/user/user-card';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {guid} from 'util/util';
import {hasType} from 'components/api/api__resource-types';
import {IconFileText} from 'components/icon/icon';
import {useBottomSheetContext} from 'components/bottom-sheet';

import type {Mention} from 'components/wiki/markdown-view-rules';

import styles from 'components/wiki/markdown/markdown.styles';

const getLinkStyle = (m: Mention) => {
  if ('resolved' in m && m.resolved !== null) {
    return styles.resolved;
  }
  return styles.link;
};

export default function MarkdownMention({
  mention,
  onPress,
  style,
}: {
  mention: string;
  onPress: () => void;
  style: TextStyle;
}) {
  return (
    <Text key={guid()} onPress={onPress} selectable={true} style={style}>
      {mention}
    </Text>
  );
}

export function MarkdownMentionWithUserCard({mention, style}: {mention: Mention; style: TextStyle}) {
  const {openBottomSheet} = useBottomSheetContext();

  const isArticle = () => hasType.article(mention);
  const isUser = () => hasType.user(mention);

  const getMentionPresentation = (m: Mention): string => {
    let presentation = '';
    if (isUser()) {
      presentation = `@${getEntityPresentation(m)}`;
    }
    if ('summary' in m && isArticle()) {
      presentation = m.summary;
    }
    if ('idReadable' in m) {
      presentation = m.idReadable;
    }
    return presentation;
  };

  return (
    <Text
      onPress={() => {
        if (isUser() && 'login' in mention) {
          openBottomSheet({
            withHandle: false,
            children: <UserCard user={mention} />,
          });
        }
        if ('idReadable' in mention) {
          if (isArticle()) {
            Router.Article({articlePlaceholder: {id: mention.idReadable}, storePrevArticle: true});
          } else if (hasType.issue(mention)) {
            Router.Issue({issueId: mention.idReadable});
          }
        }
      }}
      selectable={true}
      style={[style, getLinkStyle(mention)]}
    >
      {isArticle() && (
        <Text>
          <IconFileText size={15} color={getLinkStyle(mention).color} />
          {'\u00A0'}
        </Text>
      )}
      {getMentionPresentation(mention)}
    </Text>
  );
}
