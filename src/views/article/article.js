/* @flow */

import React from 'react';
import {View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articleActions from './arcticle-action';
import ArticleDetails from './article__details';
import Header from '../../components/header/header';
import IssueTabbed from '../../components/issue-tabbed/issue-tabbed';
import Router from '../../components/router/router';
import {IconBack} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article.styles';

import type {ArticleState} from './article-reducers';
import type {Theme, UITheme} from '../../flow/Theme';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';

type Props = ArticleState & { articlePlaceholder: Article } & typeof (articleActions);
type State = IssueTabbedState;

//$FlowFixMe
class Article extends IssueTabbed<Props, State> {
  props: Props;

  componentDidMount() {
    this.props.loadArticle(this.props.articlePlaceholder.id);
  }

  renderDetails = (uiTheme: UITheme) => {
    const {article, articlePlaceholder, error, isLoading} = this.props;
    return (
      <ArticleDetails
        style={styles.content}
        article={article || articlePlaceholder}
        error={error}
        isLoading={isLoading}
        uiTheme={uiTheme}
      />
    );
  };

  renderActivity = () => {
    return null;
  };

  isTabChangeEnabled = () => {
    return true;
  };

  renderHeader(uiTheme: UITheme) {
    return (
      <Header
        title={this.props.articlePlaceholder.idReadable}
        leftButton={<IconBack color={uiTheme.colors.$link}/>}
        onBack={() => Router.pop()}
      />
    );
  }

  render() {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiTheme: UITheme = theme.uiTheme;
          return (
            <View
              testID="article"
              style={styles.container}
            >
              {this.renderHeader(uiTheme)}

              {this.renderTabs(uiTheme)}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state: { article: ArticleState }, ownProps: Props): ArticleState => {
  return {
    articlePlaceholder: ownProps.article,
    ...state.article,
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(articleActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
