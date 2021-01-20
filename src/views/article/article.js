/* @flow */

import React from 'react';
import {RefreshControl, View, ScrollView, TouchableOpacity, Text} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ArticleActivities from './article__activity';
import ArticleDetails from './article__details';
import Badge from '../../components/badge/badge';
import CreateUpdateInfo from '../../components/issue-tabbed/issue-tabbed__created-updated';
import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IssueTabbed from '../../components/issue-tabbed/issue-tabbed';
import PropTypes from 'prop-types';
import Router from '../../components/router/router';
import Star from '../../components/star/star';
import VisibilityControl from '../../components/visibility/visibility-control';
import {createBreadCrumbs, findArticleNode} from '../../components/articles/articles-tree-helper';
import {getApi} from '../../components/api/api__instance';
import {IconBack, IconContextActions} from '../../components/icon/icon';
import {routeMap} from '../../app-routes';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article.styles';

import type {Article as ArticleEntity, ArticleNode} from '../../flow/Article';
import type {ArticleState} from './article-reducers';
import type {CustomError} from '../../flow/Error';
import type {HeaderProps} from '../../components/header/header';
import type {Attachment, IssueProject} from '../../flow/CustomFields';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';
import type {KnowledgeBaseState} from '../knowledge-base/knowledge-base-reducers';
import type {RootState} from '../../reducers/app-reducer';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';
import type {Visibility} from '../../flow/Visibility';

type Props = ArticleState & { articlePlaceholder: ArticleEntity, storePrevArticle?: boolean } & typeof (articleActions);

const maxBreadcrumbTextLength: number = 24;

//$FlowFixMe
class Article extends IssueTabbed<Props, IssueTabbedState> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  props: Props;
  uiTheme: UITheme;

  constructor(props: Props) {
    //$FlowFixMe
    super(props);

    Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (routeName === routeMap.Article && prevRouteName === routeMap.ArticleCreate) {
        this.refresh();
      }
    });
  }

  componentDidMount() {
    const {articlePlaceholder, storePrevArticle} = this.props;
    if (storePrevArticle) {
      this.props.setPreviousArticle();
    }
    this.loadArticle(articlePlaceholder.id || articlePlaceholder.idReadable, true);
  }

  loadArticle = (articleId: string, reset: boolean) => this.props.loadArticle(articleId, reset);

  refresh = () => {
    const {articlePlaceholder, article} = this.props;
    const articleId: ?string = article?.id || articlePlaceholder?.id;
    if (articleId) {
      this.loadArticle(articleId, false);
    }
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
    const breadCrumbs: Array<ArticleEntity | IssueProject> = createBreadCrumbs(article, articlesList);

    if (breadCrumbs.length === 0) {
      return null;
    }

    return (
      <View style={styles.breadCrumbs}>
        <ScrollView
          horizontal={true}
          contentContainerStyle={styles.breadCrumbsContent}
        >
          {breadCrumbs.map((it: ArticleEntity | IssueProject, index: number) => {
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

  renderDetails = (uiTheme: UITheme) => {
    const {article, articlesList, articlePlaceholder, error, isLoading, deleteAttachment, issuePermissions} = this.props;
    if (error) {
      return this.renderError(error);
    }

    const articleData: ?ArticleEntity = article || articlePlaceholder;
    const articleNode: ?ArticleNode = article && findArticleNode(articlesList, article.project.id, article.id);
    const subArticles: Array<ArticleEntity> = (articleNode?.children || []).map((it: ArticleNode) => it.data);
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
            <View style={styles.articleDetailsHeader}>
              <VisibilityControl
                style={breadCrumbsElement ? null : styles.visibility}
                visibility={articleData.visibility}
                onSubmit={(visibility: Visibility) => getApi().articles.updateArticle(articleData.id, {visibility})}
                uiTheme={this.uiTheme}
                getOptions={() => getApi().articles.getVisibilityOptions(articleData.idReadable)}
                visibilityDefaultLabel="Visible to article readers"
              />
              {articleData?.hasUnpublishedChanges && <Badge valid={true} text='in revision'/>}
            </View>

            <CreateUpdateInfo
              reporter={articleData.reporter}
              updater={articleData.updatedBy}
              created={articleData.created}
              updated={articleData.updated}
            />
          </>
        )}

        <ArticleDetails
          article={article}
          articlePlaceholder={articlePlaceholder}
          onRemoveAttach={
            issuePermissions.canUpdateArticle(article)
              ? (attachment: Attachment) => deleteAttachment(attachment.id)
              : undefined
          }
          error={error}
          isLoading={isLoading}
          subArticles={subArticles}
          uiTheme={uiTheme}
        />
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

  isTabChangeEnabled = () => !this.props.isProcessing;

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
      articlePlaceholder,
      isProcessing,
      showArticleActions,
      issuePermissions
    } = this.props;
    const uiThemeColors: UIThemeColors = this.uiTheme.colors;
    const linkColor: string = uiThemeColors.$link;
    const textSecondaryColor: string = uiThemeColors.$textSecondary;
    const articleData: $Shape<ArticleEntity> = article || articlePlaceholder;
    const isArticleLoaded: boolean = !!article;

    const props: HeaderProps = {
      title: articleData.idReadable,
      leftButton: <IconBack color={isProcessing ? textSecondaryColor : linkColor}/>,
      onBack: () => !isProcessing && Router.pop(),
      rightButton: isArticleLoaded ? <IconContextActions size={18} color={linkColor}/> : null,
      onRightButtonClick: () => showArticleActions(
        this.context.actionSheet(),
        this.canEditArticle(),
        this.canDeleteArticle()
      ),
      extraButton: (
        isArticleLoaded ? <Star
          canStar={issuePermissions.canStar()}
          hasStar={articleData.hasStar}
          onStarToggle={this.props.toggleFavorite}
          uiTheme={this.uiTheme}
        /> : null
      )
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
  return {
    ...bindActionCreators(articleActions, dispatch),
    deleteAttachment: (attachmentId: string) => dispatch(articleActions.deleteAttachment(attachmentId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
