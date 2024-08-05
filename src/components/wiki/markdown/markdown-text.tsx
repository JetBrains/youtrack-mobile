import React from 'react';
import {Text, TextStyle} from 'react-native';

import * as regExps from 'components/wiki/util/patterns';
import {doSortBy} from 'components/search/sorting';
import {hasMimeType} from 'components/mime-type/mime-type';
import {hasType} from 'components/api/api__resource-types';
import {imageEmbedRegExp, imageSize} from 'components/wiki/util/patterns';
import {MarkdownEmbedLink} from 'components/wiki/markdown/index';
import {MarkdownMentionWithUserCard} from 'components/wiki/markdown/markdown-mention';
import {Mention, Mentions} from 'components/wiki/markdown-view-rules';

import type {Article} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {MarkdownNode} from 'types/Markdown';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';

type Matcher = { regex: RegExp, mention: Mention, startPos: number | undefined };
type TextNodes = (string | React.ReactNode)[];


const getMatchRegex = (mention: Mention): RegExp => {
  const mentionValue: string = hasType.user(mention) ? `@${(mention as User).login}` : (mention as Article).idReadable;
  return (hasType.user(mention) ? regExps.createUserMentionRegexp : regExps.createMentionRegExp)(mentionValue);
};

const createSortedRegexps = (mentions: Mention[], md: string): Matcher[] => (
  mentions.map((mention: Mention): Matcher => {
    const regex = getMatchRegex(mention);
    return {
      mention,
      regex,
      startPos: md.search(regex),
    };
  }).filter((it: Matcher) => typeof it.startPos === 'number')
    .sort((a: Matcher, b: Matcher) => doSortBy(a, b, 'startPos'))
);

const MarkdownText = ({
  node,
  style,
  attachments,
  mentions,
}: {
  node: MarkdownNode,
  style: TextStyle[] | TextStyle,
  attachments: Attachment[],
  mentions: Mentions | undefined,
  uiTheme: UITheme,
}) => {
  const text: string = (
    node.content
      .replace(imageSize, '')
      .replace(regExps.whiteSpacesRegex, ' ')
      .replace(regExps.htmlTagRegex, ' ')
  );

  if (!text) {
    return null;
  }

  if (text.match(imageEmbedRegExp)) {
    const attach: Attachment | null | undefined = attachments.find(
      (it: Attachment) => it.name && text.includes(it.name),
    );

    if (attach && attach.url && hasMimeType.image(attach)) {
      return <MarkdownEmbedLink
        uri={attach.url}
        alt={node?.attributes?.alt}
        imageDimensions={attach.imageDimensions}
      />;
    }
  }

  const {articles = [], issues = [], users = []} = mentions || {};
  const mergedMentions = [...articles, ...issues, ...users];
  let textWithMentions: TextNodes = [text];

  if (mergedMentions.length !== 0) {
    textWithMentions = text.split(/(\s+)/).reduce((akk: TextNodes, str: string) => {
      const textNodes: TextNodes = str ? createSortedRegexps(mergedMentions, text).reduce((arr: TextNodes, it: Matcher) => {
        const match: RegExpMatchArray | null = str.match(it.regex);
        let mdParts: any[] = [];
        if (match?.[0]) {
          mdParts = match[0].length === str.length
            ? [<MarkdownMentionWithUserCard mention={it.mention} style={style}/>]
            : str.split(it.regex).filter(i => i !== undefined).map(
              (s: string) => s === '' ? <MarkdownMentionWithUserCard mention={it.mention} style={style}/> : s
            );
        }
        return [...arr, ...mdParts];
      }, []) : [str];

      return str ? [...akk, ...(textNodes.length > 0 ? textNodes : [str]), ''] : akk;
    }, []);
  }

  return (
    <Text
      key={node.key}
      style={style}
    >
      {textWithMentions.filter(Boolean)}
    </Text>
  );
};


export default React.memo(MarkdownText);
