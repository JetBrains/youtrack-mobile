/* @flow */

import React from 'react';
import {RefreshControl, View, ActivityIndicator, ScrollView, TouchableOpacity, Text} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ArticleActivities from './article__activity';
import ArticleDetails from './article__details';
import ArticleDetailsEdit from './article__details-edit';
import CreateUpdateInfo from '../../components/issue-tabbed/issue-tabbed__created-updated';
import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IssueTabbed from '../../components/issue-tabbed/issue-tabbed';
import PropTypes from 'prop-types';
import Router from '../../components/router/router';
import VisibilityControl from '../../components/visibility/visibility-control';
import {createBreadCrumbs, findArticleNode} from '../../components/articles/articles-tree-helper';
import {getApi} from '../../components/api/api__instance';
import {
  IconBack,
  IconCheck,
  IconClose,
  IconContextActions
} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article.styles';

import type {ArticleNode} from '../../flow/Article';
import type {ArticleState} from './article-reducers';
import type {CustomError} from '../../flow/Error';
import type {HeaderProps} from '../../components/header/header';
import type {IssueProject} from '../../flow/CustomFields';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';
import type {KnowledgeBaseState} from '../knowledge-base/knowledge-base-reducers';
import type {RootState} from '../../reducers/app-reducer';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';
import type {Visibility} from '../../flow/Visibility';

type Props = ArticleState & { articlePlaceholder: Article, storePrevArticle?: boolean } & typeof (articleActions);

const maxBreadcrumbTextLength: number = 24;

