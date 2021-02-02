/* @flow */

import React, {Component} from 'react';
import {RefreshControl, SectionList, Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as knowledgeBaseActions from './knowledge-base-actions';
import ArticleWithChildren from '../../components/articles/article-item-with-children';
import ErrorMessage from '../../components/error-message/error-message';
import IconSearchEmpty from '../../components/icon/search-empty.svg';
import KnowledgeBaseDrafts from './knowledge-base__drafts';
import KnowledgeBaseSearchPanel from './knowledge-base__search';
import PropTypes from 'prop-types';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Star from '../../components/star/star';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {findArticleNode} from '../../components/articles/articles-tree-helper';
import {getStorageState} from '../../components/storage/storage';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconAngleDown, IconAngleRight, IconBack, IconContextActions} from '../../components/icon/icon';
import {routeMap} from '../../app-routes';
import {SkeletonIssues} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';
import {UNIT} from '../../components/variables/variables';

import styles from './knowledge-base.styles';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {Article, ArticlesList, ArticlesListItem, ArticleNode, ArticleProject} from '../../flow/Article';
import type {KnowledgeBaseActions} from './knowledge-base-actions';
import type {KnowledgeBaseState} from './knowledge-base-reducers';
import type {Theme, UITheme} from '../../flow/Theme';

type Props = KnowledgeBaseActions & KnowledgeBaseState & { issuePermissions: IssuePermissions };

type State = {
  isHeaderPinned: boolean
};


export class KnowledgeBase extends Component<Props, State> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  uiTheme: UITheme;
  unsubscribe: Function

  constructor(props: Props) {
    super(props);
    this.state = {isHeaderPinned: false};
    usage.trackScreenView(ANALYTICS_ARTICLES_PAGE);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.props.loadArticlesListFromCache();
    this.loadArticlesList();

    this.unsubscribe = Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (routeName === routeMap.KnowledgeBase && (
        prevRouteName === routeMap.Article ||
        prevRouteName === routeMap.ArticleCreate ||
        prevRouteName === routeMap.Page
      )) {
        this.loadArticlesList(false);
      }
    });
  }

  loadArticlesList = async (reset?: boolean) => this.props.loadArticlesList(reset);

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
                onPress={() => this.props.toggleProjectArticlesVisibility(section)}
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
              onStarToggle={() => this.props.toggleProjectArticlesFavorite(project)}
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
      articleNode={item}
      onArticlePress={(article: Article) => Router.Article({articlePlaceholder: article})}
      onShowSubArticles={(article: Article) => this.renderSubArticlesPage(article)}
    />
  );

  renderSubArticlesPage = (article: Article) => {
    const {articlesList} = this.props;
    const node: ?ArticleNode = articlesList && findArticleNode(articlesList, article.project.id, article.id);

    if (node) {
      const title = this.renderHeader({
        leftButton: (
          <TouchableOpacity
            onPress={() => Router.pop()}
          >
            <IconBack color={styles.link.color}/>
          </TouchableOpacity>
        ),
        title: node.data.summary,
        customTitleComponent: (
          <TouchableOpacity onPress={() => Router.Article({articlePlaceholder: article})}>
            <Text numberOfLines={2} style={styles.projectTitleText}>{article.summary}</Text>
          </TouchableOpacity>
        )
      });
      const tree: ArticlesList = this.renderArticlesList(
        [{
          title: null,
          data: node.children
        }],
        true
      );

      Router.Page({children: <>{title}<View style={styles.itemChild}>{tree}</View></>});
    }
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

  createFilteredArticlesList: ArticlesList = (articlesList: ArticlesList) => {
    return (
      getStorageState().articlesListPinnedOnly
        ? (articlesList || []).filter((it: ArticlesListItem) => {
          if (it.title) {
            return it.title.pinned || it.title.isDrafts;
          }
          return it;
        })
        : (articlesList || [])
    );
  };

  renderArticlesList = (articlesList: ArticlesList, hideSearchPanel: boolean = false) => {
    return (
      <SectionList
        testID="articles"
        sections={this.createFilteredArticlesList(articlesList)}
        scrollEventThrottle={10}
        onScroll={this.onScroll}
        refreshControl={this.renderRefreshControl()}
        keyExtractor={this.getListItemKey}
        getItemLayout={Select.getItemLayout}
        renderItem={this.renderArticle}
        renderSectionHeader={this.renderProject}
        ItemSeparatorComponent={this.renderSeparator}
        ListEmptyComponent={() => !this.props.isLoading && <ErrorMessage errorMessageData={{
          title: 'No articles yet',
          description: '',
          icon: () =>
            //$FlowFixMe
            <IconSearchEmpty fill={styles.icon.color} style={styles.noArticlesIcon}/>,
          iconSize: 48
        }}/>}
        ListFooterComponent={() =>
          !hideSearchPanel && getStorageState().articlesListPinnedOnly &&
          <View style={styles.listFooter}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => this.props.toggleNonFavoriteProjectsVisibility()}
            >
              <Text style={styles.listFooterText}>Show all projects</Text>
            </TouchableOpacity>
          </View>}
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
    const isSomeProjectExpanded = this.createFilteredArticlesList(this.props.articlesList)
      .map((it: ArticlesListItem) => it.title.articles.collapsed)
      .some((it: boolean) => it !== true);

    return (
      <View style={styles.actionBar}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => this.props.toggleAllProjects(isSomeProjectExpanded)}
        >
          <Text style={styles.actionBarButtonText}>
            {isSomeProjectExpanded ? 'Collapse projects' : 'Expand projects'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
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

                {error && <ErrorMessage testID="articleError" error={error}/>}

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
