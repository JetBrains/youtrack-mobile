/* @flow */
import React from 'react';
import {Text, Image, Dimensions, Platform} from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import {idea} from 'react-syntax-highlighter/dist/styles';
import entities from 'entities';

const IMAGE_WIDTH = Math.floor(Dimensions.get('window').width - 32);
const IMAGE_HEIGHT = 200;

export function renderCode(node: {children: any}, index: number) {
  const code = node.children.map(it => it.data).join('\n');

  return (
    <SyntaxHighlighter
      key={index}
      PreTag={Text}
      CodeTag={Text}
      style={idea}
    >
      {entities.decodeHTML(code)}
    </SyntaxHighlighter>
  );
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

  const targetAttach = attachments.filter(it => src.indexOf(it.name) !== -1)[0] || {};
  src = targetAttach.url || src;

  const imgStyle = {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'contain'
  };
  const uri = `${src}&w=${IMAGE_WIDTH*2}&h=${IMAGE_HEIGHT*2}`;
  const source = {uri, headers: imageHeaders};

  return (
    <Text onPress={() => onImagePress(src)} key={index}>
      <Image
        source={source}
        style={imgStyle}
      />
      {Platform.OS === 'android' && '\n\n\n\n\n\n'}
    </Text>
  );
}
