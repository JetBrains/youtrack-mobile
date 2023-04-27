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


export default function MarkdownMention({mention, onPress, style}: {
  mention: string,
  onPress: () => void,
  style: TextStyle | TextStyle[],
}): JSX.Element | null {
  return (
    <Text
      key={guid()}
      onPress={onPress}
      selectable={true}
      style={style}
    >
      {mention}
    </Text>
  );
}


export function MarkdownMentionWithUserCard({mention, style}: {
  mention: Mention,
  style: TextStyle | TextStyle[]
}): JSX.Element | null {
  const {openBottomSheet} = useBottomSheetContext();

  const getMentionPresentation = (mention: Mention): string => {
    return hasType.user(mention) ? `@${getEntityPresentation(mention)}` : mention.summary || mention.idReadable;
  };

  const getLinkStyle = (mention: Mention) => {
    return mention.resolved ? styles.resolved : styles.link;
  };

  const getMentionIcon = (mention: Mention) => {
    return hasType.article(mention)
      ? <Text><IconFileText size={15} color={getLinkStyle(mention).color}/>{'\u00A0'}</Text>
      : hasType.issue(mention) ? <IconFileCheck size={18} color={getLinkStyle(mention).color}/> : null;
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
            children: <UserCard user={mention as User}/>,
          });
        }
      }}
      selectable={true}
      style={[style, getLinkStyle(mention)]}
    >
      {getMentionIcon(mention)}{getMentionPresentation(mention)}
    </Text>
  );
}
