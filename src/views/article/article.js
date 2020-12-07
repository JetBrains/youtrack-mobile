/* @flow */

import React from 'react';
import {RefreshControl, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articleActions from './arcticle-action';
import ArticleActivities from './article__activities';
import ArticleDetails from './article__details';
import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IssueTabbed from '../../components/issue-tabbed/issue-tabbed';
import Router from '../../components/router/router';
import {IconBack} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article.styles';

import type {ArticleState} from './article-reducers';
import type {CustomError} from '../../flow/Error';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';
import type {Theme, UITheme} from '../../flow/Theme';

type Props = ArticleState & { articlePlaceholder: Article } & typeof (articleActions);
type State = IssueTabbedState;

//$FlowFixMe
class Article extends IssueTabbed<Props, State> {
  props: Props;
  uiTheme: UITheme;

  componentDidMount() {
    this.loadArticle();
  }

  loadArticle = (reset?: boolean) => this.props.loadArticle(this.props.articlePlaceholder.id, reset);

  refresh = () => this.loadArticle(false);

  renderError = (error: CustomError) => {
    return <ErrorMessage error={error}/>;
  }

  renderRefreshControl = (onRefresh: Function = this.refresh) => {
    return <RefreshControl
      refreshing={false}
      tintColor={this.uiTheme.colors.$link}
      onRefresh={onRefresh}
    />;
  }

  renderDetails = (uiTheme: UITheme) => {
    const {article, articlePlaceholder, error, isLoading} = this.props;
    if (error) {
      return this.renderError(error);
    }
    return (
      <ArticleDetails
        article={article || articlePlaceholder}
        error={error}
        isLoading={isLoading}
        renderRefreshControl={this.renderRefreshControl}
        uiTheme={uiTheme}
      />
    );
  };

  renderActivity = (uiTheme: UITheme) => {
    const {article, error} = this.props;
    if (error) {
      return this.renderError(error);
    }
    return (
      <ArticleActivities
        article={article}
        renderRefreshControl={this.renderRefreshControl}
        uiTheme={uiTheme}
      />
    );
  };

  isTabChangeEnabled = () => {
    return true;
  };

  renderHeader() {
    return (
      <Header
        title={this.props.articlePlaceholder.idReadable}
        leftButton={<IconBack color={this.uiTheme.colors.$link}/>}
        onBack={() => Router.pop()}
      />
    );
  }

  render() {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;

          return (
            <View
              testID="article"
              style={styles.container}
            >
              {this.renderHeader()}

              {this.renderTabs(this.uiTheme)}
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
    ...state.article
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(articleActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
