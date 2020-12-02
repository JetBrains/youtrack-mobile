/* @flow */

import React, {Component} from 'react';
import {SectionList, Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as knowledgeBaseActioins from './knowledge-base-actions';
import ErrorMessage from '../../components/error-message/error-message';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {guid} from '../../util/util';
import {IconAngleDown, IconAngleRight} from '../../components/icon/icon';
import {SkeletonIssues} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';

import {UNIT} from '../../components/variables/variables';
import styles from './knowledge-base.styles';

import type {Article, ArticleTreeItem} from '../../flow/Article';
import type {KnowledgeBaseState} from './knowledge-base-reducers';
import type {Theme, UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = KnowledgeBaseState & {
  loadArticles: () => void
};

type State = {
  isTitlePinned: boolean
};


export class KnowledgeBase extends Component<Props, State> {
  uiTheme: UITheme;

  constructor(props: Props) {
    super(props);
    this.state = {isTitlePinned: false};
    usage.trackScreenView(ANALYTICS_ARTICLES_PAGE);
  }

  componentDidMount() {
    this.props.loadArticles();
  }

  renderProject = ({section}: Object) => {
    if (section.title) {
      return (
        <>
          <View style={[styles.item, styles.itemProject]}>
            <IconAngleDown size={24} color={this.uiTheme.colors.$text}/>
            <Text style={styles.projectTitle}>{section.title.name}</Text>
          </View>
          {this.renderSeparator()}
        </>
      );
    }
  };

  renderArticle = ({item}: ArticleTreeItem) => {
    const article: Article = item.data;
    const style: ViewStyleProp = {...styles.row, ...styles.item};

    return (
      <View style={style}>
        <TouchableOpacity
          style={[style, styles.itemArticle]}
          onPress={() => Router.Article({article: article})}
        >
          <Text numberOfLines={1} style={styles.articleTitle}>{article.summary}</Text>
        </TouchableOpacity>

        {item.children.length > 0 && <TouchableOpacity
          style={styles.itemButton}
          onPress={() => {}}
        >
          {item.children.length > 0 && <IconAngleRight size={22} color={this.uiTheme.colors.$iconAccent}/>}
        </TouchableOpacity>}
      </View>
    );
  };

  renderTitle() {
    return (
      <View
        key="articlesHeader"
        style={[
          styles.headerTitle,
          this.state.isTitlePinned ? styles.headerTitleShadow : null
        ]}
      >
        <Text style={styles.headerTitleText}>Knowledge Base</Text>
      </View>
    );
  }

  renderSeparator() {
    return <View style={styles.separator}>{Select.renderSeparator()}</View>;
  }

  onScroll = ({nativeEvent}: Object) => {
    this.setState({isTitlePinned: nativeEvent.contentOffset.y >= UNIT * 7});
  };

  render() {
    const {isLoading, articlesTree, error} = this.props;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;

          return (
            <View
              style={styles.container}
              testID="articles"
            >
              {this.renderTitle()}
              <View
                style={styles.content}
              >

                {error && <ErrorMessage testID="articleError" error={error}/>}

                {isLoading && !error && <SkeletonIssues/>}

                {!isLoading && !error && <SectionList
                  testID="articles"
                  style={styles.list}
                  sections={articlesTree}
                  scrollEventThrottle={10}
                  onScroll={this.onScroll}

                  keyExtractor={guid}
                  getItemLayout={Select.getItemLayout}
                  renderItem={this.renderArticle}
                  renderSectionHeader={this.renderProject}
                  ItemSeparatorComponent={this.renderSeparator}
                  ListEmptyComponent={() => {
                    return <Text>No articles found</Text>;
                  }}
                />}
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
    ...bindActionCreators(knowledgeBaseActioins, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowledgeBase);
