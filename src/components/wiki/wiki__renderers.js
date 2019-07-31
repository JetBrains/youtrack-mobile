/* @flow */
import React from 'react';
import {Text, Image, Dimensions, Platform} from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import {idea} from 'react-syntax-highlighter/dist/styles';
import entities from 'entities';
import {COLOR_GRAY, COLOR_LIGHT_GRAY} from '../variables/variables';
import {handleRelativeUrl} from '../config/config';
import {getStorageState} from '../storage/storage';
import styles from './wiki.styles';
import Router from '../router/router';
import {showMoreInlineText} from '../text-view/text-view';

const IMAGE_WIDTH = Math.floor(Dimensions.get('window').width - 32);
const IMAGE_HEIGHT = 200;

export function renderCode(node: { children: any }, index: number, title?: string) {
  // App is hanging trying to render a huge text https://github.com/facebook/react-native/issues/19453
  const MAX_CODE_LENGTH = 700;

  const code = node.children.map(it => it.data).join('\n') || '';
  let trimmedCode = code;
  const isCodeTrimmed = code.length > MAX_CODE_LENGTH;

  if (isCodeTrimmed) {
    trimmedCode = `${code.substr(0, MAX_CODE_LENGTH)}...`;
  }

  return <Text key={index}>
    <SyntaxHighlighter
      PreTag={Text}
      CodeTag={Text}
      style={idea}
    >
      {entities.decodeHTML(trimmedCode)}
    </SyntaxHighlighter>
    {isCodeTrimmed && <Text
      style={styles.exceptionLink}
      onPress={() => Router.WikiPage({
        style: styles.monospace,
        title: title,
        plainText: code
      })}
    >
      {showMoreInlineText}
    </Text>}
  </Text>;
}

type RenderImageOptions = {
  node: Object,
  index: number,
  attachments: Array<Object>,
  imageHeaders: ?Object,
  onImagePress: string => any
}

export function renderImage({node, index, attachments, imageHeaders, onImagePress}: RenderImageOptions) {
  let src = node.attribs.src || '';

  const targetAttach = attachments.filter(it => src.indexOf(it.url) !== -1)[0] || {};
  src = targetAttach.url || src;

  const imgStyle = {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'contain'
  };
  const source = {
    uri: createUrl(),
    headers: imageHeaders
  };

  return (
    <Text onPress={() => onImagePress(source.uri)} key={index}>
      <Image
        source={source}
        style={imgStyle}
      />
      {Platform.OS === 'android' && '\n\n\n\n\n\n'}
    </Text>
  );

  function createUrl() {
    const uri = `${src}&w=${IMAGE_WIDTH * 2}&h=${IMAGE_HEIGHT * 2}`;
    const backendUrl = getStorageState().config?.backendUrl || '';
    //TODO(xi-eye): Deal with img relative URLs in one place
    return handleRelativeUrl(uri, backendUrl);
  }
}

export function renderTableRow(node: Object, index: number, defaultRenderer: Function) {
  const isBold = node.parent.name === 'thead';
  return (
    <Text key={index} style={[isBold && {
      fontWeight: 'bold',
      backgroundColor: COLOR_GRAY
    }]}>
      {''}
      {defaultRenderer(node.children, node.parent)}
      {'\n'}
    </Text>
  );
}

export function renderTableCell(node: Object, index: number, defaultRenderer: Function) {
  return (
    <Text numberOfLines={1} key={index} style={{
      width: 40,
      flex: 1
    }}>
      {' | '}
      {defaultRenderer(node.children, node.parent)}
      {!node.next && ' |'}
    </Text>
  );
}

export function renderTable(node: Object, index: number, defaultRenderer: Function) {
  return (
    <Text key={index} style={{backgroundColor: COLOR_LIGHT_GRAY}}>
      {defaultRenderer(node.children, node.parent)}
    </Text>
  );
}
