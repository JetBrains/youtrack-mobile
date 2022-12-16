/* @flow */

import React from 'react';
import {Text} from 'react-native';

import Router from 'components/router/router';
import {createMentionRegExp} from '../util/patterns';
import {guid} from 'util/util';
import {ResourceTypes} from 'components/api/api__resource-types';

import type {Article} from 'flow/Article';
import type {IssueFull} from 'flow/Issue';
import type {MarkdownASTNode} from 'flow/Markdown';
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from 'flow/Theme';

export type Mentions = {
  articles: Array<Article>,
  issues: Array<IssueFull>,
}

type TextData = {
  text: string,
  type: null | number | typeof ResourceTypes.ARTICLE | typeof ResourceTypes.ISSUE,
};


export default function renderArticleMentions(
  node: MarkdownASTNode,
  mentions: Mentions,
  uiTheme: UITheme,
  style: Object,
  inheritedStyles: Object,
  textStyle: TextStyleProp,
) {
  const PLAIN_TEXT_TYPE: string = '-=TEXT=-';
  const textData: Array<TextData> = [];
  const tokens: Array<string> = node.content.split(' ');
  const combinedMentions: Array<Article | IssueFull> = mentions.articles.concat(mentions.issues);

  parseNodeContent:
    for (let i = 0; i < tokens.length; i++) {
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
    let textTokensToJoin: Array<string> = [];
    const composed: Array<React$Element<any>> = [];

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
            {textTokensToJoin.length > 0 &&
              <Text selectable={true} style={[style.text, textStyle]}>{`${textTokensToJoin.join(' ')} `}</Text>}
            <Text
              selectable={true}
              style={[{color: uiTheme.colors.$link}, textStyle]}
              onPress={
                () => (
                  td.type === ResourceTypes.ARTICLE
                    ? Router.Article({articlePlaceholder: {idReadable: td.text}, storePrevArticle: true})
                    : Router.Issue({issueId: td.text})
                )}
            >{td.text}</Text>
          </Text>
        );
        textTokensToJoin = [];
      }
    }

    if (textTokensToJoin.length > 0) {
      composed.push(
        <Text
          selectable={true}
          style={[inheritedStyles, style.text, textStyle]}
          key={guid()}
        >{textTokensToJoin.join(' ')}
        </Text>
      );
    }

    return <Text selectable={true} key={node.key} style={textStyle}>{composed}</Text>;
  }

}
