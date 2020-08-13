/* @flow */

import React from 'react';

import {Text} from 'react-native';

import SyntaxHighlighter from 'react-native-syntax-highlighter';
import entities from 'entities';
import Router from '../router/router';

import {isAndroidPlatform} from '../../util/util';
import {showMoreText} from '../text-view/text-view';
import {codeHighlightStyle} from './code-highlight-styles';
import {monospaceFontAndroid, monospaceFontIOS, SECONDARY_FONT_SIZE} from '../common-styles/typography';

import styles from './wiki.styles';

const isAndroid: boolean = isAndroidPlatform();

function renderCode(node: { content?: string, children?: any }, index: number, title?: string, language?: ?string) {
  // App is hanging trying to render a huge text https://github.com/facebook/react-native/issues/19453
  const MAX_CODE_LENGTH = 700;
  const newLine = <Text>{'\n'}</Text>;

  const code = node.content || (node?.children || []).map(it => it.data).join('\n') || '';
  let trimmedCode = code;
  const isCodeTrimmed = code.length > MAX_CODE_LENGTH;

  if (isCodeTrimmed) {
    trimmedCode = `${code.substr(0, MAX_CODE_LENGTH)} `;
  }

  return <Text key={index}>
    {newLine}
    <Text
      onPress={() => isCodeTrimmed && Router.WikiPage({
        style: styles.code,
        plainText: code
      })}>
      <SyntaxHighlighter
        language={language}
        PreTag={Text}
        CodeTag={Text}

        style={codeHighlightStyle}
        fontSize={SECONDARY_FONT_SIZE}
        fontFamily={isAndroid ? monospaceFontAndroid : monospaceFontIOS}
      >
        {entities.decodeHTML(trimmedCode)}
      </SyntaxHighlighter>
      {isCodeTrimmed && <Text
        style={styles.codeLink}
      >{`${showMoreText}\n`}</Text>}
      {newLine}
    </Text>
  </Text>;
}

export default renderCode;
