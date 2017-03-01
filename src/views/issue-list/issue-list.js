/* @flow */
import {
  View,
  Text,
  ListView,
  ScrollView,
  RefreshControl,
  Platform,
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
import {notifyError, extractErrorMessage} from '../../components/notification/notification';
import usage from '../../components/usage/usage';

import ApiHelper from '../../components/api/api__helper';
import IssueRow from './issue-list__row';
import Menu from '../../components/menu/menu';
import Router from '../../components/router/router';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import * as issueActions from './issue-list-actions';
import {openMenu} from '../../actions';
import type Auth from '../../components/auth/auth';
import type Api from '../../components/api/api';
import type {IssuesListState} from './issue-list-reducers';
import type {IssueOnList, ServersideSuggestion} from '../../flow/Issue';

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
        Router.SingleIssue({
          issueId: issueId,
          api: this.props.api,
          onUpdate: () => this.props.loadIssues(null)
        });
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
      issueId: issue.id,
      api: this.props.api,
      onUpdate: () => this.props.refreshIssues()
    });
  }

  logOut = () => {
    this.props.cacheIssues([]);
  }

  async getSuggestions(query: string, caret: number): Promise<Array<ServersideSuggestion>>{
    try {
      const res = await this.props.api.getQueryAssistSuggestions(query, caret);
      return res.suggest.items;
    } catch (err) {
      notifyError('Failed to fetch query assist suggestions', err);
      return [];
    }
  }

  onQueryUpdated(query: string) {
    this.props.storeIssuesQuery(query);
    this.props.setIssuesQuery(query);
    this.props.loadIssues(query);
  }

  _renderHeader() {
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text>Create</Text>}
        onBack={this.props.openMenu}
        onRightButtonClick={() => {
          return Router.CreateIssue({
            api: this.props.api,
            onCreate: (createdIssue) => {
              const updatedIssues = ApiHelper.fillIssuesFieldHash([createdIssue]).concat(this.props.issues);
              this.props.receiveIssues(updatedIssues);
            }});
          }
        }
      >
        <Text style={styles.headerText}>Issues</Text>
      </Header>
    );
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      onRefresh={this.props.refreshIssues}
      tintColor={COLOR_PINK}
    />;
  }

  _renderListMessage() {
    const {loadingError, isRefreshing, isListEndReached, isLoadingMore, issues} = this.props;
    if (loadingError) {
      return (<View style={styles.errorContainer}>
        <Text style={styles.listMessageSmile}>{'(>_<)'}</Text>
        <Text style={styles.errorTitle}>Cannot load issues</Text>
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
          <Text style={styles.listFooterMessage}>No issues found</Text>
        </View>
      );
    }

    if (isLoadingMore && !isListEndReached) {
      return <Text style={styles.listFooterMessage}>Loading more issues...</Text>;
    }
  }

  render() {
    const {query, dataSource, loadMoreIssues} = this.props;

    return (
      <Menu onBeforeLogOut={this.logOut}>
        <View style={styles.listContainer}>
          {this._renderHeader()}

          <ListView
            removeClippedSubviews={false}
            dataSource={dataSource}
            enableEmptySections={true}
            renderRow={(issue) => <IssueRow issue={issue} onClick={(issue) => this.goToIssue(issue)}></IssueRow>}
            renderSeparator={(sectionID, rowID) => <View style={styles.separator} key={rowID}/>}
            onEndReached={loadMoreIssues}
            onEndReachedThreshold={30}
            renderScrollComponent={(props) => <ScrollView {...props} refreshControl={this._renderRefreshControl()}/>}
            renderFooter={() => this._renderListMessage()}
            refreshDescription="Refreshing issues"/>

          <QueryAssist
            initialQuery={query}
            dataSource={this.getSuggestions.bind(this)}
            onQueryUpdate={newQuery => this.onQueryUpdated(newQuery)}/>

          {Platform.OS == 'ios' && <KeyboardSpacer style={styles.keyboardSpacer}/>}
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
