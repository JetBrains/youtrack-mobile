/* @flow */
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  AppState
} from 'react-native';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import openByUrlDetector from '../../components/open-url-handler/open-url-handler';
import styles from './issue-list.styles';
import Header from '../../components/header/header';
import QueryAssist from '../../components/query-assist/query-assist';
import {COLOR_PINK} from '../../components/variables/variables';
import {extractErrorMessage} from '../../components/notification/notification';
import usage from '../../components/usage/usage';

import IssueRow from './issue-list__row';
import Menu from '../../components/menu/menu';
import Router from '../../components/router/router';
import * as issueActions from './issue-list-actions';
import {openMenu} from '../../actions';
import type Auth from '../../components/auth/auth';
import type Api from '../../components/api/api';
import type {IssuesListState} from './issue-list-reducers';
import type {IssueOnList} from '../../flow/Issue';

type Props = IssuesListState & {
  openMenu: openMenu,
  auth: Auth,
  api: Api
};

export class IssueList extends Component {
  props: Props;
  unsubscribeFromOpeningWithIssueUrl: () => any
  constructor() {
    super();
    usage.trackScreenView('Issue list');
  }

  _handleAppStateChange = (newState) => {
    if (newState === 'active') {
      this.props.refreshIssues();
    }
  }

  componentDidMount() {
    this.unsubscribeFromOpeningWithIssueUrl = openByUrlDetector(
      this.props.auth.config.backendUrl,
      (issueId) => {
        usage.trackEvent('Issue list', 'Open issue in app by URL');
        Router.SingleIssue({issueId});
      },
      (issuesQuery) => {
        this.onQueryUpdated(issuesQuery);
      });

    this.props.initializeIssuesList();

    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    this.unsubscribeFromOpeningWithIssueUrl();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  goToIssue(issue: IssueOnList) {
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  }

  logOut = () => {
    this.props.cacheIssues([]);
  }

  onQueryUpdated = (query: string) => {
    this.props.storeIssuesQuery(query);
    this.props.setIssuesQuery(query);
    this.props.clearAssistSuggestions();
    this.props.loadIssues(query);
  }

  _renderHeader() {
    const {issuesCount} = this.props;
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text>Create</Text>}
        onBack={this.props.openMenu}
        onRightButtonClick={() => Router.CreateIssue()}
      >
        <Text style={styles.headerText}>
          {issuesCount}{' '}Issues
        </Text>
      </Header>
    );
  }

  _renderRow = ({item}) => {
    return (
      <IssueRow key={item.id} issue={item} onClick={(issue) => this.goToIssue(issue)}></IssueRow>
    );
  };

  _getIssueId = issue => issue.id;

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      onRefresh={this.props.refreshIssues}
      tintColor={COLOR_PINK}
      testID="refresh-control"
    />;
  }

  _renderSeparator = () => {
    return <View style={styles.separator}/>;
  };

  _renderListMessage = () => {
    const {loadingError, isRefreshing, isListEndReached, isLoadingMore, issues} = this.props;
    if (loadingError) {
      return (<View style={styles.errorContainer}>
        <Text style={styles.listMessageSmile}>{'(>_<)'}</Text>
        <Text style={styles.errorTitle} testID="cannot-load-message">Cannot load issues</Text>
        <Text style={styles.errorContent}>{extractErrorMessage(loadingError)}</Text>
        <TouchableOpacity style={styles.tryAgainButton} onPress={() => this.props.refreshIssues()}>
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>);
    }
    if (!isRefreshing && !isLoadingMore && issues.length === 0) {
      return (
        <View>
          <Text style={styles.listMessageSmile}>(・_・)</Text>
          <Text style={styles.listFooterMessage} testID="no-issues">No issues found</Text>
        </View>
      );
    }

    if (isLoadingMore && !isListEndReached) {
      return <Text style={styles.listFooterMessage}>Loading more issues...</Text>;
    }
    return null;
  };

  render() {
    const {query, issues, loadMoreIssues, suggestIssuesQuery, queryAssistSuggestions} = this.props;

    return (
      <Menu onBeforeLogOut={this.logOut}>
        <View style={styles.listContainer} testID="issue-list-page">
          {this._renderHeader()}

          <FlatList
            removeClippedSubviews={false}
            data={issues}
            keyExtractor={this._getIssueId}
            renderItem={this._renderRow}
            refreshControl={this._renderRefreshControl()}
            tintColor={COLOR_PINK}
            ItemSeparatorComponent={this._renderSeparator}
            ListFooterComponent={this._renderListMessage}
            onEndReached={loadMoreIssues}
            onEndReachedThreshold={0.1}
            testID="issue-list"
          />

          <QueryAssist
            suggestions={queryAssistSuggestions}
            currentQuery={query}
            onChange={suggestIssuesQuery}
            onSetQuery={this.onQueryUpdated}/>
        </View>
      </Menu>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.issueList,
    ...state.app
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    openMenu: () => dispatch(openMenu())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueList);
