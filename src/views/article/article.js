/* @flow */

import React from 'react';
import {RefreshControl, View, ActivityIndicator} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ArticleActivities from './article__activities';
import ArticleDetails from './article__details';
import ArticleDetailsEdit from './article__details-edit';
import CreateUpdateInfo from '../../components/issue-tabbed/issue-tabbed__created-updated';
import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IssueTabbed from '../../components/issue-tabbed/issue-tabbed';
import PropTypes from 'prop-types';
import Router from '../../components/router/router';
import {isIOSPlatform} from '../../util/util';
import {
  IconBack,
  IconCheck,
  IconClose,
  IconDrag,
  IconMoreOptions,
} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article.styles';

import type {ArticleState} from './article-reducers';
import type {CustomError} from '../../flow/Error';
import type {HeaderProps} from '../../components/header/header';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';
import type {RootState} from '../../reducers/app-reducer';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';

type Props = ArticleState & { articlePlaceholder: Article } & typeof (articleActions);
type State = IssueTabbedState;

//$FlowFixMe
class Article extends IssueTabbed<Props, State> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  props: Props;
  uiTheme: UITheme;

  componentDidMount() {
    this.loadArticle();
  }

  loadArticle = (reset?: boolean) => this.props.loadArticle(this.props.articlePlaceholder.id, reset);

  refresh = () => this.loadArticle(false);

  renderError = (error: CustomError) => {
    return <ErrorMessage error={error}/>;
  };

  renderRefreshControl = (onRefresh: Function = this.refresh) => {
    return <RefreshControl
      refreshing={false}
      tintColor={this.uiTheme.colors.$link}
      onRefresh={onRefresh}
    />;
  };

  renderDetails = (uiTheme: UITheme) => {
    const {article, articlePlaceholder, articleDraft, updateArticleDraft, error, isLoading} = this.props;
    if (error) {
      return this.renderError(error);
    }

    return (
      <>
        {!!article?.reporter && (
          <CreateUpdateInfo
            style={styles.articleUsers}
            reporter={article.reporter}
            updater={article.updatedBy}
            created={article.created}
            updated={article.updated}
          />
        )}
        {articleDraft && (
          <ArticleDetailsEdit
            articleDraft={articleDraft}
            updateArticleDraft={updateArticleDraft}
            uiTheme={this.uiTheme}
          />
        )}
        {!articleDraft && (
          <ArticleDetails
            article={article || articlePlaceholder}
            error={error}
            isLoading={isLoading}
            renderRefreshControl={this.renderRefreshControl}
            uiTheme={uiTheme}
          />
        )}
      </>
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

  isTabChangeEnabled = () => true;

  canEditArticle = (): boolean => {
    const {issuePermissions} = this.props;
    return !!issuePermissions && issuePermissions.canUpdateArticle(this.props.article);
  };

  renderContextActionsIcon = () => {
    const color: string = this.uiTheme.colors.$link;
    return (
      isIOSPlatform()
        ? <IconMoreOptions size={18} color={color}/>
        : <IconDrag size={18} color={color}/>
    );
  };

  renderHeader = () => {
    const {articlePlaceholder, articleDraft, showArticleActions, publishArticleDraft, isProcessing, setDraft} = this.props;
    const uiThemeColors: UIThemeColors = this.uiTheme.colors;
    const linkColor: string = uiThemeColors.$link;
    const isEditMode: boolean = !!articleDraft;

    const props: HeaderProps = {
      title: articlePlaceholder.idReadable,

      leftButton: (
        isEditMode
          ? <IconClose size={21} color={isProcessing ? uiThemeColors.$textSecondary : linkColor}/>
          : <IconBack color={linkColor}/>
      ),
      onBack: (
        isEditMode
          ? () => setDraft(null)
          : () => Router.pop()
      ),

      rightButton: (
        isEditMode
          ? (
            isProcessing
              ? <ActivityIndicator color={linkColor}/>
              : <IconCheck size={20} color={linkColor}/>
          )
          : this.renderContextActionsIcon()
      ),
      onRightButtonClick: (
        isEditMode
          ? publishArticleDraft
          : () => showArticleActions(this.context.actionSheet(), this.canEditArticle())
      ),
    };

    return <Header {...props} />;
  };

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

const mapStateToProps = (state: { article: ArticleState, app: RootState }, ownProps: Props): ArticleState => {
  return {
    articlePlaceholder: ownProps.article,
    ...state.article,
    issuePermissions: state.app.issuePermissions
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(articleActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
