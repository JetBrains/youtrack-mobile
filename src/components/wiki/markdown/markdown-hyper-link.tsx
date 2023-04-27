import React from 'react';
import {TextStyle} from 'react-native';

import Hyperlink from 'react-native-hyperlink';

import {guid} from 'util/util';

import styles from 'components/wiki/youtrack-wiki.styles';


const MarkdownHyperLink = ({uri, style}: { uri: string; style: TextStyle | TextStyle[]; }): JSX.Element | null => {
  return <Hyperlink
    key={guid()}
    linkDefault={true}
    linkStyle={[...(Array.isArray(style) ? style : [style]), styles.link]}
    linkText={uri}
  />;
};


export default React.memo(MarkdownHyperLink);
