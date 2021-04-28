/* @flow */

import type {Node} from 'React';
import React from 'react';
import {View, Text, WebView, ActivityIndicator, Linking} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import Header from '../../components/header/header';
import safariView from '../../components/safari-view/safari-view';
import {IconClose} from '../../components/icon/icon';
import {isAndroidPlatform} from '../../util/util';
import {UNIT} from '../../components/variables/variables';

type Props = {
  name: string,
  url: string,
  headers: ?Object
}

const isAndroid: boolean = isAndroidPlatform();

function renderLoading() {
  return <ActivityIndicator style={styles.loadingIndicator} size="large"/>;
}

export function AttachmentPreview(props: Props): Node {
  const {url, name, headers} = props;

  return (
    <View style={styles.container}>
      <Header
        leftButton={<IconClose size={21} color={styles.link.color}/>}
        rightButton={<Text style={styles.link}>Browser</Text>}
        onRightButtonClick={() => {
          isAndroid ? Linking.openURL(url) : safariView.show({url});
        }}
      >
        <Text style={styles.headerText} numberOfLines={1}>{name}</Text>
      </Header>
      <WebView
        source={{uri: url, headers}}
        renderLoading={renderLoading}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={true}
      />
    </View>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  headerText: {
    color: '$text',
  },
  link: {
    color: '$link',
  },
  loadingIndicator: {
    padding: UNIT * 2,
  },
});

export default AttachmentPreview;
