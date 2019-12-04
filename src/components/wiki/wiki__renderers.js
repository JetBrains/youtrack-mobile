/* @flow */
import React from 'react';
import {Text, Image, Platform} from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import {codeHighlightStyle} from './code-highlight-styles';
import entities from 'entities';
import {COLOR_GRAY, COLOR_LIGHT_GRAY} from '../variables/variables';
import styles from './wiki.styles';
import Router from '../router/router';
import {showMoreText} from '../text-view/text-view';
import type {Attachment} from '../../flow/CustomFields';
import {hasMimeType} from '../mime-type/mime-type';
import {SvgFromUri} from 'react-native-svg';

const IMAGE_SIZE = 200;


export function renderCode(node: { children: any }, index: number, title?: string, language?: string) {
  // App is hanging trying to render a huge text https://github.com/facebook/react-native/issues/19453
  const MAX_CODE_LENGTH = 700;
  const newLine = <Text>{'\n'}</Text>;

  const code = node.children.map(it => it.data).join('\n') || '';
  let trimmedCode = code;
  const isCodeTrimmed = code.length > MAX_CODE_LENGTH;

  if (isCodeTrimmed) {
    trimmedCode = `${code.substr(0, MAX_CODE_LENGTH)}\n...`;
  }

  return <Text key={index}>
    {newLine}
    <Text
      style={styles.codeBlock}
      onPress={() => isCodeTrimmed && Router.WikiPage({
        style: styles.code,
        title: title,
        plainText: code
      })}>
      <SyntaxHighlighter
        key={index}
        language={language}
        PreTag={Text}
        CodeTag={Text}
        style={codeHighlightStyle}
      >
        {entities.decodeHTML(trimmedCode)}
      </SyntaxHighlighter>
      {isCodeTrimmed && <Text
        style={styles.codeLink}
      >{`${showMoreText}`}</Text>}
      {newLine}
    </Text>
  </Text>;
}

type RenderImageOptions = {
  node: Object,
  index: number,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  onImagePress: string => any
}

function getUrlParams(url): Object {
  const urlParams = url.split('?')[1];
  return (
    urlParams
      ? urlParams.split('&').map(keyValue => keyValue.split('=')).reduce((params, [key, value]) => {
        params[key] = value;
        return params;
      }, {})
      : {file: url}
  );
}

function findTargetAttach(src: string, attachments: Array<Attachment>): ?Object {
  let attachId: string;
  let targetAttach: Attachment;
  const urlFileParam = getUrlParams(src).file;

  if (urlFileParam) {
    attachId = urlFileParam;
    targetAttach = attachments.find(attach => getUrlParams(attach.url).file === attachId) || {};
  } else {
    attachId = src.split('?')[0].split('/').pop();
    targetAttach = attachments.find(it => it.id === attachId) || {};
  }
  return targetAttach;
}

export function renderImage({node, index, attachments, imageHeaders, onImagePress}: RenderImageOptions) {
  const targetAttach: Attachment = findTargetAttach(node.attribs.src || '', attachments);

  if (!targetAttach) {
    return null;
  }

  const source = Object.assign({uri: targetAttach.url, headers: imageHeaders}, targetAttach);
  const isSvg = hasMimeType.svg(source);
  const isImage = hasMimeType.image(source);

  return (
    <Text
      onPress={() => onImagePress(source.url)}
      key={`wiki-image-${index}`}
    >
      {isSvg && (
        <SvgFromUri
          width="100%"
          height="100%"
          uri={source.url}
        />
      )}
      {isImage && (
        <Image
          source={source}
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            resizeMode: 'contain'
          }}
        />
      )}
      {Platform.OS === 'android' && '\n\n\n\n\n\n'}
    </Text>
  );
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
