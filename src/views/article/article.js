/* @flow */

import React from 'react';
import {RefreshControl, View, ScrollView} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ArticleActivities from './article__activity';
import ArticleBreadCrumbs from './article__breadcrumbs';
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
import {ANALYTICS_ARTICLE_PAGE} from '../../components/analytics/analytics-ids';
import {createArticleList} from '../knowledge-base/knowledge-base-actions';
import {findArticleNode} from '../../components/articles/articles-tree-helper';
import {getApi} from '../../components/api/api__instance';
import {getStorageState} from '../../components/storage/storage';
import {IconBack, IconContextActions} from '../../components/icon/icon';
import {logEvent} from '../../components/log/log-helper';
import {routeMap} from '../../app-routes';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article.styles';

import type {Article as ArticleEntity, ArticleNode} from '../../flow/Article';
import type {ArticleState} from './article-reducers';
import type {CustomError} from '../../flow/Error';
import type {HeaderProps} from '../../components/header/header';
import type {Attachment} from '../../flow/CustomFields';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';
import type {KnowledgeBaseState} from '../knowledge-base/knowledge-base-reducers';
import type {RootState} from '../../reducers/app-reducer';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';
import type {Visibility} from '../../flow/Visibility';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = ArticleState & {
  articlePlaceholder: ArticleEntity,
  storePrevArticle?: boolean,
  updateArticlesList: () => Function,
  root?: boolean,
  lastVisitedArticle: ?Article
} & typeof articleActions;

//$FlowFixMe
class Article extends IssueTabbed<Props, IssueTabbedState> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  props: Props;
  uiTheme: UITheme;
  unsubscribe: Function;

  componentWillUnmount = () => this.unsubscribe()

  componentDidMount() {
    logEvent({message: 'Navigate to article', analyticsId: ANALYTICS_ARTICLE_PAGE});

    const {storePrevArticle} = this.props;
    if (storePrevArticle) {
      this.props.setPreviousArticle();
    }

    const currentArticle: Article = this.getArticle();
    if (!currentArticle || !currentArticle.id || !currentArticle.idReadable) {
      return Router.KnowledgeBase();
    }

    this.loadArticle(currentArticle.id || currentArticle.idReadable, true);

    this.unsubscribe = Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (routeName === routeMap.ArticleSingle && prevRouteName === routeMap.ArticleCreate) {
        this.loadArticle(currentArticle.id, false);
      }
    });
  }

  loadArticle = (articleId: string, reset: boolean) => this.props.loadArticle(articleId, reset);

  getArticle = (): Article => {
    const {articlePlaceholder, lastVisitedArticle} = this.props;
    return articlePlaceholder || lastVisitedArticle;
  };

  refresh = () => {
    const article: ?Article = this.getArticle();
    const articleId: ?string = article?.id;
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

  renderBreadCrumbs = ({style, withSeparator, excludeProject, withLast, root}: {
    style?: ViewStyleProp,
    withSeparator?: boolean,
    excludeProject?: boolean,
    withLast?: boolean,
    root?: boolean
  }) => {
    const {article, articlesList} = this.props;
    return (
      <ArticleBreadCrumbs
        styles={style}
        article={article}
        articlesList={articlesList}
        excludeProject={excludeProject}
        withSeparator={withSeparator}
        withLast={withLast}
        root={root}
      />
    );
  };

  renderDetails = (uiTheme: UITheme) => {
    const {
      article,
      articlesList,
      articlePlaceholder,
      error,
      isLoading,
      deleteAttachment,
      issuePermissions,
      createSubArticle,
      root
    } = this.props;

    if (error) {
      return this.renderError(error);
    }

    const articleData: ArticleEntity = article || articlePlaceholder;
    const breadCrumbsElement = article ? this.renderBreadCrumbs({root}) : null;

    const articleNode: ?ArticleNode = articleData?.project && findArticleNode(
      articlesList, articleData.project.id, articleData?.id
    );
    let visibility: ?Visibility = articleData?.visibility;
    if (articleData?.visibility) {
      visibility = {...articleNode?.data?.visibility, ...articleData?.visibility};
    }

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
                visibility={visibility}
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
          article={article || articlePlaceholder}
          onRemoveAttach={
            issuePermissions.canUpdateArticle(article)
              ? (attachment: Attachment) => deleteAttachment(attachment.id)
              : undefined
          }
          onCreateArticle={
            issuePermissions.canUpdateArticle(article)
              ? () => createSubArticle(() =>
                <View style={styles.breadCrumbsItem}>
                  {this.renderBreadCrumbs({
                    style: styles.breadCrumbsCompact,
                    withSeparator: true,
                    withLast: true
                  })}
                </View>
              )
              : undefined
          }
          error={error}
          isLoading={isLoading}
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
      issuePermissions,
      root
    } = this.props;
    const articleData: $Shape<ArticleEntity> = article || articlePlaceholder;
    if (!articleData) {
      return null;
    }

    const uiThemeColors: UIThemeColors = this.uiTheme.colors;
    const linkColor: string = uiThemeColors.$link;
    const textSecondaryColor: string = uiThemeColors.$textSecondary;
    const isArticleLoaded: boolean = !!article;

    const props: HeaderProps = {
      title: articleData.idReadable,
      leftButton: <IconBack color={isProcessing ? textSecondaryColor : linkColor}/>,
      onBack: () => {
        if (isProcessing) {
          return;
        }
        if (root) {
          Router.KnowledgeBase();
        } else {
          const hasParent: boolean = Router.pop();
          !hasParent && Router.KnowledgeBase();
        }
      },
      rightButton: isArticleLoaded && !isProcessing ? <IconContextActions size={18} color={linkColor}/> : null,
      onRightButtonClick: () => showArticleActions(
        this.context.actionSheet(),
        this.canEditArticle(),
        this.canDeleteArticle(),
        () => this.renderBreadCrumbs({
          styles: styles.breadCrumbsCompact,
          excludeProject: true
        })
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
    lastVisitedArticle: state.app?.user?.profiles?.articles?.lastVisitedArticle,
    articlesList: createArticleList(state.articles.articles || getStorageState().articles || [])
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(articleActions, dispatch),
    deleteAttachment: (attachmentId: string) => dispatch(articleActions.deleteAttachment(attachmentId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
