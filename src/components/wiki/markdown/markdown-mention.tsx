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
import type {User} from 'types/User';

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
  style: TextStyle | TextStyle[];
}) {
  return (
    <Text key={guid()} onPress={onPress} selectable={true} style={style}>
      {mention}
    </Text>
  );
}

export function MarkdownMentionWithUserCard({
  mention,
  style,
}: {
  mention: Mention;
  style: TextStyle | TextStyle[];
}) {
  const {openBottomSheet} = useBottomSheetContext();

  const isArticle = () => hasType.article(mention);

  const getMentionIcon = (m: Mention) => {
    if (isArticle()) {
      return (
        <Text>
          <IconFileText size={15} color={getLinkStyle(m).color} />
          {'\u00A0'}
        </Text>
      );
    }
    return null;
  };

  const getMentionPresentation = (m: Mention): string => {
    let presentation = '';
    if (hasType.user(m)) {
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
        if (hasType.article(mention)) {
          Router.Article({articlePlaceholder: {id: mention.id}, storePrevArticle: true});
        } else if (hasType.issue(mention)) {
          Router.Issue({issueId: mention.id});
        }
        if (hasType.user(mention)) {
          openBottomSheet({
            withHandle: false,
            children: <UserCard user={mention as User} />,
          });
        }
      }}
      selectable={true}
      style={[style, getLinkStyle(mention)]}
    >
      {getMentionIcon(mention)}
      {getMentionPresentation(mention)}
    </Text>
  );
}
