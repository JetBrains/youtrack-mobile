/* @flow */
import {StyleSheet, View, Text, WebView, ActivityIndicator} from 'react-native';
import {UNIT, COLOR_FONT_ON_BLACK} from '../../components/variables/variables';
import React from 'react';
import Header from '../../components/header/header';
import safariView from '../../components/safari-view/safari-view';

type Props = {
  name: string,
  url: string
}

function renderLoading() {
  return <ActivityIndicator style={styles.loadingIndicator} size="large"/>;
}

export function AttachmentPreview(props: Props) {
  const {url, name} = props;

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
        source={{uri: url}}
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
  headerText: {
    color: COLOR_FONT_ON_BLACK,
    fontSize: 17
  },
  loadingIndicator: {
    padding: UNIT * 2
  }
});

export default AttachmentPreview;
