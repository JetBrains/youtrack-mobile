import React, {useContext} from 'react';
import {ScaledSize, useWindowDimensions} from 'react-native';
import HTMLRenderer from 'react-native-render-html';
import {baseMarkdownStyles} from '../markdown-view-styles';
import {MAIN_FONT_SIZE} from 'components/common-styles/typography';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables';
import type {Theme} from 'types/Theme';
type Props = {
  html: string;
};

const HTML = (props: Props) => {
  const theme: Theme = useContext(ThemeContext);
  const dims: ScaledSize = useWindowDimensions();
  const width: number | null | undefined = dims?.width
    ? dims.width - UNIT * 4
    : null;
  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true,
    },
  };
  return (
    <HTMLRenderer
      renderersProps={renderersProps}
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

export default React.memo(HTML);
