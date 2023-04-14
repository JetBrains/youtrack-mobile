import React from 'react';

import calculateAspectRatio from 'components/aspect-ratio/aspect-ratio';
import ImageWithProgress from 'components/image/image-with-progress';
import {getApi} from 'components/api/api__instance';
import {guid} from 'util/util';

import {ImageDimensions} from 'types/CustomFields';


export default function MarkdownImage({uri, alt, imageDimensions}: {
  uri: string, alt: string | undefined, imageDimensions: ImageDimensions | undefined
}): JSX.Element | null {
  const imageProps: Record<string, any> = {
    key: guid(),
    style: calculateAspectRatio(imageDimensions || {
      width: 250,
      height: 300,
    }),
    source: {
      uri,
      headers: getApi().auth.getAuthorizationHeaders(),
    },
  };

  if (alt) {
    imageProps.accessible = true;
    imageProps.accessibilityLabel = alt;
  }

  return <ImageWithProgress {...imageProps} />;
}
