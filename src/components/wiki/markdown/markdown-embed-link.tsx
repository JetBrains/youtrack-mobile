import React from 'react';

import YoutubeVideo from 'components/wiki/markdown/markdown-video';
import MarkdownImage from 'components/wiki/markdown/markdown-image';

import {ImageDimensions} from 'types/CustomFields';


function isGitHubBadge(url: string = ''): boolean {
  return url.indexOf('badgen.net/badge') !== -1;
}

function getYouTubeId(url: string): string | undefined {
  const arr: string[] = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return arr[2] !== undefined ? arr[2].split(/[^\w-]/i)[0] : arr[0];
}

const youTubeURL: RegExp = /^(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/i;


export default function MarkdownEmbedLink({uri, alt, imageDimensions}: {
  uri: string, alt: string | undefined, imageDimensions: ImageDimensions | undefined
}): JSX.Element | null {

  if (isGitHubBadge(uri)) {
    return null;
  }

  const youtubeVideoId: string | null | undefined = getYouTubeId(uri);

  if (youTubeURL.test(uri) && youtubeVideoId) {
    return <YoutubeVideo videoId={youtubeVideoId}/>;
  }

  return <MarkdownImage uri={uri} alt={alt} imageDimensions={imageDimensions}/>;
}
