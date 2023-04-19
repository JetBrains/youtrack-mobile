import React from 'react';
import {Text, TextStyle} from 'react-native';

import Router from 'components/router/router';
import UserCard from 'components/user/user-card';
import {createMentionRegExp, createUserMentionRegexp} from 'components/wiki/util/patterns';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {guid} from 'util/util';
import {hasType} from 'components/api/api__resource-types';
import {useBottomSheetContext} from 'components/bottom-sheet';

import styles from 'components/wiki/markdown/markdown.styles';

import type {MarkdownNode} from 'types/Markdown';
import type {Mention, Mentions} from 'components/wiki/markdown-view-rules';
import {User} from 'types/User';

type Node = {
  text: string;
  mention?: Mention,
  $type: string | null;
};

const PLAIN_TEXT_TYPE: string = 'plainText';

const getMentionPresentation = (mention: Mention): string => {
  return hasType.user(mention) ? `@${getEntityPresentation(mention)}` : mention.idReadable;
};

const getMentionValue = (mention: Mention): string => {
  return hasType.user(mention) ? `@${mention.login}` : mention.idReadable;
};

const getMatchRegex = (mention: Mention): RegExp => {
  const mentionValue: string = getMentionValue(mention);
  return (hasType.user(mention) ? createUserMentionRegexp : createMentionRegExp)(mentionValue);
};

interface Props {
  mentions: Mentions;
  node: MarkdownNode;
  style: TextStyle[] | TextStyle;
}


const MarkdownTextWithMentions = ({mentions, node, style}: Props): JSX.Element | null => {
  const {openBottomSheet} = useBottomSheetContext();

  const renderMention = (td: Node): React.ReactNode => {
    return (
      <Text
        selectable={true}
        style={[
          style,
          styles.link,
        ]}
        onPress={() => {
          const id: string = td.text.trim();
          if (hasType.article(td)) {
            Router.Article({articlePlaceholder: {idReadable: id}, storePrevArticle: true});
          } else if (hasType.issue(td)) {
            Router.Issue({issueId: id});
          } if (hasType.user(td)) {
            openBottomSheet({
              withHandle: false,
              children: <UserCard user={td.mention as User}/>,
            });
          }
        }}
      >
        {td.text}
      </Text>
    );
  };

  const parseNodeContent = (nodeContent: string): Node[] => {
    const {articles = [], issues = [], users = []} = mentions;
    const mergedMentions: Mention[] = [...articles, ...issues, ...users];
    const tokens: string[] = nodeContent.split(' ');
    const td: Node[] = [];

    parseNodeContent: for (let i = 0; i < tokens.length; i++) {
      const token: string = tokens[i];
      const tokenTextData: Node = {text: token, $type: null};

      for (let j = 0; j < mergedMentions.length; j++) {
        const mention: Mention = mergedMentions[j];

        const match: RegExpMatchArray | null = token.match(getMatchRegex(mention));
        if (!match?.[0]) {
          continue;
        }

        const mentionValue: string = getMentionValue(mention);
        if (token === mentionValue) {
          td.push({
            mention,
            text: getMentionPresentation(mention),
            $type: mention.$type,
          });
        } else {
          token.split(mentionValue).forEach((str: string) => {
            td.push({
              mention,
              text: str || getMentionPresentation(mention),
              $type: str ? PLAIN_TEXT_TYPE : mention.$type,
            });
          });
        }

        continue parseNodeContent;
      }

      if (!tokenTextData.$type) {
        tokenTextData.$type = PLAIN_TEXT_TYPE;
        td.push(tokenTextData);
      }
    }

    return td;
  };

  const createContent = (textData: Node[]): React.ReactNode => {
    const content: React.ReactNode[] = [];

    let index: number = -1;
    let textTokensToJoin: string[] = [];

    while (index < textData.length - 1) {
      index++;
      const td: Node = textData[index];

      if (td.$type === PLAIN_TEXT_TYPE) {
        textTokensToJoin.push(td.text);
        continue;
      }

      if (td.$type !== PLAIN_TEXT_TYPE) {
        content.push(
          <Text selectable={true} key={guid()}>
            {
              textTokensToJoin.length > 0 && (
                <Text
                  selectable={true}
                  style={style}
                >
                  {`${textTokensToJoin.join(' ')} `}
                </Text>
              )
            }
            {
              renderMention(td)
            }
            {textData[index + 1]?.text?.length > 1 && ' '}
          </Text>,
        );
        textTokensToJoin = [];
      }
    }

    if (textTokensToJoin.length > 0) {
      content.push(
        <Text
          key={guid()}
          selectable={true}
          style={style}
        >
          {textTokensToJoin.join(' ')}
        </Text>,
      );
    }

    return content;
  };


  const nodeData: Node[] = parseNodeContent(node.content);
  return nodeData.length === 0 ? null : (
    <Text
      selectable={true}
      style={style}
    >
      {createContent(nodeData)}
    </Text>
  );
};


export default React.memo(MarkdownTextWithMentions);
