import React from 'react';
import {
  RefreshControl,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ArticleActivities from './article__activity';
import ArticleBreadCrumbs from './article__breadcrumbs';
import ArticleCreate from '../article-create/article-create';
import ArticleDetails from './article__details';
import Badge from 'components/badge/badge';
import CreateUpdateInfo from 'components/issue-tabbed/issue-tabbed__created-updated';
import ErrorMessage from 'components/error-message/error-message';
import Header from 'components/header/header';
import IssueTabbed from 'components/issue-tabbed/issue-tabbed';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import VisibilityControl from 'components/visibility/visibility-control';
import {addListenerGoOnline} from 'components/network/network-events';
import {ANALYTICS_ARTICLE_PAGE} from 'components/analytics/analytics-ids';
import {createArticleList} from '../knowledge-base/knowledge-base-actions';
import {findArticleNode} from 'components/articles/articles-tree-helper';
import {getApi} from 'components/api/api__instance';
import {getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconContextActions} from 'components/icon/icon';
import {logEvent} from 'components/log/log-helper';
import {routeMap} from 'app-routes';
import {ThemeContext} from 'components/theme/theme-context';
import {visibilityArticleDefaultText} from 'components/visibility/visibility-strings';

import styles from './article.styles';

import type {Article as ArticleEntity, ArticleNode} from 'types/Article';
import type {ArticleState} from './article-reducers';
import type {Attachment} from 'types/CustomFields';
import type {CustomError} from 'types/Error';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type {HeaderProps} from 'components/header/header';
import type {IssueTabbedState} from 'components/issue-tabbed/issue-tabbed';
import type {KnowledgeBaseState} from '../knowledge-base/knowledge-base-reducers';
import type {RootState} from 'reducers/app-reducer';
import type {Theme, UITheme, UIThemeColors} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
import type {Visibility} from 'types/Visibility';
import {TabRoute} from 'types/Issue';

type Props = ArticleState & {
  articlePlaceholder: ArticleEntity;
  storePrevArticle?: boolean;
  updateArticlesList: () => (...args: any[]) => any;
  lastVisitedArticle: Article | null | undefined;
  commentId?: string;
} & typeof articleActions;
type State = IssueTabbedState & {
  modalChildren: any;
}; //@ts-expect-error

class Article extends IssueTabbed<Props, State> {
  static contextTypes = {
    actionSheet: Function,
  };
  props: Props;
  uiTheme: UITheme;
  unsubscribe: (...args: any[]) => any;
  articleDetailsList: Record<string, any>;
  goOnlineSubscription: EventSubscription;
  componentWillUnmount = () => {
    this.unsubscribe && this.unsubscribe();

    if (!this.props.storePrevArticle) {
      this.props.clearArticle();
    }

    this.goOnlineSubscription.remove();
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.articlePlaceholder !== this.props.articlePlaceholder) {
      this.loadArticle(
        this.props.articlePlaceholder.id ||
          this.props.articlePlaceholder.idReadable,
      );
    }

    if (prevProps.navigateToActivity !== this.props.navigateToActivity) {
      if (this.props.navigateToActivity || this.props.commentId) {
        this.switchToActivityTab();
      } else {
        this.switchToDetailsTab();
      }
    }
  }

  componentDidMount() {
    logEvent({
      message: 'Navigate to article',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.loadArticle(currentArticle.id, false);
    });

    if (this.props.storePrevArticle) {
      this.props.setPreviousArticle();
    }

    const currentArticle: Article = this.getArticle();
    const canLoadArticle: boolean =
      currentArticle && (currentArticle.id || currentArticle.idReadable);

    if (canLoadArticle) {
      this.switchToDetailsTab();
      this.props.loadArticleFromCache(currentArticle);
      this.loadArticle(currentArticle.id || currentArticle.idReadable, false);
      this.unsubscribe = Router.setOnDispatchCallback(
        (routeName: string, prevRouteName: string) => {
          if (
            routeName === routeMap.ArticleSingle &&
            prevRouteName === routeMap.ArticleCreate
          ) {
            this.loadArticle(currentArticle.id, false);
          }
        },
      );
    }

    if (canLoadArticle && this.props.navigateToActivity) {
      this.switchToActivityTab();
    } else if (!canLoadArticle && !this.props.navigateToActivity) {
      return Router.KnowledgeBase();
    }
  }

  getMainTabText(): string {
    return i18n('Content');
  }

  getRouteBadge(
    route: TabRoute,
  ): React.ReactElement<React.ComponentProps<typeof View>, typeof View> | null {
    return super.getRouteBadge(route.title === this.tabRoutes[1].title, this.props?.article?.comments?.length);
  }


  loadArticle = (articleId: string, reset: boolean) =>
    this.props.loadArticle(articleId, reset);
  getArticle = (): Article => {
    const {articlePlaceholder, lastVisitedArticle} = this.props;
    return articlePlaceholder || lastVisitedArticle;
  };
  refresh = () => {
    const article: Article | null | undefined = this.getArticle();
    const articleId: string | null | undefined = article?.id;

    if (articleId) {
      this.loadArticle(articleId, false);
    }
  };
  renderError = (error: CustomError) => {
    return <ErrorMessage error={error} />;
  };
  renderRefreshControl = (
    onRefresh: (...args: any[]) => any = this.refresh,
  ) => {
    return (
      <RefreshControl
        testID="refresh-control"
        accessibilityLabel="refresh-control"
        accessible={true}
        refreshing={false}
        tintColor={this.uiTheme.colors.$link}
        onRefresh={onRefresh}
      />
    );
  };
  renderBreadCrumbs = ({
    style,
    withSeparator,
    excludeProject,
    withLast,
  }: {
    style?: ViewStyleProp;
    withSeparator?: boolean;
    excludeProject?: boolean;
    withLast?: boolean;
  } = {}) => {
    const {article, articlesList} = this.props;
    return (
      <ArticleBreadCrumbs
        styles={style}
        article={article}
        articlesList={articlesList}
        excludeProject={excludeProject}
        withSeparator={withSeparator}
        withLast={withLast}
        isSplitView={this.state.isSplitView}
      />
    );
  };
  toggleModalChildren = (modalChildren: any = null) => {
    this.setState({
      modalChildren,
    });
  };
  createArticleDetails = (
    articleData: ArticleEntity,
    scrollData: Record<string, any>,
  ) => {
    const {
      article,
      articlesList,
      error,
      isLoading,
      deleteAttachment,
      issuePermissions,
      createSubArticleDraft,
      onCheckboxUpdate,
    } = this.props;
    const breadCrumbsElement = article ? this.renderBreadCrumbs() : null;
    const articleNode: ArticleNode | null | undefined =
      articleData?.project &&
      findArticleNode(articlesList, articleData.project.id as string, articleData?.id);
    let visibility: Visibility | null | undefined = articleData?.visibility;

    if (articleData?.visibility) {
      visibility = {
        ...articleNode?.data?.visibility,
        ...articleData?.visibility,
      };
    }

    return (
      <View style={styles.articleDetails}>
        {breadCrumbsElement}
        {!!articleData && (
          <>
            <View style={styles.articleDetailsHeader}>
              {issuePermissions.canUpdateArticle(article) && (
                <VisibilityControl
                  style={breadCrumbsElement ? null : styles.visibility}
                  visibility={visibility}
                  onSubmit={(visibility: Visibility) =>
                    getApi().articles.updateArticle(articleData.id, {
                      visibility,
                    })
                  }
                  uiTheme={this.uiTheme}
                  getOptions={() =>
                    getApi().articles.getVisibilityOptions(
                      articleData.idReadable,
                    )
                  }
                  visibilityDefaultLabel={visibilityArticleDefaultText()}
                />
              )}
              {articleData?.hasUnpublishedChanges && (
                <Badge valid={true} text={i18n('in revision')} />
              )}
            </View>

            <CreateUpdateInfo
              analyticId={ANALYTICS_ARTICLE_PAGE}
              reporter={articleData.reporter}
              updater={articleData.updatedBy}
              created={articleData.created}
              updated={articleData.updated}
            />
          </>
        )}

        <ArticleDetails
          scrollData={scrollData}
          article={articleData}
          onRemoveAttach={
            issuePermissions.canUpdateArticle(article)
              ? (attachment: Attachment) => deleteAttachment(attachment.id)
              : undefined
          }
          onCreateArticle={
            issuePermissions.canUpdateArticle(article)
              ? async () => {
                  const draft = await createSubArticleDraft();

                  if (!draft) {
                    return;
                  }

                  const createParams = {
                    isNew: true,
                    articleDraft: draft,
                    breadCrumbs: (
                      <View style={styles.breadCrumbsItem}>
                        {this.renderBreadCrumbs({
                          style: styles.breadCrumbsCompact,
                          withSeparator: true,
                          withLast: true,
                        })}
                      </View>
                    ),
                  };

                  if (this.state.isSplitView) {
                    this.toggleModalChildren(
                      <ArticleCreate
                        {...createParams}
                        onHide={this.toggleModalChildren}
                        isSplitView={this.state.isSplitView}
                      />,
                    );
                  } else {
                    Router.ArticleCreate(createParams);
                  }
                }
              : undefined
          }
          error={error}
          isLoading={isLoading}
          uiTheme={this.uiTheme}
          onCheckboxUpdate={(
            checked: boolean,
            position: number,
            articleContent: string,
          ) => {
            onCheckboxUpdate(articleContent);
          }}
          isSplitView={this.state.isSplitView}
        />
      </View>
    );
  };
  renderDetails = () => {
    const {article, articlePlaceholder, error} = this.props;

    if (error) {
      return this.renderError(error);
    }

    const articleData: ArticleEntity = article || articlePlaceholder;
    const scrollData: {
      loadMore: (...args: any[]) => any;
    } = {
      loadMore: () => null,
    };
    return (
      <FlatList
        testID="articleDetails"
        data={[0]}
        ref={(instance: Record<string, any> | null | undefined) =>
          instance && (this.articleDetailsList = instance)
        }
        removeClippedSubviews={false}
        refreshControl={this.renderRefreshControl(this.refresh)}
        keyExtractor={() => 'article-details'}
        renderItem={() => this.createArticleDetails(articleData, scrollData)}
        onEndReached={() => scrollData.loadMore && scrollData.loadMore()}
        onEndReachedThreshold={0.8}
      />
    );
  };
  renderActivity = (uiTheme: UITheme) => {
    const {
      article,
      error,
      issuePermissions,
      navigateToActivity,
      commentId,
    } = this.props;

    if (error) {
      return this.renderError(error);
    }

    return (
      <ArticleActivities
        article={article}
        issuePermissions={issuePermissions}
        renderRefreshControl={this.renderRefreshControl}
        uiTheme={uiTheme}
        highlight={{
          activityId: navigateToActivity,
          commentId,
        }}
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
    } = this.props;
    const articleData: Partial<ArticleEntity> = article || articlePlaceholder;

    if (!articleData) {
      return null;
    }

    const uiThemeColors: UIThemeColors = this.uiTheme.colors;
    const linkColor: string = uiThemeColors.$link;
    const textSecondaryColor: string = uiThemeColors.$textSecondary;
    const isArticleLoaded: boolean = !!article;
    const props: HeaderProps = {
      leftButton: this.state.isSplitView ? null : (
        <IconBack color={isProcessing ? textSecondaryColor : linkColor} />
      ),
      onBack: () => {
        if (!this.state.isSplitView) {
          if (isProcessing) {
            return;
          }

          const hasParent: boolean = Router.pop();
          !hasParent && Router.KnowledgeBase();
        }
      },
      rightButton:
        isArticleLoaded && !isProcessing ? (
          <IconContextActions size={18} color={linkColor} />
        ) : null,
      onRightButtonClick: () =>
        showArticleActions(
          this.context.actionSheet(),
          this.canEditArticle(),
          this.canDeleteArticle(),
          () =>
            this.renderBreadCrumbs({
              styles: styles.breadCrumbsCompact,
              excludeProject: true,
            }),
          issuePermissions.canStar(),
          articleData.hasStar,
          this.state.isSplitView,
        ),
    };
    return (
      <Header {...props}>
        <TouchableOpacity
          onPress={() => {
            this.articleDetailsList &&
              this.articleDetailsList.scrollToOffset({
                animated: true,
                offset: 0,
              });
          }}
        >
          <Text style={styles.articlesHeaderText}>
            {articleData.idReadable}
          </Text>
        </TouchableOpacity>
      </Header>
    );
  };

  render() {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          return (
            <View testID="article" style={styles.container}>
              {this.renderHeader()}

              {this.renderTabs(this.uiTheme)}

              {this.state.isSplitView && (
                <ModalPortal onHide={() => this.toggleModalChildren()}>
                  {this.state.modalChildren}
                </ModalPortal>
              )}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (
  state: {
    article: ArticleState;
    app: RootState;
    articles: KnowledgeBaseState;
  },
  ownProps: Props,
): ArticleState => {
  return {
    ...state.article,
    articlePlaceholder: ownProps.articlePlaceholder,
    issuePermissions: state.app.issuePermissions,
    lastVisitedArticle: state.app?.user?.profiles?.articles?.lastVisitedArticle,
    articlesList: createArticleList(
      state.articles.articles || getStorageState().articles || [],
    ),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(articleActions, dispatch),
    deleteAttachment: (attachmentId: string) =>
      dispatch(articleActions.deleteAttachment(attachmentId)),
    onCheckboxUpdate: (articleContent: string) =>
      dispatch(articleActions.onCheckboxUpdate(articleContent)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);
