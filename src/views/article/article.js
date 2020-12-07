/* @flow */

import React from 'react';
import {View} from 'react-native';

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

  componentDidMount() {
    this.props.loadArticle(this.props.articlePlaceholder.id);
  }

  renderError = (error: CustomError) => {
    return <ErrorMessage error={error}/>;
  }

  renderDetails = (uiTheme: UITheme) => {
    const {article, articlePlaceholder, error, isLoading} = this.props;
    if (error) {
      return this.renderError(error);
    }
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

  renderActivity = (uiTheme: UITheme) => {
    const {article, error} = this.props;
    if (error) {
      return this.renderError(error);
    }
    return (
      <ArticleActivities
        style={styles.articleActivities}
        article={article}
        uiTheme={uiTheme}
      />
    );
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
    ...state.article
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(articleActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
