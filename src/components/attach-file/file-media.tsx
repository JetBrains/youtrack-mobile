import React from 'react';
import {Dimensions, ScaledSize} from 'react-native';

import Video from 'react-native-video';

import {ImageDimensions} from 'types/CustomFields';

const FileMedia = ({
  file,
  size,
}: {
  file: {
    url: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  size?: ImageDimensions;
}) => {
  let dimensions;
  if (size) {
    dimensions = size;
  } else {
    const win: ScaledSize = Dimensions.get('window');
    dimensions = {
      minHeight: Math.min(file?.dimensions?.height || 300, win.height / 1.5),
      minWidth: Math.min(file?.dimensions?.width || 300, win.width),
    };
  }
  return (
    <Video
      style={dimensions}
      controls={true}
      fullscreen={false}
      paused={false}
      rate={0.0}
      resizeMode="contain"
      source={{uri: file?.url}}
    />
  );
};

export default React.memo(FileMedia);
