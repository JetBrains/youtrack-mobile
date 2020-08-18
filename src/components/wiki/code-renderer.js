/* @flow */

import React from 'react';

import {Text} from 'react-native';

import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { idea } from 'react-syntax-highlighter/dist/styles/hljs';

import entities from 'entities';
import Router from '../router/router';

import {isAndroidPlatform} from '../../util/util';
import {showMoreText} from '../text-view/text-view';
import {monospaceFontAndroid, monospaceFontIOS, SECONDARY_FONT_SIZE} from '../common-styles/typography';

import styles from './wiki.styles';

const isAndroid: boolean = isAndroidPlatform();

function renderCode(node: { content?: string, children?: any }, key: number | string, language?: ?string) {
  const MAX_CODE_LENGTH = 700;
  const newLine = <Text>{'\n'}</Text>;

  const code = node.content || (node?.children || []).map(it => it.data).join('\n') || '';
  let trimmedCode = code;
  const isCodeTrimmed = code.length > MAX_CODE_LENGTH; //https://github.com/facebook/react-native/issues/19453

  if (isCodeTrimmed) {
    trimmedCode = `${code.substr(0, MAX_CODE_LENGTH)}… `;
  }

  return <Text key={key}>
    {newLine}
    <Text
      onPress={() => isCodeTrimmed && Router.WikiPage({
        plainText: code
      })}>
      <SyntaxHighlighter
        highlighter={'hljs' || 'prism'}
        language={language}
        PreTag={Text}
        CodeTag={Text}

        style={idea}
        fontSize={SECONDARY_FONT_SIZE}
        fontFamily={isAndroid ? monospaceFontAndroid : monospaceFontIOS}
      >
        {entities.decodeHTML(trimmedCode)}
      </SyntaxHighlighter>
      {isCodeTrimmed && (
        <Text
          style={styles.showMoreLink}
        >{`${showMoreText} `}</Text>
      )}
      {newLine}
    </Text>
  </Text>;
}

export default renderCode;
