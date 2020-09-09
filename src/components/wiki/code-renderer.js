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
const MAX_CODE_LENGTH: number = 700;

type Node = { content?: string, children?: any };

function getCodeData(node: Node) {
  let code = node.content || (node?.children || []).map(it => it.data).join('\n') || '';
  code = code.replace(/(\n){4,}/g, '\n\n').replace(/[ \t]+$/g, '');

  const isTooLongCode = code.length > MAX_CODE_LENGTH; //https://github.com/facebook/react-native/issues/19453

  return {
    code: isTooLongCode ? `${code.substr(0, MAX_CODE_LENGTH)}… ` : code,
    fullCode: code,
    isLongCode: isTooLongCode
  };
}

function onShowFullCode(code: string) {
  Router.WikiPage({
    plainText: code
  });
}

function renderCode(node: Node, language?: ?string) {
  const codeData = getCodeData(node);

  return (
    <Text>
      <SyntaxHighlighter
        highlighter={'hljs' || 'prism'}
        language={language}
        PreTag={Text}
        CodeTag={Text}

        style={{...idea, ...{hljs: {backgroundColor: 'transparent'}}}}
        fontSize={SECONDARY_FONT_SIZE}
        fontFamily={isAndroid ? monospaceFontAndroid : monospaceFontIOS}
      >
        {entities.decodeHTML(codeData.code)}
      </SyntaxHighlighter>

      {codeData.isLongCode && (
        <Text
          onPress={() => codeData.isLongCode && onShowFullCode(codeData.fullCode)}
          style={styles.showMoreLink}
        >{` ${showMoreText} `}</Text>
      )}
    </Text>
  );
}

export default renderCode;
