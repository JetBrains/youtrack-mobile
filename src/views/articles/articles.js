/* @flow */

import React, {Component} from 'react';
import {View, Text, SectionList, TouchableOpacity} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as articlesActions from './arcticles-actions';
import ErrorMessage from '../../components/error-message/error-message';
import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {guid} from '../../util/util';
import {IconAngleRight, IconClone} from '../../components/icon/icon';
import {SkeletonIssues} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './articles.styles';

import type {ArticlesState} from './articles-reducers';
import type {ArticleTreeItem} from '../../flow/Article';
import type {Theme} from '../../flow/Theme';

type Props = ArticlesState & {
  loadArticles: () => void
};

type State = {
  isTitlePinned: boolean
};


export class Articles extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {isTitlePinned: false};
    usage.trackScreenView(articlesActions.ARTICLE_ANALYTICS_ID);
  }

  componentDidMount() {
    this.props.loadArticles();
  }

  renderProject = ({section}: Object) => {
    if (section.title) {
      return (
        <View style={[styles.item, styles.itemProject]}>
          <Text style={styles.projectTitle}>{section.title.name}</Text>
        </View>
      );
    }
  };

  renderArticle = ({item}: ArticleTreeItem) => {
    const article: ArticleTreeItem = item.data;

    return (
      <View style={[styles.row, styles.item]}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => {}}
        >
          {item.children.length > 0 && (
            <Text>
              <IconClone
                size={12}
                color={styles.iconHasChildren.color}
              />
              <Text>{'  '}</Text>
            </Text>
          )}
          <Text numberOfLines={1} style={styles.articleTitle}>{article.summary}</Text>
        </TouchableOpacity>

        {item.children.length > 0 && <TouchableOpacity
          style={styles.itemButton}
          onPress={() => {}}
        >
          {item.children.length > 0 && <IconAngleRight size={16} color={styles.iconNavigate.color}/>}
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
          this.state.isTitlePinned ? styles.titleShadow : null
        ]}
      >
        <Text style={styles.headerTitleText}>Knowledge Base</Text>
      </View>
    );
  }

  render() {
    const {isLoading, articlesTree, error} = this.props;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <View
              style={styles.container}
              testID="articles"
            >
              {this.renderTitle()}
              <View
                style={styles.articlesContainer}
              >

                {error && <ErrorMessage testID="articleError" error={error}/>}

                {isLoading && !error && <SkeletonIssues/>}

                {!isLoading && !error && <SectionList
                  testID="articles"
                  style={styles.list}
                  sections={articlesTree}
                  scrollEventThrottle={10}

                  keyExtractor={guid}
                  getItemLayout={Select.getItemLayout}
                  renderItem={this.renderArticle}
                  renderSectionHeader={this.renderProject}
                  ItemSeparatorComponent={Select.renderSeparator}
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
    ...bindActionCreators(articlesActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Articles);
