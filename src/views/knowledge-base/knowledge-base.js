/* @flow */

import React, {Component} from 'react';
import {RefreshControl, SectionList, Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as knowledgeBaseActions from './knowledge-base-actions';
import ErrorMessage from '../../components/error-message/error-message';
import IconSearchEmpty from '../../components/icon/search-empty.svg';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {findArticleNode} from '../../components/articles/articles-helper';
import {hasType} from '../../components/api/api__resource-types';
import {IconAngleDown, IconAngleRight, IconBack, IconLock} from '../../components/icon/icon';
import {routeMap} from '../../app-routes';
import {SkeletonIssues} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';
import {UNIT} from '../../components/variables/variables';

import styles from './knowledge-base.styles';

import type {Article, ArticlesList, ArticlesListItem, ArticleNode, ArticleProject} from '../../flow/Article';
import type {KnowledgeBaseActions} from './knowledge-base-actions';
import type {KnowledgeBaseState} from './knowledge-base-reducers';
import type {Theme, UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = KnowledgeBaseActions & KnowledgeBaseState;

type State = {
  isTitlePinned: boolean
};


export class KnowledgeBase extends Component<Props, State> {
  uiTheme: UITheme;

  constructor(props: Props) {
    super(props);
    this.state = {isTitlePinned: false};
    usage.trackScreenView(ANALYTICS_ARTICLES_PAGE);

    Router.setOnDispatchCallback((routeName: string, prevRouteName: string) => {
      if (routeName === routeMap.KnowledgeBase && prevRouteName === routeMap.Article) {
        this.loadArticlesList(false);
      }
    });
  }

  componentDidMount() {
    this.props.loadArticlesListFromCache();
    this.loadArticlesList();
  }

  loadArticlesList = (reset?: boolean) => this.props.loadArticlesList(reset);

  renderProject = ({section}: ArticlesListItem) => {
    const project: ?ArticleProject = section.title;
    if (project) {
      const isCollapsed: boolean = project?.articles?.collapsed;
      const Icon = isCollapsed ? IconAngleRight : IconAngleDown;
      return (
        <>
          <TouchableOpacity
            style={[styles.item, styles.itemProject]}
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
            <Text style={styles.projectTitle}>{project.name}</Text>
          </TouchableOpacity>
          {this.renderSeparator()}
        </>
      );
    }
  };

  renderArticle = ({item}: ArticleNode) => {
    const article: Article = item.data;
    const style: ViewStyleProp = {...styles.row, ...styles.item};

    return (
      <View style={[styles.itemArticle, style]}>
        <TouchableOpacity
          style={style}
          onPress={() => Router.Article({articlePlaceholder: article})}
        >
          <Text numberOfLines={2} style={styles.articleTitle}>{article.summary}</Text>
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
  };

  renderSubArticlesPage = (article: Article) => {
    const {articlesList} = this.props;
    const node: ?ArticleNode = articlesList && findArticleNode(articlesList, article.project.id, article.id);

    if (node) {
      const title = this.renderHeader(
        node.data.summary,
        <TouchableOpacity
          style={styles.headerTitleButton}
          onPress={() => Router.pop()}
        >
          <IconBack color={this.uiTheme.colors.$link}/>
        </TouchableOpacity>,
        <TouchableOpacity
          onPress={() => Router.Article({articlePlaceholder: article})}
        >
          <Text numberOfLines={2} style={styles.projectTitle}>{article.summary}</Text>
        </TouchableOpacity>
      );
      const tree: ArticlesList = this.renderArticlesList([{
        title: null,
        data: node.children
      }]);

      Router.Page({children: <>{title}{tree}</>});
    }
  };

  renderHeader = (title: string, leftButton?: React$Element<any>, customTitleComponent?: React$Element<any>) => {
    return (
      <View
        key="articlesHeader"
        style={[
          styles.headerTitle,
          this.state.isTitlePinned || customTitleComponent ? styles.headerTitleShadow : null
        ]}
      >
        {leftButton}
        {customTitleComponent
          ? customTitleComponent
          : <Text numberOfLines={5} style={styles.headerTitleText}>{title}</Text>}
      </View>
    );
  };

  renderSeparator() {
    return <View style={styles.separator}>{Select.renderSeparator()}</View>;
  }

  onScroll = ({nativeEvent}: Object) => {
    this.setState({isTitlePinned: nativeEvent.contentOffset.y >= UNIT * 7});
  };

  renderRefreshControl = () => {
    return <RefreshControl
      refreshing={false}
      tintColor={this.uiTheme.colors.$link}
      onRefresh={this.loadArticlesList}
    />;
  };

  getListItemKey = (item: ArticleNode, index: number) => item.data.id || index;

  renderArticlesList = (articlesList: ArticlesList) => {
    return (
      <SectionList
        testID="articles"
        sections={articlesList}
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
        stickySectionHeadersEnabled={true}
      />
    );
  };

  render() {
    const {isLoading, articlesList, error} = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;

          return (
            <View
              style={styles.container}
              testID="articles"
            >
              {this.renderHeader('Knowledge Base')}
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(knowledgeBaseActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowledgeBase);
