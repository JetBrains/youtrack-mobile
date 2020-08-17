/* @flow */
import React from 'react';

import {Image, Text, View} from 'react-native';

import Router from '../router/router';
import {hasMimeType} from '../mime-type/mime-type';
import {getApi} from '../api/api__instance';
import renderCode from './code-renderer';
import calculateAspectRatio from '../aspect-ratio/aspect-ratio';

import styles from './wiki.styles';

import type {Attachment, ImageDimensions, IssueProject} from '../../flow/CustomFields';
import type {Folder} from '../../flow/User';


function getMarkdownRules(attachments: Array<Attachment> = [], projects: Array<IssueProject> = []) {
  const imageHeaders = getApi().auth.getAuthorizationHeaders();
  const projectIds = (projects).map((it: Folder) => it?.shortName).join('|');
  const issueId = new RegExp(`\\b(?:${projectIds})\\b-\\d+$`);

  return {

    blockquote: (node: Object, children: Object) => (
      <View key={node.key} style={styles.blockQuote}>
        {children}
      </View>
    ),

    image: (node: Object) => {
      const {src, alt} = node.attributes;
      const targetAttach: ?Attachment = attachments.find(it => it.name === src);

      if (!targetAttach || !targetAttach.url || hasMimeType.svg(targetAttach)) {
        return null;
      }

      const source = Object.assign({uri: targetAttach.url, headers: imageHeaders}, targetAttach);
      const dimensions: ImageDimensions = calculateAspectRatio(
        targetAttach.imageDimensions ||
        {width: 250, height: 300}
      );

      const imageProps: Object = {
        key: node.key,
        style: {
          ...dimensions
        },
        source
      };

      if (alt) {
        imageProps.accessible = true;
        imageProps.accessibilityLabel = alt;
      }

      return <Image {...imageProps} />;
    },

    code_inline: (node: Object, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      return (
        <Text key={node.key} style={[inheritedStyles, styles.inlineCode]}>
          {` ${node.content} `}
        </Text>
      );
    },

    fence: (node: Object) => {
      let content = node.content;

      if (
        typeof node.content === 'string' &&
        node.content.charAt(node.content.length - 1) === '\n'
      ) {
        content = node.content.substring(0, node.content.length - 1);
      }

      const language = ['exception', 'stacktrace'].includes(node.sourceInfo) ? null : node.sourceInfo;
      return (
        <Text key={node.key}>
          <Text style={styles.language}>{language}</Text>
          {renderCode({content}, node.key, node.sourceInfo, language)}
        </Text>
      );
    },

    text: (node: Object, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      if (issueId.test(node.content)) {
        return (
          <Text
            key={node.key}
            onPress={() => Router.SingleIssue({issueId: node.content})}
            style={[inheritedStyles, style.text, styles.link]}>
            {node.content}
          </Text>
        );
      }

      return (
        <Text
          key={node.key}
          style={[inheritedStyles, style.text]}
        >
          {node.content}
        </Text>
      );
    }
  };
}

export default getMarkdownRules;
