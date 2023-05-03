import React from 'react';
import {Text, TextStyle} from 'react-native';

import * as regExps from 'components/wiki/util/patterns';
import {doSortBy} from 'components/search/sorting';
import {hasMimeType} from 'components/mime-type/mime-type';
import {hasType, ResourceTypes} from 'components/api/api__resource-types';
import {imageEmbedRegExp, imageHeight, imageWidth} from 'components/wiki/util/patterns';
import {MarkdownEmbedLink} from 'components/wiki/markdown/index';
import {MarkdownMentionWithUserCard} from 'components/wiki/markdown/markdown-mention';
import {Mention, Mentions} from 'components/wiki/markdown-view-rules';

import {Article} from 'types/Article';
import {Attachment} from 'types/CustomFields';
import {MarkdownNode} from 'types/Markdown';
import {UITheme} from 'types/Theme';
import {User} from 'types/User';

type Matcher = { regex: RegExp, mention: Mention, startPos: number | undefined };
type TextNodes = (string | React.ReactNode)[] | string;


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
}): JSX.Element | null => {

  const text: string = (
    node.content
      .replace(imageHeight, '')
      .replace(imageWidth, '')
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
  let textWithMentions: TextNodes;

  if (mergedMentions.length === 0) {
    textWithMentions = text.split(' ').reduce((akk: TextNodes, str: string) => {
      const matchedIssue: RegExpMatchArray | null = str.match(regExps.issueIdRegExp);
      const matchedUser: RegExpMatchArray | null = str.match(regExps.userLoginRegExp);
      const userLogin: string | undefined = matchedUser?.[0];
      const idReadable: string | undefined = matchedIssue?.[0];
      const mention = idReadable || userLogin ? {
        $type: idReadable ? ResourceTypes.ISSUE : userLogin ? ResourceTypes.USER : '',
        idReadable,
        login: userLogin?.slice(1),
        name: userLogin?.slice(1),
        id: idReadable || userLogin,
      } : null;
      return [
        ...akk,
      ...(mention ? [<MarkdownMentionWithUserCard mention={mention} style={style}/>] : [str]),
        ' ',
      ];
    }, []);

  } else {

    textWithMentions = text.split(' ').reduce((akk: TextNodes, str: string) => {
      const textNodes: TextNodes = createSortedRegexps(mergedMentions, text).reduce((arr: TextNodes, it: Matcher) => {
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
      }, []);

      return str ? [...akk, ...(textNodes.length > 0 ? textNodes : [str]), ' '] : akk;
    }, []);
  }

  return (
    <Text
      key={node.key}
      style={style}
    >
      {textWithMentions}
    </Text>
  );
};


export default React.memo(MarkdownText);
