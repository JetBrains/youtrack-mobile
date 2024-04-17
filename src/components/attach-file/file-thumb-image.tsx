import React from 'react';
import {Image} from 'react-native';

import calculateAspectRatio from 'components/aspect-ratio/aspect-ratio';

import {ImageDimensions} from 'types/CustomFields';
import {NormalizedAttachment} from 'types/Attachment';

const FilePreviewImage = ({file, size = null}: {file: NormalizedAttachment, size?: ImageDimensions | null}) => {
  const dimensions: ImageDimensions | null = file ? calculateAspectRatio(file.dimensions) : null;
  return (
    <Image
      style={size}
      source={{
        uri: file?.url,
        ...dimensions,
      }}
    />
  );
};

export default React.memo(FilePreviewImage);
