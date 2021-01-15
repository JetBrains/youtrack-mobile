/* @flow */

import React, {Component} from 'react';
import {RefreshControl, SectionList, Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as knowledgeBaseActions from './knowledge-base-actions';
import ErrorMessage from '../../components/error-message/error-message';
import IconSearchEmpty from '../../components/icon/search-empty.svg';
import KnowledgeBaseSearchPanel from './knowledge-base__search';
import PropTypes from 'prop-types';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Star from '../../components/star/star';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {findArticleNode} from '../../components/articles/articles-tree-helper';
import {getStorageState} from '../../components/storage/storage';
import {hasType} from '../../components/api/api__resource-types';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconAngleDown, IconAngleRight, IconBack, IconContextActions, IconLock} from '../../components/icon/icon';
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
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = KnowledgeBaseActions & KnowledgeBaseState & { issuePermissions: IssuePermissions };

type State = {
  isHeaderPinned: boolean
};


export class KnowledgeBase extends Component<Props, State> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  articlesList: Object;
  uiTheme: UITheme;

  constructor(props: Props) {
    super(props);
    this.state = {isHeaderPinned: false};
    usage.trackScreenView(ANALYTICS_ARTICLES_PAGE);

    Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (routeName === routeMap.KnowledgeBase && (
        prevRouteName === routeMap.Article ||
        prevRouteName === routeMap.ArticleCreate
      )) {
        this.loadArticlesList(false);
      }
    });
  }

  componentDidMount() {
    this.props.loadArticlesListFromCache();
    this.loadArticlesList();
  }

  loadArticlesList = async (reset?: boolean) => {
    await this.props.loadArticlesList(reset);
    this.props.loadArticlesDrafts();
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
                onPress={() => this.props.toggleProjectArticlesVisibility(section)}
              >
                <View style={[
                  styles.itemProjectIcon,
                  isCollapsed && styles.itemProjectIconCollapsed
                ]}
                >
                  <Icon
                    size={24}
                    color={this.uiTheme.colors.$text}
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
              onStarToggle={async () => this.props.toggleProjectArticlesFavorite(project)}
              uiTheme={this.uiTheme}
            />}
          </View>
          {this.renderSeparator()}
        </>
      );
    }
  };

  openArticle = (article: Article) => {
    if (hasType.articleDraft(article)) {
      Router.ArticleCreate({articleDraft: article});
    } else {
      Router.Article({articlePlaceholder: article});
    }
  };

  renderArticle = ({item}: ArticleNode) => {
    const article: Article = item.data;
    const style: ViewStyleProp = {...styles.row, ...styles.item};

    if (article) {
      return (
        <View style={style}>
          <TouchableOpacity
            style={style}
            onPress={() => this.openArticle(article)}
          >
            <Text numberOfLines={2} style={styles.articleTitleText}>{article.summary || 'Untitled'}</Text>
            <View style={styles.itemArticleIcon}>
              {hasType.visibilityLimited(article?.visibility) && (
                <IconLock
                  size={16}
                  color={this.uiTheme.colors.$iconAccent}
                />
              )}
            </View>
          </TouchableOpacity>

          {item.children.length > 0 && <TouchableOpacity
            style={styles.itemButtonContainer}
            onPress={() => this.renderSubArticlesPage(article)}
          >
            <View style={styles.itemButton}>
              <Text style={styles.itemButtonText}>{item.children.length}</Text>
              <IconAngleRight style={styles.itemButtonIcon} size={22} color={this.uiTheme.colors.$icon}/>
            </View>
          </TouchableOpacity>}
        </View>
      );
    }
  };

  renderSubArticlesPage = (article: Article) => {
    const {articlesList} = this.props;
    const node: ?ArticleNode = articlesList && findArticleNode(articlesList, article.project.id, article.id);

    if (node) {
      const title = this.renderHeader({
        leftButton: (
          <TouchableOpacity
            onPress={() => Router.pop()}
          >
            <IconBack color={this.uiTheme.colors.$link}/>
          </TouchableOpacity>
        ),
        title: node.data.summary,
        customTitleComponent: (
          <TouchableOpacity onPress={() => this.openArticle(article)}>
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

      Router.Page({children: <>{title}<View style={styles.itemSubArticle}>{tree}</View></>});
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
      tintColor={this.uiTheme.colors.$link}
      onRefresh={this.loadArticlesList}
    />;
  };

  getListItemKey = (item: ArticleNode, index: number) => item?.data?.id || index;

  renderArticlesList = (articlesList: ArticlesList, hideSearchPanel: boolean = false) => {
    const list: ArticlesList = (
      getStorageState().articlesListPinnedOnly
        ? articlesList.filter((it: ArticlesListItem) => {
          if (it.title) {
            return it.title.pinned || it.title.isDrafts;
          }
          return it;
        })
        : articlesList
    );
    return (
      <SectionList
        testID="articles"
        ref={(ref: Object) => ref && (this.articlesList = ref)}
        sections={list}
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
          //$FlowFixMe
          icon: () => <IconSearchEmpty style={[styles.noArticlesIcon, {fill: this.uiTheme.colors.$icon}]}/>,
          iconSize: 48
        }}/>}
        ListFooterComponent={() =>
          getStorageState().articlesListPinnedOnly &&
          <View style={styles.listFooter}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => this.props.toggleNonFavoriteProjectsVisibility()}
            >
              <Text style={styles.listFooterText}>Show non-favorite projects</Text>
            </TouchableOpacity>
          </View>}
        stickySectionHeadersEnabled={true}
        ListHeaderComponent={hideSearchPanel ? null : this.renderSearchPanel()}
      />
    );
  };

  renderSearchPanel = () => (
    <KnowledgeBaseSearchPanel
      onSearch={(query: string) => {
        this.props.filterArticlesList(query);
      }}
    />
  );

  render() {
    const {isLoading, articlesList, error, showKBActions, issuePermissions} = this.props;

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
                        showKBActions(this.context.actionSheet(), issuePermissions.articleCanCreateArticle());
                      }}
                    >
                      <IconContextActions color={this.uiTheme.colors.$link}/>
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
