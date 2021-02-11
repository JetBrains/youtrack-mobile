/* @flow */

import React, {Component} from 'react';
import {RefreshControl, SectionList, Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as knowledgeBaseActions from './knowledge-base-actions';
import ArticleWithChildren from '../../components/articles/article-item-with-children';
import ErrorMessage from '../../components/error-message/error-message';
import KnowledgeBaseDrafts from './knowledge-base__drafts';
import KnowledgeBaseSearchPanel from './knowledge-base__search';
import PropTypes from 'prop-types';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Star from '../../components/star/star';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {HIT_SLOP} from '../../components/common-styles/button';
import {
  IconAngleDown,
  IconAngleRight,
  IconBack,
  IconContextActions,
  IconKnowledgeBase, IconNoProjectFound, IconNoProjectFoundDark
} from '../../components/icon/icon';
import {routeMap} from '../../app-routes';
import {SkeletonIssues} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';
import {UNIT} from '../../components/variables/variables';


import styles, {noProjectsIconSize} from './knowledge-base.styles';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {Article, ArticlesList, ArticlesListItem, ArticleNode, ArticleProject} from '../../flow/Article';
import type {KnowledgeBaseActions} from './knowledge-base-actions';
import type {KnowledgeBaseState} from './knowledge-base-reducers';
import type {Theme, UITheme} from '../../flow/Theme';

type Props = KnowledgeBaseActions & KnowledgeBaseState & {
  issuePermissions: IssuePermissions,
  project?: ArticleProject,
  preventReload?: boolean
};

type State = {
  isHeaderPinned: boolean
};

const ERROR_MESSAGE_DATA: Object = {
  noFavoriteProjects: {
    title: 'No favorites projects found',
    description: 'Add some project to favorites',
  },
  noArticlesFound: {
    title: 'No articles found'
  }
};

export class KnowledgeBase extends Component<Props, State> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  listRef: ?Object;
  uiTheme: UITheme;
  unsubscribe: Function;

  constructor(props: Props) {
    super(props);
    this.state = {isHeaderPinned: false};
    usage.trackScreenView(ANALYTICS_ARTICLES_PAGE);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async componentDidMount() {
    this.unsubscribe = Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (routeName === routeMap.KnowledgeBase && (
        prevRouteName === routeMap.Article ||
        prevRouteName === routeMap.ArticleCreate ||
        prevRouteName === routeMap.Page
      )) {
        this.loadArticlesList(false);
      }
    });

    this.props.loadCachedArticleList();
    if (!this.props.preventReload) {
      await this.loadArticlesList();
    }

    if (this.props.project) {
      this.scrollToProject(this.props.project);
    }
  }

  loadArticlesList = async (reset?: boolean) => this.props.loadArticleList(reset);

  scrollToProject = (project: ArticleProject) => {
    const {articlesList} = this.props;
    if (project && articlesList) {
      const index: number = articlesList.findIndex((listItem: ArticlesListItem) => listItem.title.id === project.id);
      if (index > 0) {
        setTimeout(() => this.listRef && this.listRef.scrollToLocation({
          animated: true,
          itemIndex: 0,
          sectionIndex: index
        }), 0);
      }
    }
  };

  renderProject = ({section}: ArticlesListItem) => {
    const project: ?ArticleProject = section.title;
    if (project) {
      const isCollapsed: boolean = project?.articles?.collapsed;
      const Icon = isCollapsed ? IconAngleRight : IconAngleDown;
      return (
        <>
          <View style={styles.item}>
            <>
              <TouchableOpacity
                style={styles.itemProject}
                onPress={() => this.props.toggleProjectVisibility(section)}
              >
                <View style={[
                  styles.itemProjectIcon,
                  isCollapsed && styles.itemProjectIconCollapsed
                ]}
                >
                  <Icon
                    size={24}
                    color={styles.itemProjectIcon.color}
                  />
                </View>
                <Text style={styles.projectTitleText}>{project.name}</Text>
              </TouchableOpacity>
            </>
            {!!project?.id && <Star
              style={styles.itemStar}
              size={19}
              hasStar={project.pinned}
              canStar={true}
              onStarToggle={() => this.props.toggleProjectFavorite(section)}
              uiTheme={this.uiTheme}
            />}
          </View>
          {this.renderSeparator()}
        </>
      );
    }
  };

  renderArticle = ({item}: ArticleNode) => (
    <ArticleWithChildren
      style={styles.itemArticle}
      article={item.data}
      onArticlePress={(article: Article) => Router.Article({
        articlePlaceholder: article,
        store: true,
        storeRouteName: routeMap.ArticleSingle
      })}
      onShowSubArticles={(article: Article) => this.renderSubArticlesPage(article)}
    />
  );

  renderSubArticlesPage = async (article: Article) => {
    const childrenData: ArticlesList = await this.props.getArticleChildren(article.id);
    const title = this.renderHeader({
      leftButton: (
        <TouchableOpacity
          onPress={() => Router.pop()}
        >
          <IconBack color={styles.link.color}/>
        </TouchableOpacity>
      ),
      title: article.summary,
      customTitleComponent: (
        <TouchableOpacity onPress={() => Router.Article({
          articlePlaceholder: article,
          store: true,
          storeRouteName: routeMap.ArticleSingle
        })}>
          <Text numberOfLines={2} style={styles.projectTitleText}>{article.summary}</Text>
        </TouchableOpacity>
      )
    });
    const tree: ArticlesList = this.renderArticlesList(
      [{
        title: null,
        data: childrenData
      }],
      true
    );
    Router.Page({children: <>{title}<View style={styles.itemChild}>{tree}</View></>});
  };

  renderHeader = (
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
          this.state.isHeaderPinned || customTitleComponent ? styles.headerShadow : null
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

  renderSeparator() {
    return <View style={styles.separator}>{Select.renderSeparator()}</View>;
  }

  onScroll = ({nativeEvent}: Object) => {
    this.setState({isHeaderPinned: nativeEvent.contentOffset.y >= UNIT});
  };

  renderRefreshControl = () => {
    return <RefreshControl
      refreshing={this.props.isLoading}
      tintColor={styles.link.color}
      onRefresh={this.loadArticlesList}
    />;
  };

  getListItemKey = (item: ArticleNode, index: number) => item?.data?.id || index;

  setListRef = (listRef?: Object) => {
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
        getItemLayout={Select.getItemLayout}
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
          !isLoading && <View style={styles.listFooter}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => {}}
            >
              <Text style={styles.listFooterText}>Show more projects</Text>
            </TouchableOpacity>
          </View>}
        ListEmptyComponent={() => !isLoading && <ErrorMessage errorMessageData={{
          ...(articlesList === null ? ERROR_MESSAGE_DATA.noFavoriteProjects : ERROR_MESSAGE_DATA.noArticlesFound),
          icon: () => <IconKnowledgeBase color={styles.actionBarButtonText.color} size={81}/>
        }}/>}
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

  renderActionsBar = () => {
    const {isLoading, articlesList} = this.props;
    const list: ArticlesList = articlesList || [];
    const isToggleButtonEnabled: boolean = (
      !isLoading &&
      list.length > 0 &&
      list.some((it: ArticlesListItem) => !it.title?.articles?.collapsed)
    );

    return (
      <View style={styles.actionBar}>
        <TouchableOpacity
          disabled={!isToggleButtonEnabled}
          hitSlop={HIT_SLOP}
          onPress={() => this.props.toggleAllProjects()}
        >
          <Text style={[
            styles.actionBarButtonText,
            !isToggleButtonEnabled && styles.actionBarButtonTextDisabled
          ]}>
            Collapse all
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isLoading}
          hitSlop={HIT_SLOP}
          style={styles.actionBarButton}
          onPress={() => Router.Page({
            children: <KnowledgeBaseDrafts/>
          })}
        >
          <Text style={styles.actionBarButtonText}>Drafts</Text>
          <IconAngleRight size={20} color={styles.actionBarButtonText.color}/>
        </TouchableOpacity>
      </View>
    );
  };

  renderNoFavouriteProjects = () => {
    const IconNoProjects = (
      //$FlowFixMe
      this.props.error?.noFavoriteProjects ? (this.uiTheme.dark ? IconNoProjectFoundDark : IconNoProjectFound) : null
    );
    return (
      <View style={styles.noProjects}>
        <IconNoProjects
          width={noProjectsIconSize}
          height={noProjectsIconSize}
          style={styles.noProjectsIcon}
        />
        <Text style={styles.noProjectsMessage}>
          There should be a list of articles from your favorite projects, but you haven't selected any.
        </Text>
        <TouchableOpacity
          style={styles.noProjectsButton}
          hitSlop={HIT_SLOP}
          onPress={() => {}}
        >
          <Text style={styles.noProjectsButtonText}>
            Select projects
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const {isLoading, articlesList, error, showContextActions, issuePermissions} = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;

          return (
            <View
              style={styles.container}
              testID="articles"
            >
              {
                this.renderHeader({
                  title: 'Knowledge Base',
                  rightButton: (
                    <TouchableOpacity
                      hitSlop={HIT_SLOP}
                      onPress={() => {
                        showContextActions(this.context.actionSheet(), issuePermissions.articleCanCreateArticle());
                      }}
                    >
                      <IconContextActions color={styles.link.color}/>
                    </TouchableOpacity>
                  )
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
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.app,
    ...state.articles,
    issuePermissions: state.app.issuePermissions
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(knowledgeBaseActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowledgeBase);
