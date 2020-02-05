/* @flow */
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  AppState
} from 'react-native';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import styles from './issue-list.styles';
import Header from '../../components/header/header';
import QueryAssist from '../../components/query-assist/query-assist';
import {COLOR_PINK} from '../../components/variables/variables';
import {notifyError} from '../../components/notification/notification';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';

import IssueRow from './issue-list__row';
import Menu from '../../components/menu/menu';
import ErrorMessage from '../../components/error-message/error-message';
import Router from '../../components/router/router';
import * as issueActions from './issue-list-actions';
import {openMenu} from '../../actions/app-actions';
import type Auth from '../../components/auth/auth';
import type Api from '../../components/api/api';
import type {IssuesListState} from './issue-list-reducers';
import type {IssueOnList} from '../../flow/Issue';
import OpenScanButton from '../../components/scan/open-scan-button';
import MenuIcon from '../../components/menu/menu-icon';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = IssuesListState & typeof issueActions & {
  openMenu: typeof openMenu,
  auth: Auth,
  api: Api,
  overridenQuery: ?string
};

export class IssueList extends Component<Props, void> {
  unsubscribeFromOpeningWithIssueUrl: () => any;
  constructor() {
    super();
    usage.trackScreenView('Issue list');
  }

  _handleAppStateChange = (newState) => {
    if (newState === 'active') {
      this.props.refreshIssues();
    }
  };

  componentDidMount() {
    this.props.initializeIssuesList(this.props.overridenQuery);

    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  goToIssue(issue: IssueOnList) {
    log.debug(`Opening issue "${issue.id}" from list`);
    if (!issue.id) {
      log.warn('Attempt to open bad issue', issue);
      notifyError('Can\'t open issue', new Error('Attempt to open issue without ID'));
      return;
    }
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  }

  onQueryUpdated = (query: string) => {
    this.props.storeIssuesQuery(query);
    this.props.setIssuesQuery(query);
    this.props.clearAssistSuggestions();
    this.props.loadIssues(query);
  };

  _renderHeader() {
    const {issuesCount} = this.props;
    return (
      <Header
        leftButton={<Text>{' '}<MenuIcon/></Text>}
        rightButton={<Icon name="plus" size={28}/>}
        extraButton={<OpenScanButton/>}
        onBack={this.props.openMenu}
        onRightButtonClick={() => Router.CreateIssue()}
      >
        <Text style={styles.headerText}>
          {issuesCount}{' '}{issuesCount === 1 ? 'Issue' : 'Issues'}
        </Text>
      </Header>
    );
  }

  _renderRow = ({item}) => {
    return (
      <IssueRow
        key={item.id}
        issue={item}
        onClick={(issue) => this.goToIssue(issue)}
        onTagPress={(query) => Router.IssueList({query})} />
    );
  };

  _getIssueId = issue => issue.id;

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      onRefresh={() => {
        this.props.refreshIssues();
      }}
      tintColor={COLOR_PINK}
      testID="refresh-control"
    />;
  }

  _renderSeparator = () => {
    return <View style={styles.separator}/>;
  };

  _renderListMessage = () => {
    const {loadingError, refreshIssues, isRefreshing, isListEndReached, isLoadingMore, issues} = this.props;
    if (loadingError) {
      return <ErrorMessage error={loadingError} onTryAgain={refreshIssues}/>;
    }
    if (!isRefreshing && !isLoadingMore && issues?.length === 0) {
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

  onEndReached = () => {
    this.props.loadMoreIssues();
  };

  render() {
    const {query, issues, suggestIssuesQuery, queryAssistSuggestions} = this.props;

    return (
      <Menu>
        <View style={styles.listContainer} testID="issue-list-page">
          {this._renderHeader()}

          <QueryAssist
            suggestions={queryAssistSuggestions}
            currentQuery={query}
            onChange={suggestIssuesQuery}
            onSetQuery={this.onQueryUpdated}/>

          <FlatList
            removeClippedSubviews={false}
            data={issues}
            keyExtractor={this._getIssueId}
            renderItem={this._renderRow}
            refreshControl={this._renderRefreshControl()}
            tintColor={COLOR_PINK}
            ItemSeparatorComponent={this._renderSeparator}
            ListFooterComponent={this._renderListMessage}
            onEndReached={this.onEndReached}
            onEndReachedThreshold={0.1}
            testID="issue-list"
          />

        </View>
      </Menu>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.issueList,
    ...state.app,
    overridenQuery: ownProps.query
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    openMenu: () => dispatch(openMenu())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueList);
