import React from 'react';
import {ScaledSize, useWindowDimensions} from 'react-native';

import HTMLRenderer from 'react-native-render-html';

import {baseMarkdownStyles} from '../markdown-view-styles';
import {MAIN_FONT_SIZE, UNIT} from 'components/common-styles';
import {ThemeContext} from 'components/theme/theme-context';

import type {Theme} from 'types/Theme';


const MarkdownHTML = (props: { html: string }) => {
  const theme: Theme = React.useContext(ThemeContext);
  const dims: ScaledSize = useWindowDimensions();

  const width: number | undefined = dims?.width ? dims.width - UNIT * 4 : undefined;
  return (
    <HTMLRenderer
      renderersProps={{
        img: {
          enableExperimentalPercentWidth: true,
        },
      }}
      contentWidth={width}
      defaultTextProps={{
        selectable: true,
      }}
      enableCSSInlineProcessing={true}
      ignoredDomTags={['script', 'meta']}
      source={{
        html: props.html,
      }}
      tagsStyles={{
        ...baseMarkdownStyles,
        body: {
          color: theme.uiTheme.colors.$text,
          fontSize: MAIN_FONT_SIZE,
        },
        img: {
          maxWidth: width,
        },
      }}
    />
  );
};


export default React.memo(MarkdownHTML);
