import React from 'react';
import {
  Clipboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SyntaxHighlighter from 'react-native-syntax-highlighter';
import {decodeHTML} from 'entities';
import {idea, darcula} from 'react-syntax-highlighter/dist/esm/styles/hljs';

import IconCopy from '@jetbrains/icons/copy.svg';
import IconFullscreen from '@jetbrains/icons/fullscreen.svg';
import Router from '../../router/router';
import {i18n} from 'components/i18n/i18n';
import {isAndroidPlatform} from 'util/util';
import {
  monospaceFontAndroid,
  monospaceFontIOS,
  SECONDARY_FONT_SIZE,
} from 'components/common-styles';
import {notify} from 'components/notification/notification';
import {showMoreText} from 'components/text-view/text-view';

import styles from '../youtrack-wiki.styles';

import type {MarkdownNode} from 'types/Markdown';
import type {UITheme} from 'types/Theme';

interface CodeData {
  code: string;
  snippet: string;
  hasMore: boolean;
}

type MarkdownNodeExt = MarkdownNode & { sourceInfo?: string; data?: string[]; };

const isAndroid: boolean = isAndroidPlatform();
const MAX_CODE_LENGTH: number = 630;

function getCodeData(node: MarkdownNode): CodeData {
  let code: string = node.content || (node?.children || []).map((it: MarkdownNodeExt) => it.data).join('\n') || '';
  code = code.replace(/(\n){4,}/g, '\n\n').replace(/[ \t]+$/g, '');
  const hasMore: boolean = code.length > MAX_CODE_LENGTH; //https://github.com/facebook/react-native/issues/19453

  return {
    snippet: hasMore ? `${code.substr(0, MAX_CODE_LENGTH)}…\n…` : code,
    code: code,
    hasMore,
  };
}


function getNodeLanguage(node: MarkdownNodeExt): string {
  return node.sourceInfo || '';
}

function isStacktraceOrException(language?: string): boolean {
  return !!language && ['exception', 'stacktrace'].includes(language);
}

function onShowFullCode(code: string) {
  Router.WikiPage({plainText: code});
}

function Highlighter({
  code = '',
  language,
  uiTheme,
}: {
  code: string;
  language: string;
  uiTheme: UITheme;
}) {
  return (
    <SyntaxHighlighter
      highlighter="hljs"
      language={language}
      PreTag={View}
      CodeTag={View}
      style={getCodeStyle(uiTheme)}
      fontSize={SECONDARY_FONT_SIZE}
      fontFamily={isAndroid ? monospaceFontAndroid : monospaceFontIOS}
    >
      {decodeHTML(code.trim())}
    </SyntaxHighlighter>
  );
}

function getCodeStyle(uiTheme: UITheme) {
  const codeStyle = uiTheme.dark ? darcula : idea;
  for (const i in codeStyle) {
    codeStyle[i].lineHeight = '1em';
  }
  return {
    ...codeStyle,
    ...{
      hljs: {
        backgroundColor: 'transparent',
        color: uiTheme.colors.$text,
      },
    },
  };
}

export function renderWikiCode(
  node: MarkdownNode,
  language: string,
  uiTheme: UITheme,
): JSX.Element {
  const codeData: CodeData = getCodeData(node);
  return (
    <Text onStartShouldSetResponder={() => true}>
      <Highlighter
        code={codeData.hasMore ? codeData.snippet : codeData.code}
        language={language}
        uiTheme={uiTheme}
      />

      {codeData.hasMore && (
        <>
          <Text>{'\n'}</Text>
          <Text
            onPress={() => onShowFullCode(codeData.code)}
            style={styles.showMoreLink}
          >{` ${showMoreText} `}</Text>
        </>
      )}
    </Text>
  );
}

function MarkdownCodeHighlighter(props: {node: MarkdownNode; uiTheme: UITheme}) {
  const {node, uiTheme} = props;
  const codeData: CodeData = getCodeData(node);
  const language: string = getNodeLanguage(node);
  const stacktraceOrException: boolean = isStacktraceOrException(language);
  const codeSnippet: string = codeData.hasMore
    ? codeData.snippet
    : codeData.code;
  return (
    <View style={styles.codeContainer}>
      {!stacktraceOrException && (
        <Text selectable={true} style={styles.codeLanguage}>
          {language}
        </Text>
      )}

      <View style={styles.codeToolbar}>
        <Text style={styles.codeToolbarText}>Code snippet</Text>
        <View style={styles.codeToolbarButtonContainer}>
          <TouchableOpacity
            style={styles.codeToolbarButton}
            onPress={() => {
              Clipboard.setString(codeData.code);
              notify(i18n('Copied'));
            }}
          >
            <IconCopy
              width={15}
              height={15}
              fill={styles.codeToolbarIcon.color}
              color={styles.codeToolbarIcon.color}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.codeToolbarButton}
            onPress={() => onShowFullCode(codeData.code)}
          >
            <IconFullscreen
              width={15}
              height={15}
              color={styles.codeToolbarIcon.color}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.codeScrollContainer}
        horizontal={true}
        fadingEdgeLength={70}
        scrollEventThrottle={100}
        contentContainerStyle={styles.codeScrollContent}
      >
        <View onStartShouldSetResponder={() => true}>
          {stacktraceOrException && (
            <View>
              <Text style={styles.exception}>{codeSnippet}</Text>
            </View>
          )}
          {!stacktraceOrException && (
            <Text selectable={true}>
              <Highlighter
                code={codeSnippet}
                language={language}
                uiTheme={uiTheme}
              />
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


export default React.memo(MarkdownCodeHighlighter);
