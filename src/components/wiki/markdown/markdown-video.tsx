import React from 'react';
import {ActivityIndicator} from 'react-native';

import {WebView} from 'react-native-webview';

import {guid} from 'util/util';

import styles from './markdown.styles';


export default function YoutubeVideo({videoId}: {videoId: string}): JSX.Element {
  return (
    <WebView
      allowsFullscreenVideo={false}
      allowsInlineMediaPlayback={true}
      androidLayerType="hardware"
      javaScriptEnabled={true}
      key={guid()}
      mediaPlaybackRequiresUserAction={true}
      mixedContentMode="always"
      renderLoading={() => <ActivityIndicator color={styles.link.color}/>}
      source={{
        uri: `https://youtube.com/embed/${videoId}?playsinline=1&controls:1`,
      }}
      style={styles.video}
    />
  );
}
