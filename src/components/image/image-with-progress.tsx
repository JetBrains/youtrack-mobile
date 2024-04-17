import React from 'react';
import {ActivityIndicator} from 'react-native';

import FastImage from 'react-native-fast-image';

import {createImageProgress} from 'react-native-image-progress';

import styles from './image.styles';

const Image = createImageProgress(FastImage);

const ImageWithProgress = (props: any) => {
  return (
    <Image
      {...Object.assign(
        {
          renderIndicator: () => <ActivityIndicator color={styles.link.color} />,
        },
        props
      )}
    />
  );
};

export default ImageWithProgress;
