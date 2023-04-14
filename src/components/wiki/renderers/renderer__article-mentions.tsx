import React from 'react';
import {Text} from 'react-native';
import Router from 'components/router/router';
import {createMentionRegExp} from '../util/patterns';
import {guid} from 'util/util';
import {ResourceTypes} from 'components/api/api__resource-types';
import type {Article} from 'types/Article';
import type {IssueFull} from 'types/Issue';
import type {MarkdownNode} from 'types/Markdown';
import type {UITheme} from 'types/Theme';
export type Mentions = {
  articles: Article[];
  issues: IssueFull[];
};
type TextData = {
  text: string;
  type:
    | null
    | number
    | typeof ResourceTypes.ARTICLE
    | typeof ResourceTypes.ISSUE;
};
export default function renderArticleMentions(
  node: MarkdownNode,
  mentions: Mentions,
  uiTheme: UITheme,
  style: Record<string, any>,
  inheritedStyles: Record<string, any>,
): JSX.Element | null {
  const PLAIN_TEXT_TYPE: string = '-=TEXT=-';
  const textData: TextData[] = [];
  const tokens: string[] = node.content.split(' ');
  const combinedMentions: Array<Article | IssueFull> = mentions.articles.concat(mentions.issues);
  const baseTextStyle = [inheritedStyles, style.text];

  parseNodeContent: for (let i = 0; i < tokens.length; i++) {
    const token: string = tokens[i];
    const tokenTextData: TextData = {
      text: token,
      type: null,
    };

    for (let j = 0; j < combinedMentions.length; j++) {
      const entity: Article | IssueFull = combinedMentions[j];

      if (!createMentionRegExp(entity.idReadable).test(token)) {
        continue;
      }

      if (token === entity.idReadable) {
        textData.push({
          text: entity.idReadable,
          type: entity.$type,
        });
      } else {
        token.split(entity.idReadable).forEach((str: string) => {
          textData.push({
            text: str ? str : entity.idReadable,
            type: str ? PLAIN_TEXT_TYPE : entity.$type,
          });
        });
      }

      continue parseNodeContent;
    }

    if (!tokenTextData.type) {
      tokenTextData.type = PLAIN_TEXT_TYPE;
      textData.push(tokenTextData);
    }
  }

  if (textData.length > 0) {
    let index: number = -1;
    let textTokensToJoin: string[] = [];
    const composed: Array<
      React.ReactElement<React.ComponentProps<any>, any>
    > = [];

    while (index < textData.length - 1) {
      index++;
      const td: TextData = textData[index];

      if (td.type === PLAIN_TEXT_TYPE) {
        textTokensToJoin.push(td.text);
        continue;
      }

      if (td.type !== PLAIN_TEXT_TYPE) {
        composed.push(
          <Text selectable={true} key={guid()}>
            {textTokensToJoin.length > 0 && (
              <Text
                selectable={true}
                style={baseTextStyle}
              >{`${textTokensToJoin.join(' ')} `}</Text>
            )}
            <Text
              selectable={true}
              style={[
                baseTextStyle,
                {
                  color: uiTheme.colors.$link,
                },
              ]}
              onPress={() =>
                td.type === ResourceTypes.ARTICLE
                  ? Router.Article({
                      articlePlaceholder: {
                        idReadable: td.text,
                      },
                      storePrevArticle: true,
                    })
                  : Router.Issue({
                      issueId: td.text,
                    })
              }
            >
              {td.text}
            </Text>
          </Text>,
        );
        textTokensToJoin = [];
      }
    }

    if (textTokensToJoin.length > 0) {
      composed.push(
        <Text
          selectable={true}
          style={baseTextStyle}
          key={guid()}
        >
          {textTokensToJoin.join(' ')}
        </Text>,
      );
    }

    return (
      <Text selectable={true} key={node.key} style={baseTextStyle}>
        {composed}
      </Text>
    );
  }

  return null;
}
