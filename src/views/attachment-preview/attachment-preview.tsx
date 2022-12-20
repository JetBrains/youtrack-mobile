import React from 'react';
import {View, Text, ActivityIndicator, Linking} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {WebView} from 'react-native-webview';
import Header from 'components/header/header';
import {i18n} from 'components/i18n/i18n';
import {IconClose} from 'components/icon/icon';
import {UNIT} from 'components/variables/variables';
import type {Node} from 'react';
type Props = {
  name: string;
  url: string;
  headers: Record<string, any> | null | undefined;
};

function renderLoading() {
  return <ActivityIndicator style={styles.loadingIndicator} size="large" />;
}

export function AttachmentPreview(props: Props): Node {
  const {url, name, headers} = props;
  return (
    <View style={styles.container}>
      <Header
        leftButton={<IconClose size={21} color={styles.link.color} />}
        rightButton={<Text style={styles.link}>{i18n('Browser')}</Text>}
        onRightButtonClick={() => {
          Linking.openURL(url);
        }}
      >
        <Text style={styles.headerText} numberOfLines={1}>
          {name}
        </Text>
      </Header>
      <WebView
        source={{
          uri: url,
          headers,
        }}
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