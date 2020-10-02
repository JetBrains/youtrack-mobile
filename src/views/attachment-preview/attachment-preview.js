/* @flow */

import {View, Text, WebView, ActivityIndicator} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../components/variables/variables';
import React from 'react';
import Header from '../../components/header/header';
import safariView from '../../components/safari-view/safari-view';

type Props = {
  name: string,
  url: string,
  headers: ?Object
}

function renderLoading() {
  return <ActivityIndicator style={styles.loadingIndicator} size="large"/>;
}

export function AttachmentPreview(props: Props) {
  const {url, name, headers} = props;

  return (
    <View style={styles.container}>
      <Header leftButton={<Text>Close</Text>}
        rightButton={<Text>Browser</Text>}
        onRightButtonClick={() => {
          safariView.show({url});
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
    backgroundColor: '#FFF'
  },
  headerText: {
    color: '$text',
    fontSize: 17
  },
  loadingIndicator: {
    padding: UNIT * 2
  }
});

export default AttachmentPreview;
