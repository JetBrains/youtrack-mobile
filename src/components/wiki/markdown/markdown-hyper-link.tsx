import React from 'react';
import {Linking, Text, TextStyle} from 'react-native';

import {guid} from 'util/util';

import styles from 'components/wiki/youtrack-wiki.styles';


const MarkdownHyperLink = ({
  children,
  uri,
  style,
}: {
  children?: any;
  uri: string;
  style: TextStyle | TextStyle[];
}): JSX.Element => {
  return (
    <Text
      selectable={true}
      key={guid()}
      style={[...(Array.isArray(style) ? style : [style]), styles.link]}
      onPress={() => {
        if (uri?.trim?.()) {
          Linking.openURL(uri);
        }
      }}
    >
      {children || uri}
    </Text>
  );
};


export default React.memo(MarkdownHyperLink);
