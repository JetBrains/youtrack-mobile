import React from 'react';
import {Text, TextStyle} from 'react-native';

import Router from 'components/router/router';
import UserCard from 'components/user/user-card';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {guid} from 'util/util';
import {hasType} from 'components/api/api__resource-types';
import {IconFileCheck, IconFileText} from 'components/icon/icon';
import {useBottomSheetContext} from 'components/bottom-sheet';

import type {Mention} from 'components/wiki/markdown-view-rules';
import type {User} from 'types/User';

import styles from 'components/wiki/markdown/markdown.styles';

const getLinkStyle = (m: Mention) => {
  if ('resolved' in m) {
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
}): React.ReactNode {
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
}): React.ReactNode {
  const {openBottomSheet} = useBottomSheetContext();

  const getMentionIcon = (m: Mention) => {
    const color: string = getLinkStyle(m).color;
    if (hasType.article(m)) {
      return (
        <Text>
          <IconFileText size={15} color={color} />
          {'\u00A0'}
        </Text>
      );
    } else {
      return hasType.issue(m) ? <IconFileCheck size={18} color={color} /> : null;
    }
  };

  const getMentionPresentation = (m: Mention): string => {
    if (hasType.user(m)) {
      return `@${getEntityPresentation(m)}`;
    }
    if ('summary' in m) {
      return m.summary;
    }
    if ('idReadable' in m) {
      return m.idReadable;
    }
    return '';
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
