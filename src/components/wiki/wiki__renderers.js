/* @flow */
import React from 'react';
import {Text, Image} from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import entities from 'entities';

const IMAGE_SIZE = 264;

export function renderCode(node: {children: any}, index: number) {
  const code = node.children.map(it => it.data).join('\n');
  return (
    <SyntaxHighlighter key={index} PreTag={Text} CodeTag={Text}>{entities.decodeHTML(code)}</SyntaxHighlighter>
  );
}

type RenderImageOptions = {
  node: Object,
  index: number,
  attachments: Array<Object>,
  imageHeaders: ?Object,
  onImagePress: String => any
}

export function renderImage({node, index, attachments, imageHeaders, onImagePress}: RenderImageOptions) {
  let src = node.attribs.src;

  const targetAttach = attachments.filter(it => src.indexOf(it.name) !== -1)[0] || {};
  src = targetAttach.url || src;

  const imgStyle = {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    resizeMode: 'contain'
  };
  const uri = `${src}&w=${IMAGE_SIZE*2}&h=${IMAGE_SIZE*2}`;
  const source = {uri, headers: imageHeaders};

  return (
    <Text onPress={() => onImagePress(node.url)} key={index}>
      <Image
        source={source}
        style={imgStyle}
      />
    </Text>
  );
}