//$FlowFixMe
class Article extends IssueTabbed<Props, IssueTabbedState> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  props: Props;
  uiTheme: UITheme;

  componentDidMount() {
    const {articlePlaceholder, storePrevArticle} = this.props;
    if (storePrevArticle) {
      this.props.setPreviousArticle();
    }
    this.loadArticle(articlePlaceholder.id || articlePlaceholder.idReadable, true);
  }

  loadArticle = (articleId: string, reset: boolean) => this.props.loadArticle(articleId, reset);

  refresh = () => {
    this.loadArticle(this.props.article.id, false);
  };

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

  renderBreadCrumbs = () => {
    const {article, articlesList} = this.props;
    const breadCrumbs: Array<Article | IssueProject> = createBreadCrumbs(article, articlesList);

    if (breadCrumbs.length === 0) {
      return null;
    }

    return (
      <View style={styles.breadCrumbs}>
        <ScrollView
          horizontal={true}
          contentContainerStyle={styles.breadCrumbsContent}
        >
          {breadCrumbs.map((it: Article | IssueProject, index: number) => {
            const breadcrumbText: string = it.name || it.summary;
            return (
              <View key={it.id}>
                <View style={styles.commentContent}>
                  {index > 0 && <Text style={styles.breadCrumbsButtonTextSeparator}>/</Text>}
                  <TouchableOpacity
                    style={styles.breadCrumbsButton}
                    onPress={() => Router.backTo(breadCrumbs.length - index)}
                  >
                    <Text style={styles.breadCrumbsButtonText}>
                      {breadcrumbText.substr(0, maxBreadcrumbTextLength)}
                      {breadcrumbText.length > maxBreadcrumbTextLength && '…'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.breadCrumbsSeparator}/>
      </View>
    );
  };

  renderTabBar(uiTheme: UITheme, editMode: boolean = !!this.props.articleDraft) {
    //$FlowFixMe
    return super.renderTabBar(this.uiTheme, editMode);
  }

  renderDetails = (uiTheme: UITheme) => {
    const {article, articlesList, articlePlaceholder, articleDraft, updateArticleDraft, error, isLoading} = this.props;
    if (error) {
      return this.renderError(error);
    }

    const articleData: ?Article = article || articlePlaceholder;
    const isEditMode: boolean = !!articleDraft;
    const articleNode: ?ArticleNode = article && findArticleNode(articlesList, article.project.id, article.id);
    const subArticles: Array<Article> = (articleNode?.children || []).map((it: ArticleNode) => it.data);
    const breadCrumbsElement = article ? this.renderBreadCrumbs() : null;

    return (
      <ScrollView
        testID="articleDetails"
        contentContainerStyle={styles.articleDetails}
        refreshControl={this.renderRefreshControl()}
      >
        {breadCrumbsElement}
        {!!articleData && (
          <>
            <VisibilityControl
              style={breadCrumbsElement ? null : styles.visibility}
              visibility={articleData.visibility}
              onSubmit={(visibility: Visibility) => getApi().articles.updateArticle(articleData.id, {visibility})}
              uiTheme={this.uiTheme}
              getOptions={() => getApi().articles.getVisibilityOptions(articleData.idReadable)}
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
        {isEditMode && (
          <ArticleDetailsEdit
            articleDraft={articleDraft}
            updateArticleDraft={updateArticleDraft}
            uiTheme={this.uiTheme}
          />
        )}
        {!isEditMode && (
          <ArticleDetails
            article={article}
            articlePlaceholder={articlePlaceholder}
            error={error}
            isLoading={isLoading}
            subArticles={subArticles}
            uiTheme={uiTheme}
          />
        )}
      </ScrollView>
    );
  };

  renderActivity = (uiTheme: UITheme) => {
    const {article, error, issuePermissions} = this.props;
    if (error) {
      return this.renderError(error);
    }
    return (
      <ArticleActivities
        article={article}
        issuePermissions={issuePermissions}
        renderRefreshControl={this.renderRefreshControl}
        uiTheme={uiTheme}
      />
    );
  };

  isTabChangeEnabled = () => {
    return !this.props.isProcessing;
  };

  canEditArticle = (): boolean => {
    const {article, issuePermissions} = this.props;
    return issuePermissions.canUpdateArticle(article);
  };

  canDeleteArticle = (): boolean => {
    const {article, issuePermissions} = this.props;
    return issuePermissions.articleCanDeleteArticle(article.project.ringId);
  };

  renderHeader = () => {
    const {
      article,
      articleDraft,
      articlePlaceholder,
      isProcessing,
      publishArticleDraft,
      setDraft,
      showArticleActions
    } = this.props;
    const uiThemeColors: UIThemeColors = this.uiTheme.colors;
    const linkColor: string = uiThemeColors.$link;
    const textSecondaryColor: string = uiThemeColors.$textSecondary;
    const isEditMode: boolean = !!articleDraft;

    const props: HeaderProps = {
      title: (article || articlePlaceholder)?.idReadable,

      leftButton: (
        isEditMode
          ? <IconClose size={21} color={isProcessing ? textSecondaryColor : linkColor}/>
          : <IconBack color={isProcessing ? textSecondaryColor : linkColor}/>
      ),
      onBack: (
        isEditMode
          ? () => setDraft(null)
          : () => !isProcessing && Router.pop()
      ),

      rightButton: (
        isEditMode
          ? (
            isProcessing
              ? <ActivityIndicator color={linkColor}/>
              : <IconCheck size={20} color={linkColor}/>
          )
          : <IconContextActions size={18} color={linkColor}/>
      ),
      onRightButtonClick: (
        isEditMode
          ? publishArticleDraft
          : () => (
            showArticleActions(
              this.context.actionSheet(),
              this.canEditArticle(),
              this.switchToDetailsTab,
              this.canDeleteArticle()
            )
          )
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

const mapStateToProps = (
  state: { article: ArticleState, app: RootState, articles: KnowledgeBaseState },
  ownProps: Props
): ArticleState => {
  return {
    ...state.article,
    articlePlaceholder: ownProps.articlePlaceholder,
    issuePermissions: state.app.issuePermissions,
    articlesList: state.articles.articlesList
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(articleActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
