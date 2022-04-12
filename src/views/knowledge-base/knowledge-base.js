/* @flow */

import React, {Component} from 'react';
import {RefreshControl, SectionList, Text, TouchableOpacity, View, ActivityIndicator, Dimensions} from 'react-native';

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
import Router from 'components/router/router';
import SelectSectioned from 'components/select/select-sectioned';
import Star from 'components/star/star';
import usage from 'components/usage/usage';
import {addListenerGoOnline} from '../../components/network/network-events';
import {ANALYTICS_ARTICLES_PAGE} from 'components/analytics/analytics-ids';
import {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventSubscription';
import {HIT_SLOP} from 'components/common-styles/button';
import {getGroupedByFieldNameAlphabetically} from 'components/search/sorting';
import {getStorageState} from 'components/storage/storage';
import {IconAngleDown, IconAngleRight, IconBack, IconClose, IconContextActions} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {
  ICON_PICTOGRAM_DEFAULT_SIZE,
  IconNoProjectFound,
  IconNothingFound,
  IconNothingSelected,
} from 'components/icon/icon-pictogram';
import {routeMap} from '../../app-routes';
import {SkeletonIssues} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables/variables';


import styles from './knowledge-base.styles';

import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {AppState} from '../../reducers';
import type {
  Article as ArticleSingle,
  ArticlesList,
  ArticlesListItem,
  ArticleNode,
  ArticleProject,
  ArticleNodeList,
  ArticleDraft,
} from 'flow/Article';
import type {KnowledgeBaseActions} from './knowledge-base-actions';
import type {KnowledgeBaseState} from './knowledge-base-reducers';
import type {Node} from 'react';
import type {SelectProps} from 'components/select/select';
import type {Theme, UITheme} from 'flow/Theme';

type Props = {
  ...KnowledgeBaseActions,
  ...KnowledgeBaseState,
  issuePermissions: IssuePermissions,
  project?: ArticleProject,
  preventReload?: boolean,
  lastVisitedArticle?: ArticleSingle,
}

type State = {
  focusedArticle: ?ArticleSingle,
  isHeaderPinned: boolean,
  isSelectVisible: boolean,
  isSplitView: boolean,
  modalChildren: any,
};

const ERROR_MESSAGE_DATA: Object = {
  noFavoriteProjects: {
    title: 'No favorites projects found',
    description: 'Add some project to favorites',
  },
  noArticlesFound: {
    title: 'No articles found',
  },
};

export class KnowledgeBase extends Component<Props, State> {
  static contextTypes: any | { actionSheet: typeof Function } = {
    actionSheet: Function,
  };

  listRef: ?Object;
  uiTheme: UITheme;
  unsubscribe: Function = () => null;
  unsubscribeOnDimensionsChange: EventSubscription;
  goOnlineSubscription: EventSubscription;

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
    this.unsubscribeOnDimensionsChange.remove();
    this.unsubscribe();
    this.goOnlineSubscription.remove();
  }

  async componentDidMount() {
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener('change', this.setSplitView);
    this.unsubscribe = Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (!this.props.preventReload && routeName === routeMap.KnowledgeBase && (
        prevRouteName === routeMap.Article ||
        prevRouteName === routeMap.ArticleCreate ||
        prevRouteName === routeMap.Page
      )) {
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

  setSplitView: () => void = (): void => {
    this.setState({isSplitView: isSplitView()});
  }

  loadArticlesList: ((reset?: boolean) => Promise<any>) = async (reset?: boolean) => this.props.loadArticleList(reset);

  scrollToProject: ((project: ArticleProject) => void) = (project: ArticleProject) => {
    const {articlesList} = this.props;
    if (project && articlesList) {
      const index: number = articlesList.findIndex((listItem: ArticlesListItem) => listItem.title?.id === project.id);
      if (index > 0) {
        setTimeout(() => this.listRef && this.listRef.scrollToLocation({
          animated: true,
          itemIndex: 0,
          sectionIndex: index,
        }), 0);
      }
    }
  };

  updateFocusedArticle: (focusedArticle: ?ArticleSingle) => void = (focusedArticle: ?ArticleSingle): void => {
    this.setState({focusedArticle});
  };

  renderProject: (({ section: ArticlesListItem, ... }) => null | React$Element<any>) = ({section}: { section: ArticlesListItem, ... }) => {
    const project: ?ArticleProject = section.title;
    if (project) {
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
              <View style={[
                styles.itemProjectIcon,
                isCollapsed && styles.itemProjectIconCollapsed,
              ]}
              >
                <Icon
                  size={24}
                  color={styles.itemProjectIcon.color}
                />
              </View>
              <Text numberOfLines={2} style={styles.projectTitleText}>{project.name}</Text>
            </TouchableOpacity>
            {!hasSearchQuery && !!project?.id && <Star
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
              uiTheme={this.uiTheme}
            />}
          </View>
          {this.renderSeparator()}
          {(hasHoArticles || isProjectExpanding) && (
            <View>
              <View style={[styles.itemArticle, styles.itemNoArticle]}>
                {isProjectExpanding && <ActivityIndicator color={styles.link.color}/>}
                {hasHoArticles && <Text style={styles.itemNoArticleText}>
                  No articles
                </Text>}
              </View>
              {this.renderSeparator()}
            </View>
          )}
        </>
      );
    }
  };

  renderArticle: ({ item: ArticleNode, ... } => null | React$Element<any>) = ({item}: { item: ArticleNode, ... }) => (
    <ArticleWithChildren
      style={styles.itemArticle}
      article={item.data}
      onArticlePress={(article: ArticleSingle) => {
        if (this.state.isSplitView) {
          Router.KnowledgeBase({lastVisitedArticle: article, preventReload: true});
        } else {
          Router.Article({
            articlePlaceholder: article,
          });
        }
      }}
      onShowSubArticles={(article: ArticleSingle) => this.renderSubArticlesPage(article)}
    />
  );

  renderSubArticlesPage: ((article: ArticleSingle) => Promise<void>) = async (article: ArticleSingle) => {
    const childrenData: ArticleNodeList = await this.props.getArticleChildren(article.id);
    const title = this.renderHeader({
      leftButton: (
        <TouchableOpacity
          onPress={() => this.state.isSplitView ? this.toggleModal(null) : Router.pop()}
        >
          {this.state.isSplitView ? <IconClose size={21} color={styles.link.color}/> : <IconBack color={styles.link.color}/>}
        </TouchableOpacity>
      ),
      title: article.summary,
      customTitleComponent: (
        <TouchableOpacity onPress={() => Router.Article({
          articlePlaceholder: article,
          store: true,
          storeRouteName: routeMap.ArticleSingle,
        })}>
          <Text numberOfLines={2} style={styles.projectTitleText}>{article.summary}</Text>
        </TouchableOpacity>
      ),
    });
    const tree: Node = this.renderArticlesList(
      [{
        title: null,
        data: childrenData,
      }],
      true
    );

    if (this.state.isSplitView) {
      this.toggleModal([title, tree]);
    } else {
      Router.Page({children: <>{title}<View style={styles.itemChild}>{tree}</View></>});
    }
  };

  renderHeader: ((
    {
      leftButton?: React$Element<any>,
      title: string,
      customTitleComponent?: React$Element<any>,
      rightButton?: React$Element<any>,
    }
  ) => Node) = (
    {leftButton, title, customTitleComponent, rightButton}: {
      leftButton?: React$Element<any>,
      title: string,
      customTitleComponent?: React$Element<any>,
      rightButton?: React$Element<any>
    }
  ) => {
    return (
      <View
        key="articlesHeader"
        style={[
          styles.header,
          this.state.isHeaderPinned || customTitleComponent ? styles.headerShadow : null,
        ]}
      >
        {leftButton && <View style={[styles.headerButton, styles.headerLeftButton]}>{leftButton}</View>}
        <View style={styles.headerTitle}>
          {customTitleComponent
            ? customTitleComponent
            : <Text numberOfLines={5} style={styles.headerTitleText}>{title}</Text>}
        </View>
        {rightButton && <View style={[styles.headerButton, styles.headerRightButton]}>{rightButton}</View>}
      </View>
    );
  };

  renderSeparator(): Node {
    return <View style={styles.separator}>{SelectSectioned.renderSeparator()}</View>;
  }

  onScroll: ((any) => void) = ({nativeEvent}: Object) => {
    this.setState({isHeaderPinned: nativeEvent.contentOffset.y >= UNIT});
  };

  renderRefreshControl: (() => React$Element<typeof RefreshControl>) = () => {
    return <RefreshControl
      testID="refresh-control"
      accessibilityLabel="refresh-control"
      accessible={true}
      refreshing={this.props.isLoading}
      tintColor={styles.link.color}
      onRefresh={this.loadArticlesList}
    />;
  };

  getListItemKey: ((item: ArticleNode, index: number) => string) = (item: ArticleNode, index: number) => item?.data?.id || `${index}`;

  setListRef: ((listRef?: any) => void) = (listRef?: Object) => {
    if (listRef) {
      this.listRef = listRef;
    }
  };

  renderArticlesList: ((articlesList: ArticlesList | $Shape<ArticlesList>, hideSearchPanel?: boolean) => Node) = (articlesList: ArticlesList, hideSearchPanel: boolean = false) => {
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
          hideSearchPanel
            ? null
            : (
              <>
                {this.renderSearchPanel()}
                {this.renderActionsBar()}
              </>
            )
        }
        ListFooterComponent={() =>
          !isLoading && !hideSearchPanel && <View style={styles.listFooter}>
            <TouchableOpacity
              testID="test:id/manage-favorite-projects"
              accessibilityLabel="manage-favorite-projects"
              accessible={true}
              hitSlop={HIT_SLOP}
              onPress={this.openProjectSelect}
            >
              <Text style={styles.link}>Manage Favorite Projects</Text>
            </TouchableOpacity>
          </View>}
        ListEmptyComponent={() => !isLoading && <ErrorMessage errorMessageData={{
          ...ERROR_MESSAGE_DATA.noArticlesFound,
          icon: () => <IconNothingFound style={styles.noArticlesErrorIcon}/>,
        }}/>}
      />
    );
  };

  getSearchQuery: (() => string | null) = (): string | null => knowledgeBaseActions.getArticlesQuery();

  renderSearchPanel: (() => Node) = () => (
    <KnowledgeBaseSearchPanel
      query={this.getSearchQuery()}
      onSearch={(query: string) => {
        this.props.filterArticles(query);
      }}
    />
  );

  renderActionsBar: (() => Node) = () => {
    const {isLoading, articlesList} = this.props;
    const list: ArticlesList = articlesList || [];
    const hasSearchQuery: boolean = !!this.getSearchQuery();
    const isToggleButtonEnabled: boolean = (
      !isLoading &&
      !hasSearchQuery &&
      list.length > 0 &&
      list.some((it: ArticlesListItem) => !it.title?.articles?.collapsed)
    );

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
          {!hasSearchQuery && <Text style={styles.actionBarButtonText}>
            Collapse all
          </Text>}
        </TouchableOpacity>
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
                  backIcon={<IconClose size={21} color={styles.link.color}/>}
                  onBack={() => this.toggleModal()}
                  onArticleCreate={this.onArticleCreate}
                />
              );
            } else {
              Router.Page({
                children: (
                  <KnowledgeBaseDrafts onArticleCreate={this.onArticleCreate}/>
                ),
              });
            }
          }}
        >
          <Text style={styles.actionBarButtonText}>Drafts</Text>
          <IconAngleRight size={20} color={styles.actionBarButtonText.color}/>
        </TouchableOpacity>
      </View>
    );
  };

  closeProjectSelect: (() => void) = () => this.setState({isSelectVisible: false});

  openProjectSelect: (() => void) = () => this.setState({isSelectVisible: true});

  renderProjectSelect: (() => Node) = () => {
    const {updateProjectsFavorites} = this.props;
    const projects: Array<ArticleProject> = ((getStorageState().projects: any): Array<ArticleProject>);
    const prevPinnedProjects: Array<ArticleProject> = projects.filter((it: ArticleProject) => it.pinned);
    const selectProps: SelectProps = {
      placeholder: 'Filter projects',
      multi: true,
      header: () => (
        <Text style={styles.manageFavoriteProjectsNote}>
          To view articles in the knowledge base for a specific project, mark it as a favorite
        </Text>
      ),
      dataSource: () => {
        const sortedProjects = getGroupedByFieldNameAlphabetically(projects, 'pinned');
        return Promise.resolve([{
          title: 'Favorites',
          data: sortedProjects.favorites,
        }, {
          title: 'Projects',
          data: sortedProjects.others,
        }]);
      },
      selectedItems: prevPinnedProjects,
      getTitle: (it: ArticleProject) => it.name,
      onCancel: this.closeProjectSelect,
      onChangeSelection: () => null,
      onSelect: async (selectedProjects: ?Array<ArticleProject>) => {
        const pinnedProjects: Array<ArticleProject> = (
          (selectedProjects || [])
            .map((it: ArticleProject) => it.pinned ? null : {...it, pinned: true})
            .filter(Boolean)
        );
        const unpinnedProjects: Array<ArticleProject> = prevPinnedProjects.filter(
          (it: ArticleProject) => !(selectedProjects || []).includes(it)).map(
          (it: ArticleProject) => ({
            ...it,
            pinned: false,
          })
        );
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
    return <SelectSectioned {...selectProps}/>;
  };

  renderNoFavouriteProjects: (() => Node) = () => {
    return (
      <View style={styles.noProjects}>
        <IconNoProjectFound style={styles.noProjectsIcon}/>
        <Text style={styles.noProjectsMessage}>
          Here you'll see a list of articles from your favorite projects
        </Text>
        <TouchableOpacity
          style={styles.noProjectsButton}
          hitSlop={HIT_SLOP}
          onPress={this.openProjectSelect}
        >
          <Text style={styles.noProjectsButtonText}>
            Find favorite projects
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  toggleModal(modalChildren: any = null) {
    this.setState({modalChildren});
  }

  onArticleCreate(articleDraft?: ?ArticleDraft, isNew: boolean = true) {
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

  renderArticleList: () => Node = (): Node => {
    const {isLoading, articlesList, error, showContextActions, issuePermissions} = this.props;
    return (
      <>
        {
          this.renderHeader({
            title: 'Knowledge Base',
            rightButton: (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                onPress={() => {
                  showContextActions(
                    this.context.actionSheet(),
                    issuePermissions.articleCanCreateArticle(),
                    this.openProjectSelect,
                    this.onArticleCreate,
                  );
                }}
              >
                <IconContextActions color={styles.link.color}/>
              </TouchableOpacity>
            ),
          })
        }
        <View
          style={styles.content}
        >

          {error && !error.noFavoriteProjects && <ErrorMessage testID="articleError" error={error}/>}

          {error && error.noFavoriteProjects && this.renderNoFavouriteProjects()}

          {!error && !articlesList && isLoading && <SkeletonIssues/>}

          {!error && articlesList && this.renderArticlesList(articlesList)}

        </View>
      </>
    );
  };

  renderFocusedArticle: () => Node = (): Node => {
    const {focusedArticle} = this.state;

    if (!this.props?.articlesList || this.props.articlesList.length === 0) {
      return null;
    }

    return (
      focusedArticle
        ? <View style={styles.content}><Article articlePlaceholder={focusedArticle}/></View>
        : (
          <View style={styles.splitViewMainEmpty}>
            {<IconNothingSelected size={ICON_PICTOGRAM_DEFAULT_SIZE}/>}
            <Text style={styles.splitViewMessage}>Select an article from the list</Text>
          </View>
        )
    );
  };

  renderSplitView: () => Node = (): Node => {
    return (
      <View style={styles.splitViewContainer}>
        <View style={styles.splitViewSide}>
          {this.renderArticleList()}
        </View>
        <View style={styles.splitViewMain}>
          {this.renderFocusedArticle()}
        </View>
      </View>
    );
  };

  render(): Node {
    const {isSplitView} = this.state;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;

          return (
            <View
              style={[
                styles.container,
                isSplitView ? styles.splitViewContainer : null,
              ]}
              testID="articles"
            >

              {isSplitView && this.renderSplitView()}
              {!isSplitView && this.renderArticleList()}

              {this.state.isSelectVisible && this.renderProjectSelect()}

              {isSplitView && (
                <ModalPortal
                  onHide={() => this.toggleModal()}
                >
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

const mapStateToProps = (state: AppState) => {
  return {
    ...state.app,
    ...state.articles,
    issuePermissions: state.app.issuePermissions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(knowledgeBaseActions, dispatch),
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(KnowledgeBase): any);
