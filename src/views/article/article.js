/* @flow */

import React from 'react';
import {RefreshControl, View, ActivityIndicator, ScrollView} from 'react-native';

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
import {getApi} from '../../components/api/api__instance';
import {isIOSPlatform} from '../../util/util';
import {
  IconBack,
  IconCheck,
  IconClose,
  IconDrag,
  IconMoreOptions,
} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';
import VisibilityControl from '../../components/visibility/visibility-control';

import styles from './article.styles';

import type {ArticleState} from './article-reducers';
import type {CustomError} from '../../flow/Error';
import type {HeaderProps} from '../../components/header/header';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';
import type {RootState} from '../../reducers/app-reducer';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';
import type {Visibility} from '../../flow/Visibility';

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

    const articleData: ?Article = article || articlePlaceholder;
    const isEditMode: boolean = !articleDraft;

    return (
      <ScrollView
        testID="articleDetails"
        contentContainerStyle={styles.articleDetails}
        refreshControl={this.renderRefreshControl()}
      >

        {!!articleData && (
          <>
            <VisibilityControl
              entityId={articleData.idReadable}
              visibility={articleData.visibility}
              onSubmit={(visibility: Visibility) => getApi().articles.updateArticle(articleData.id, {visibility})}
              uiTheme={this.uiTheme}
              getOptions={getApi().articles.getVisibilityOptions}
              visibilityDefaultLabel="Visible to article readers"
            />
            <CreateUpdateInfo
              reporter={articleData.reporter}
              updater={articleData.updatedBy}
              created={articleData.created}
              updated={articleData.updated}
            />
          </>
        )}
        {!isEditMode && (
          <ArticleDetailsEdit
            articleDraft={articleDraft}
            updateArticleDraft={updateArticleDraft}
            uiTheme={this.uiTheme}
          />
        )}
        {isEditMode && (
          <ArticleDetails
            article={articleData}
            error={error}
            isLoading={isLoading}
            uiTheme={uiTheme}
          />
        )}
      </ScrollView>
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
