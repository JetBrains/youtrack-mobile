/* @flow */

import type {Node} from 'react';
import React from 'react';

import {Text, Image, Dimensions} from 'react-native';

import {hasMimeType} from '../mime-type/mime-type';
import calculateAspectRatio from 'components/aspect-ratio/aspect-ratio';
import {isAndroidPlatform, isIOSPlatform} from 'util/util';

import {UNIT} from '../variables/variables';

import type {Attachment, ImageDimensions} from 'flow/CustomFields';
import EStyleSheet from 'react-native-extended-stylesheet';

const DIMENSION_WIDTH = Dimensions.get('window').width;
const IMAGE_WIDTH = Math.floor(DIMENSION_WIDTH - UNIT * 4);
const IMAGE_HEIGHT = 200;
const isAndroid: boolean = isAndroidPlatform();

type RenderImageOptions = {
  node: Object,
  index: number,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  onImagePress: string => any
}

function getUrlParams(url: string): Object {
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

function findTargetAttach(src: string = '', attachments: Array<Attachment> = []): ?Attachment {
  let attachId: ?string;
  let targetAttach: ?Attachment = null;

  if (!src) {
    return targetAttach;
  }

  const targetURL: ?string = getUrlParams(src).file;

  if (targetURL) {
    attachId = targetURL;
    targetAttach = !!attachId && attachments.find(attach => getUrlParams(attach.url).file === attachId);
  } else {
    attachId = src.split('?')[0].split('/').pop();
    targetAttach = !!attachId && attachments.find((attach: Attachment) => attach.id === attachId);
  }
  return targetAttach;
}

export function renderImage({node, index, attachments, imageHeaders, onImagePress}: RenderImageOptions): void | Node {
  const targetAttach: Attachment = findTargetAttach(node?.attribs?.src, attachments);

  if (targetAttach?.url && !hasMimeType.svg(targetAttach)) {
    //TODO(investigation): for some reason SVG is not rendered here
    const source = Object.assign({uri: targetAttach.url, headers: imageHeaders}, targetAttach);

    const defaultDimensions = {width: IMAGE_WIDTH, height: IMAGE_HEIGHT};
    const dimensions: ImageDimensions = isIOSPlatform() ? calculateAspectRatio(
      targetAttach.imageDimensions ||
      defaultDimensions
    ) : defaultDimensions;

    return (
      <Text
        onPress={() => onImagePress(source)}
        key={`wiki-image-${index}`}
      >
        <Image
          source={source}
          style={{
            ...dimensions,
            resizeMode: 'contain',
          }}
        />
        {isAndroid && '\n\n\n\n\n\n'}
      </Text>
    );
  }
}

export function renderTableRow(node: Object, index: number, defaultRenderer: Function): Node {
  const isBold = node.parent.name === 'thead';
  return (
    <Text key={index} style={[isBold && {
      fontWeight: 'bold',
      backgroundColor: EStyleSheet.value('$textSecondary'),
    }]}>
      {''}
      {defaultRenderer(node.children, node.parent)}
      {'\n'}
    </Text>
  );
}

export function renderTableCell(node: Object, index: number, defaultRenderer: Function): Node {
  return (
    <Text numberOfLines={1} key={index} style={{
      width: 40,
      flex: 1,
    }}>
      {' | '}
      {defaultRenderer(node.children, node.parent)}
      {!node.next && ' |'}
    </Text>
  );
}

export function renderTable(node: Object, index: number, defaultRenderer: Function): Node {
  return (
    <Text key={index} style={{backgroundColor: EStyleSheet.value('$boxBackground')}}>
      {defaultRenderer(node.children, node.parent)}
    </Text>
  );
}
