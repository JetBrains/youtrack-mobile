import React, {Component} from 'react';
import {
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as knowledgeBaseActions from './knowledge-base-actions';
import Article from 'views/article/article';
import ArticleCreate from 'views/article-create/article-create';
import ArticleWithChildren from 'components/articles/article-item-with-children';
import ErrorMessage from 'components/error-message/error-message';
import KnowledgeBaseDrafts from './knowledge-base__drafts';
import KnowledgeBaseSearchPanel from './knowledge-base__search';
import ModalPortal from 'components/modal-view/modal-portal';
import NothingSelectedIconWithText from 'components/icon/nothing-selected-icon-with-text';
import Router from 'components/router/router';
import SelectSectioned from 'components/select/select-sectioned';
import Star from 'components/star/star';
import usage from 'components/usage/usage';
import {addListenerGoOnline} from 'components/network/network-events';
import {ANALYTICS_ARTICLES_PAGE} from 'components/analytics/analytics-ids';
import {HIT_SLOP} from 'components/common-styles';
import {getStorageState} from 'components/storage/storage';
import {
  IconAngleDown,
  IconAngleRight,
  IconBack,
  IconClose,
  IconMoreOptions,
} from 'components/icon/icon';
import {i18n} from 'components/i18n/i18n';
import {isSplitView} from 'components/responsive/responsive-helper';
import {
  IconNoProjectFound,
  IconNothingFound,
} from 'components/icon/icon-pictogram';
import {routeMap} from 'app-routes';
import {SkeletonIssues} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables';

import styles from './knowledge-base.styles';

import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {AppState} from 'reducers';
import type {
  Article as ArticleSingle,
  ArticlesList,
  ArticlesListItem,
  ArticleNode,
  ArticleProject,
  ArticleNodeList,
  ArticleDraft,
} from 'types/Article';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type {KnowledgeBaseActions} from './knowledge-base-actions';
import type {KnowledgeBaseState} from './knowledge-base-reducers';
import type {ISelectProps} from 'components/select/select';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {Theme, UITheme} from 'types/Theme';

type Props = KnowledgeBaseActions &
  KnowledgeBaseState & {
    issuePermissions: IssuePermissions;
    project?: ArticleProject;
    preventReload?: boolean;
    lastVisitedArticle?: ArticleSingle;
  };

interface State {
  focusedArticle: ArticleSingle | null | undefined;
  isHeaderPinned: boolean;
  isSelectVisible: boolean;
  isSplitView: boolean;
  modalChildren: any;
}

const ERROR_MESSAGE_DATA: Record<string, any> = {
  noFavoriteProjects: {
    title: i18n('No favorites projects found'),
    description: i18n('Add project to favorites'),
  },
  noArticlesFound: {
    title: i18n('No articles found'),
  },
};

export class KnowledgeBase extends Component<Props, State> {
  static contextTypes: any = {
    actionSheet: Function,
  };
  listRef: any;
  uiTheme!: UITheme;
  unsubscribe: Function | undefined;
  unsubscribeOnDimensionsChange: EventSubscription | undefined;
  goOnlineSubscription: EventSubscription | undefined;

  constructor(props: Props) {
    super(props);
    const splitView: boolean = isSplitView();
    this.state = {
      isHeaderPinned: false,
      isSelectVisible: false,
      isSplitView: splitView,
      focusedArticle: splitView ? props.lastVisitedArticle : null,
      modalChildren: null,
    };
    usage.trackScreenView(ANALYTICS_ARTICLES_PAGE);
    this.toggleModal = this.toggleModal.bind(this);
    this.onArticleCreate = this.onArticleCreate.bind(this);
  }

  componentWillUnmount() {
    this.unsubscribeOnDimensionsChange?.remove?.();
    this.unsubscribe?.();
    this.goOnlineSubscription?.remove?.();
  }

  async componentDidMount() {
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener('change', this.setSplitView);
    this.unsubscribe = Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (
        !this.props.preventReload &&
        routeName === routeMap.KnowledgeBase &&
        (prevRouteName === routeMap.Article ||
          prevRouteName === routeMap.ArticleCreate ||
          prevRouteName === routeMap.Page)
      ) {
        this.loadArticlesList(false);
      }
    });
    this.props.clearUserLastVisitedArticle();
    this.props.loadCachedArticleList();

    if (!this.props.preventReload) {
      await this.loadArticlesList();
    }

    if (this.props.project) {
      this.scrollToProject(this.props.project);
    }

    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.loadArticlesList(false);
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.lastVisitedArticle !== this.props.lastVisitedArticle) {
      this.updateFocusedArticle(this.props.lastVisitedArticle);
    }
  }

  setSplitView = (): void => {
    this.setState({
      isSplitView: isSplitView(),
    });
  };

  loadArticlesList = async (reset?: boolean) => this.props.loadArticleList(reset);

  scrollToProject = (project: ArticleProject) => {
    const {articlesList} = this.props;

    if (project && articlesList) {
      const index: number = articlesList.findIndex((listItem: ArticlesListItem) => listItem.title?.id === project.id);

      if (index > 0) {
        setTimeout(
          () =>
            this.listRef &&
            this.listRef.scrollToLocation({
              animated: true,
              itemIndex: 0,
              sectionIndex: index,
            }),
          0
        );
      }
    }
  };

  updateFocusedArticle = (focusedArticle?: ArticleSingle | null) => {
    this.setState({focusedArticle});
  };

  renderProject = ({section}: {section: ArticlesListItem}) => {
    const project: ArticleProject | null | undefined = section.title;
    if (!project) {
      return null;
    }
    const {expandingProjectId} = this.props;
    const isProjectExpanding: boolean = expandingProjectId === project.id;
    const isCollapsed: boolean = project?.articles?.collapsed;
    const Icon = isCollapsed ? IconAngleRight : IconAngleDown;
    const hasHoArticles: boolean = section.title?.articles?.collapsed === false && section.data?.length === 0;
    const hasSearchQuery: boolean = !!this.getSearchQuery();
    return (
      <>
        <View style={styles.item}>
          <TouchableOpacity
            testID="test:id/project-title-item"
            accessibilityLabel="project-title-item"
            accessible={true}
            disabled={hasSearchQuery}
            style={styles.itemProject}
            onPress={() => this.props.toggleProjectVisibility(section)}
          >
            <View style={[styles.itemProjectIcon, isCollapsed && styles.itemProjectIconCollapsed]}>
              <Icon size={24} color={styles.itemProjectIcon.color} />
            </View>
            <Text numberOfLines={2} style={styles.projectTitleText}>
              {project.name}
            </Text>
          </TouchableOpacity>
          {!hasSearchQuery && !!project?.id && (
            <Star
              style={styles.itemStar}
              disabled={isProjectExpanding}
              size={19}
              hasStar={project.pinned}
              canStar={true}
              onStarToggle={async () => {
                const hasPinnedProjects: boolean = await this.props.toggleProjectFavorite(section);
                if (!hasPinnedProjects) {
                  this.updateFocusedArticle(null);
                }
              }}
            />
          )}
        </View>
        {this.renderSeparator()}
        {(hasHoArticles || isProjectExpanding) && (
          <View>
            <View style={[styles.itemArticle, styles.itemNoArticle]}>
              {isProjectExpanding && <ActivityIndicator color={styles.link.color} />}
              {hasHoArticles && <Text style={styles.itemNoArticleText}>{i18n('No articles')}</Text>}
            </View>
            {this.renderSeparator()}
          </View>
        )}
      </>
    );
  };
  renderArticle = ({item}: {item: ArticleNode}) => (
    <ArticleWithChildren
      style={styles.itemArticle}
      article={item.data}
      onArticlePress={(article: ArticleSingle) => {
        if (this.state.isSplitView) {
          Router.KnowledgeBase({
            lastVisitedArticle: article,
            preventReload: true,
          });
        } else {
          Router.Article({
            articlePlaceholder: article,
          });
        }
      }}
      onShowSubArticles={(article: ArticleSingle) => this.renderSubArticlesPage(article)}
    />
  );

  renderSubArticlesPage = async (article: ArticleSingle) => {
    const childrenData: ArticleNodeList = await this.props.getArticleChildren(article.id);
    const title = this.renderHeader({
      leftButton: (
        <TouchableOpacity onPress={() => (this.state.isSplitView ? this.toggleModal(null) : Router.pop())}>
          {this.state.isSplitView ? <IconClose color={styles.link.color} /> : <IconBack color={styles.link.color} />}
        </TouchableOpacity>
      ),
      title: article.summary,
      customTitleComponent: (
        <TouchableOpacity
          onPress={() =>
            Router.Article({
              articlePlaceholder: article,
              store: true,
              storeRouteName: routeMap.ArticleSingle,
            })
          }
        >
          <Text numberOfLines={2} style={styles.projectTitleText}>
            {article.summary}
          </Text>
        </TouchableOpacity>
      ),
    });
    const tree: React.ReactNode = this.renderArticlesList(
      [
        {
          title: null,
          data: childrenData,
        },
      ],
      true
    );

    if (this.state.isSplitView) {
      this.toggleModal([title, tree]);
    } else {
      Router.Page({
        children: (
          <>
            {title}
            <View style={styles.itemChild}>{tree}</View>
          </>
        ),
      });
    }
  };

  renderHeader = ({
    title,
    customTitleComponent,
    leftButton,
    rightButton,
  }: {
    title: string;
    customTitleComponent?: React.ReactNode;
    leftButton?: React.ReactNode;
    rightButton?: React.ReactNode;
  }) => {
    return (
      <View
        key="articlesHeader"
        style={[styles.header, this.state.isHeaderPinned || customTitleComponent ? styles.headerShadow : null]}
      >
        {leftButton && <View style={[styles.headerButton, styles.headerLeftButton]}>{leftButton}</View>}
        <View style={styles.headerTitle}>
          {customTitleComponent ? (
            customTitleComponent
          ) : (
            <Text numberOfLines={5} style={styles.headerTitleText}>
              {title}
            </Text>
          )}
        </View>
        {rightButton && <View style={[styles.headerButton, styles.headerRightButton]}>{rightButton}</View>}
      </View>
    );
  };

  renderSeparator() {
    return <View style={styles.separator}>{SelectSectioned.renderSeparator()}</View>;
  }

  onScroll = ({nativeEvent}: Record<string, any>) => {
    this.setState({
      isHeaderPinned: nativeEvent.contentOffset.y >= UNIT,
    });
  };
  renderRefreshControl = () => {
    return (
      <RefreshControl
        testID="refresh-control"
        accessibilityLabel="refresh-control"
        accessible={true}
        refreshing={false}
        tintColor={styles.link.color}
        onRefresh={this.loadArticlesList}
      />
    );
  };

  getListItemKey = (item: ArticleNode, index: number) => item?.data?.id || `${index}`;

  setListRef = (listRef: any) => {
    if (listRef) {
      this.listRef = listRef;
    }
  };

  renderArticlesList = (articlesList: ArticlesList, hideSearchPanel: boolean = false) => {
    const {isLoading} = this.props;
    return (
      <SectionList
        testID="articles"
        ref={this.setListRef}
        sections={articlesList}
        scrollEventThrottle={10}
        onScroll={this.onScroll}
        refreshControl={this.renderRefreshControl()}
        keyExtractor={this.getListItemKey}
        getItemLayout={SelectSectioned.getItemLayout}
        renderItem={this.renderArticle}
        renderSectionHeader={this.renderProject}
        ItemSeparatorComponent={this.renderSeparator}
        stickySectionHeadersEnabled={true}
        ListHeaderComponent={
          hideSearchPanel ? null : (
            <>
              {this.renderSearchPanel()}
              {this.renderActionsBar()}
            </>
          )
        }
        ListFooterComponent={() =>
          !isLoading && !hideSearchPanel ? (
            <View style={styles.listFooter}>
              <TouchableOpacity
                testID="test:id/manage-favorite-projects"
                accessibilityLabel="manage-favorite-projects"
                accessible={true}
                hitSlop={HIT_SLOP}
                onPress={this.openProjectSelect}
              >
                <Text style={styles.manageFavoriteProjectsLink}>{i18n('Manage Favorite Projects')}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={() =>
          !isLoading ? (
            <ErrorMessage
              errorMessageData={{
                ...ERROR_MESSAGE_DATA.noArticlesFound,
                icon: () => <IconNothingFound style={styles.noArticlesErrorIcon} />,
              }}
            />
          ) : null
        }
      />
    );
  };

  getSearchQuery = (): string | null => knowledgeBaseActions.getArticlesQuery();

  renderSearchPanel = () => (
    <KnowledgeBaseSearchPanel
      query={this.getSearchQuery()}
      onSearch={(query: string) => {
        this.props.filterArticles(query);
      }}
    />
  );

  getVisibleProjects() {
    return getStorageState().projects || [];
  }

  renderActionsBar = () => {
    const {isLoading, articlesList, issuePermissions} = this.props;
    const list: ArticlesList = articlesList || [];
    const hasSearchQuery: boolean = !!this.getSearchQuery();

    const canCreateArticle = this.getVisibleProjects().some(p => issuePermissions.articleCanCreateArticle(p.ringId));
    const isToggleButtonEnabled: boolean =
      !isLoading &&
      !hasSearchQuery &&
      list.length > 0 &&
      list.some((it: ArticlesListItem) => !it.title?.articles?.collapsed);
    return (
      <View style={styles.actionBar}>
        <TouchableOpacity
          testID="test:id/collapse-all"
          accessibilityLabel="collapse-all"
          accessible={true}
          disabled={!isToggleButtonEnabled || hasSearchQuery}
          hitSlop={HIT_SLOP}
          onPress={() => this.props.toggleAllProjects()}
        >
          {!hasSearchQuery && <Text style={styles.actionBarButtonText}>{i18n('Collapse all')}</Text>}
        </TouchableOpacity>
        {canCreateArticle &&
          <TouchableOpacity
            testID="test:id/drafts"
            accessible={true}
            disabled={isLoading}
            hitSlop={HIT_SLOP}
            style={styles.actionBarButton}
            onPress={() => {
              if (this.state.isSplitView) {
                this.toggleModal(
                  <KnowledgeBaseDrafts
                    backIcon={<IconClose color={styles.link.color} />}
                    onBack={() => this.toggleModal()}
                    onArticleCreate={this.onArticleCreate}
                  />
                );
              } else {
                Router.Page({children: <KnowledgeBaseDrafts onArticleCreate={this.onArticleCreate} />});
              }
            }}
          >
            <Text style={styles.actionBarButtonText}>{i18n('Drafts')}</Text>
            <IconAngleRight size={20} color={styles.actionBarButtonText.color} />
          </TouchableOpacity>
        }
      </View>
    );
  };

  closeProjectSelect = () => this.setState({isSelectVisible: false});

  openProjectSelect = () => this.setState({isSelectVisible: true});

  renderProjectSelect = () => {
    const {updateProjectsFavorites, issuePermissions} = this.props;
    const projects = this.getVisibleProjects().filter((p) => {
      return issuePermissions.articleCanReadArticle(p.ringId);
    }) as ArticleProject[];
    const prevPinnedProjects: ArticleProject[] = projects.filter(it => it.pinned);
    const selectProps: ISelectProps = {
      placeholder: i18n('Filter projects'),
      multi: true,
      header: () => (
        <Text style={styles.manageFavoriteProjectsNote}>
          {i18n('To view articles in the knowledge base for a specific project, mark it as a favorite')}
        </Text>
      ),
      dataSource: (q: string = '') => {
        const filteredProjects = q
          ? projects.filter(it => {
              const value = q.toLowerCase();
              return it.name?.toLowerCase().indexOf(value) !== -1 || it.shortName?.toLowerCase().indexOf(value) !== -1;
            })
          : projects;
        //TODO: remove it if `Favorite` string is not needed
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const favorites = {title: i18n('Favorites')};
        return Promise.resolve([
          {
            title: i18n('Projects'),
            data: filteredProjects,
          },
        ]);
      },
      selectedItems: prevPinnedProjects,
      getTitle: (it: ArticleProject) => it.name,
      onCancel: this.closeProjectSelect,
      onChangeSelection: () => null,
      onSelect: async (selectedProjects: ArticleProject[] | null | undefined) => {
        const pinnedProjects = (selectedProjects || [])
          .map(it => (it.pinned ? null : {...it, pinned: true}))
          .filter(Boolean);
        const unpinnedProjects: ArticleProject[] = prevPinnedProjects
          .filter(it => !(selectedProjects || []).includes(it))
          .map(it => ({...it, pinned: false}));
        this.closeProjectSelect();
        await updateProjectsFavorites(pinnedProjects, unpinnedProjects, selectedProjects?.length === 0);

        if ((selectedProjects || []).length === 0) {
          this.props.setNoFavoriteProjects();
          this.updateFocusedArticle(null);
          this.props.clearUserLastVisitedArticle();
        } else {
          this.loadArticlesList(false);
        }
      },
    };
    return <SelectSectioned {...selectProps} />;
  };

  renderNoFavouriteProjects = () => {
    return (
      <View style={styles.noProjects}>
        <IconNoProjectFound style={styles.noProjectsIcon} />
        <Text style={styles.noProjectsMessage}>
          {i18n(`Here you'll see a list of articles from your favorite projects`)}
        </Text>
        <TouchableOpacity style={styles.noProjectsButton} hitSlop={HIT_SLOP} onPress={this.openProjectSelect}>
          <Text style={styles.noProjectsButtonText}>{i18n('Find favorite projects')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  toggleModal(modalChildren: any = null) {
    this.setState({
      modalChildren,
    });
  }

  onArticleCreate(articleDraft: ArticleDraft | null, isNew: boolean = true) {
    if (this.state.isSplitView) {
      this.toggleModal(
        <ArticleCreate
          isNew={isNew}
          isSplitView={this.state.isSplitView}
          onHide={this.toggleModal}
          articleDraft={articleDraft}
        />
      );
    } else {
      Router.ArticleCreate({
        articleDraft,
        isNew,
        onHide: () => Router.pop(true),
      });
    }
  }

  renderArticleList = () => {
    const {isLoading, articlesList, error, showContextActions, issuePermissions} = this.props;
    return (
      <>
        {this.renderHeader({
          title: i18n('Knowledge Base'),
          rightButton: (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={{padding: 7, marginRight: -7}}
              onPress={() => {
                showContextActions(
                  this.context.actionSheet(),
                  issuePermissions.articleCanCreateArticle(),
                  this.openProjectSelect,
                  this.onArticleCreate
                );
              }}
            >
              <IconMoreOptions color={styles.link.color} />
            </TouchableOpacity>
          ),
        })}
        <View style={styles.content}>
          {error && !error.noFavoriteProjects && <ErrorMessage testID="articleError" error={error} />}

          {error && error.noFavoriteProjects && this.renderNoFavouriteProjects()}

          {!error && !articlesList && isLoading && <SkeletonIssues />}

          {!error && articlesList && this.renderArticlesList(articlesList)}
        </View>
      </>
    );
  };

  renderFocusedArticle = (): React.ReactNode => {
    const {focusedArticle} = this.state;

    if (!this.props?.articlesList || this.props.articlesList.length === 0) {
      return null;
    }

    return focusedArticle ? (
      <View style={styles.content}>
        <Article articlePlaceholder={focusedArticle} navigateToActivity={this.props.navigateToActivity} />
      </View>
    ) : (
      <NothingSelectedIconWithText text={i18n('Select an article from the list')} />
    );
  };

  renderSplitView = () => {
    return (
      <View style={styles.splitViewContainer}>
        <View style={styles.splitViewSide}>{this.renderArticleList()}</View>
        <View style={styles.splitViewMain}>{this.renderFocusedArticle()}</View>
      </View>
    );
  };

  render() {
    const {isSplitView} = this.state;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          return (
            <View style={[styles.container, isSplitView ? styles.splitViewContainer : null]} testID="articles">
              {isSplitView && this.renderSplitView()}
              {!isSplitView && this.renderArticleList()}

              {this.state.isSelectVisible && this.renderProjectSelect()}

              {isSplitView && <ModalPortal onHide={() => this.toggleModal()}>{this.state.modalChildren}</ModalPortal>}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    ...state.app,
    ...state.articles,
    issuePermissions: state.app.issuePermissions,
  };
};

const mapDispatchToProps = (dispatch: ReduxThunkDispatch) => {
  return {...bindActionCreators(knowledgeBaseActions, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowledgeBase);
