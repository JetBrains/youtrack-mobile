import React, {useContext} from 'react';
import Markdown from 'react-native-markdown-display';
import MarkdownItInstance from './markdown-instance';
import markdownStyles from './markdown-view-styles';
import {ThemeContext} from '../theme/theme-context';
import type {MarkdownASTNode} from 'types/Markdown';
import type {Theme} from 'types/Theme';
import type {TextStyleProp} from 'types/Internal';
type Props = {
  ast: MarkdownASTNode[];
  rules: Record<string, any>;
  textStyle?: TextStyleProp;
};

const MarkdownAST = (props: Props) => {
  const {ast, rules, textStyle} = props;
  const theme: Theme = useContext(ThemeContext);
  return (
    <Markdown
      style={markdownStyles(theme?.uiTheme, textStyle)}
      markdownit={MarkdownItInstance}
      rules={rules}
    >
      {ast}
    </Markdown>
  );
};

export default React.memo<Props>(
  MarkdownAST,
  (prevProps: Props, nextProps: Props) => prevProps.ast === nextProps.ast,
) as React$AbstractComponent<Props, unknown>;
