/* @flow */
import {Linking, StyleSheet, View, Text, WebView, ActivityIndicator} from 'react-native';
import {UNIT} from '../../components/variables/variables';
import React from 'react';
import Header from '../../components/header/header';

type Props = {
  name: string,
  url: string
}

function renderLoading() {
  return <ActivityIndicator style={styles.loadingIndicator} size="large"/>;
}

export function AttachmentPreview(props: Props) {

  return (
    <View style={styles.container}>
      <Header leftButton={<Text>Close</Text>}
              rightButton={<Text>Browser</Text>}
              onRightButtonClick={() => Linking.openURL(props.url)}>
      </Header>
      <WebView
        source={{uri: props.url}}
        renderLoading={renderLoading}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  loadingIndicator: {
    padding: UNIT * 2
  }
});

export default AttachmentPreview;
