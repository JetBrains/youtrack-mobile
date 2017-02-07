import {
  AsyncStorage,
  View,
  Text,
  ListView,
  ScrollView,
  RefreshControl,
  Platform,
  TouchableOpacity,
  AppState
} from 'react-native';
import React from 'react';

import openByUrlDetector from '../../components/open-url-handler/open-url-handler';
import styles from './issue-list.styles';
import Header from '../../components/header/header';
import QueryAssist from '../../components/query-assist/query-assist';
import {COLOR_PINK} from '../../components/variables/variables';
import Cache from '../../components/cache/cache';
import {notifyError, resolveError, extractErrorMessage} from '../../components/notification/notification';
import usage from '../../components/usage/usage';

import Api from '../../components/api/api';
import ApiHelper from '../../components/api/api__helper';
import IssueRow from './issue-list__row';
import Menu from '../../components/menu/menu';
import Router from '../../components/router/router';
import KeyboardSpacer from 'react-native-keyboard-spacer';

const QUERY_STORAGE_KEY = 'YT_QUERY_STORAGE';
const PAGE_SIZE = 10;
const ISSUES_CACHE_KEY = 'yt_mobile_issues_cache';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class IssueList extends React.Component {

  constructor() {
    super();
    this.cache = new Cache(ISSUES_CACHE_KEY);

    this.state = {
      issues: [],
      dataSource: ds.cloneWithRows([]),
      skip: 0,
      isLoadingMore: false,
      listEndReached: false,

      showMenu: false,
      loadingError: null,
      queryAssistValue: '',
      isInitialized: false,
      isRefreshing: false
    };

    this.cache.read().then(issues => {
      this.setState({
        issues: issues,
        dataSource: this.state.dataSource.cloneWithRows(issues)
      });
    });

    this._handleAppStateChange = this._handleAppStateChange.bind(this);
    usage.trackScreenView('Issue list');
  }

  _handleAppStateChange(newState) {
    if (newState === 'active') {
      this.loadIssues(this.state.queryAssistValue);
    }
  }

  componentDidMount() {
    this.api = new Api(this.props.auth);
    this.unsubscribeFromOpeningWithIssueUrl = openByUrlDetector(
      this.props.auth.config.backendUrl,
      (issueId) => {
        usage.trackEvent('Issue list', 'Open issue in app by URL');
        Router.SingleIssue({
          issueId: issueId,
          api: this.api,
          onUpdate: () => this.loadIssues(null)
        });
      },
      (issuesQuery) => {
        this.onQueryUpdated(issuesQuery);
      });

    if (this.props.query) {
      this.setQuery(this.props.query);
    } else {
      this.loadStoredQuery().then(query => this.setQuery(query));
    }

    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    this.unsubscribeFromOpeningWithIssueUrl();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  storeQuery(query) {
    return AsyncStorage.setItem(QUERY_STORAGE_KEY, query);
  }

  loadStoredQuery() {
    return AsyncStorage.getItem(QUERY_STORAGE_KEY);
  }

  goToIssue(issue) {
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id,
      api: this.api,
      onUpdate: () => this.loadIssues(this.state.queryAssistValue)
    });
  }

  logOut() {
    return this.props.auth.logOut()
      .then(() => this.cache.store([]))
      .then(() => Router.EnterServer({serverUrl: this.props.auth.config.backendUrl}));
  }

  loadIssues(text) {
    this.setState({loadingError: null, listEndReached: false, isRefreshing: true, skip: 0});

    return this.api.getIssues(text, PAGE_SIZE)
      .then(ApiHelper.fillIssuesFieldHash)
      .then((issues) => {
        this.setState({
          issues: issues,
          dataSource: this.state.dataSource.cloneWithRows(issues),
          isRefreshing: false,
          isInitialized: true,
          listEndReached: issues.length < PAGE_SIZE
        });
        this.cache.store(issues);
      })
      .catch((err) => {
        return resolveError(err)
          .then(resolvedErr => {
            this.setState({
              isRefreshing: false,
              isInitialized: true,
              listEndReached: true,
              loadingError: resolvedErr,
              dataSource: this.state.dataSource.cloneWithRows([])
            });
          });
      });
  }

  updateIssues() {
    return this.loadIssues(this.state.queryAssistValue);
  }

  loadMore() {
    if (!this.state.isInitialized || this.state.isLoadingMore || this.state.isRefreshing || this.state.loadingError || this.state.listEndReached) {
      return;
    }

    this.setState({isLoadingMore: true});
    const newSkip = this.state.skip + PAGE_SIZE;

    return this.api.getIssues(this.state.queryAssistValue, PAGE_SIZE, newSkip)
      .then(ApiHelper.fillIssuesFieldHash)
      .then((newIssues) => {
        const updatedIssues = this.state.issues.concat(newIssues);
        this.setState({
          issues: updatedIssues,
          dataSource: this.state.dataSource.cloneWithRows(updatedIssues),
          skip: newSkip,
          listEndReached: newIssues.length < PAGE_SIZE
        });
        this.cache.store(updatedIssues);
      })
      .then(() => this.setState({isLoadingMore: false}))
      .catch((err) => {
        this.setState({isLoadingMore: false});
        return notifyError('Failed to fetch more issues', err);
      });
  }

  formatErrorMessage(error) {
    return extractErrorMessage(error);
  }

  getSuggestions(query, caret) {
    return this.api.getQueryAssistSuggestions(query, caret)
      .then(res => {
        return res.suggest.items;
      })
      .catch(err => notifyError('Failed to fetch query assist suggestions', err));
  }

  setQuery(query) {
    this.setState({queryAssistValue: query});
    this.loadIssues(query);
  }

  onQueryUpdated(query) {
    this.storeQuery(query);
    this.setQuery(query);
  }

  _renderHeader() {
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text>Create</Text>}
        onBack={() => this.setState({showMenu: true})}
        onRightButtonClick={() => {
          return Router.CreateIssue({
            api: this.api,
            onCreate: (createdIssue) => {
              const updatedIssues = ApiHelper.fillIssuesFieldHash([createdIssue]).concat(this.state.issues);
              this.setState({
                dataSource: this.state.dataSource.cloneWithRows(updatedIssues)
              });
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
      refreshing={this.state.isRefreshing}
      onRefresh={this.updateIssues.bind(this)}
      tintColor={COLOR_PINK}
    />;
  }

  _renderListMessage() {
    if (this.state.loadingError) {
      return (<View style={styles.errorContainer}>
        <Text style={styles.listMessageSmile}>{'(>_<)'}</Text>
        <Text style={styles.errorTitle}>Cannot load issues</Text>
        <Text style={styles.errorContent}>{this.formatErrorMessage(this.state.loadingError)}</Text>
        <TouchableOpacity style={styles.tryAgainButton} onPress={() => this.loadIssues(this.state.queryAssistValue)}>
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>);
    }
    if (!this.state.isRefreshing && !this.state.isLoadingMore && this.state.issues.length === 0) {
      return (
        <View>
          <Text style={styles.listMessageSmile}>(・_・)</Text>
          <Text style={styles.listFooterMessage}>No issues found</Text>
        </View>
      );
    }

    if (this.state.isLoadingMore && !this.state.listEndReached) {
      return <Text style={styles.listFooterMessage}>Loading more issues...</Text>;
    }
  }

  render() {
    return <Menu
      show={this.state.showMenu}
      auth={this.props.auth}
      onLogOut={this.logOut.bind(this)}
      onOpen={() => this.setState({showMenu: true})}
      onClose={() => this.setState({showMenu: false})}
    >
      <View style={styles.listContainer}>
        {this._renderHeader()}

        <ListView
          removeClippedSubviews={false}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(issue) => <IssueRow issue={issue} onClick={(issue) => this.goToIssue(issue)}></IssueRow>}
          renderSeparator={(sectionID, rowID) => <View style={styles.separator} key={rowID}/>}
          onEndReached={this.loadMore.bind(this)}
          onEndReachedThreshold={30}
          renderScrollComponent={(props) => <ScrollView {...props} refreshControl={this._renderRefreshControl()}/>}
          renderFooter={() => this._renderListMessage()}
          refreshDescription="Refreshing issues"/>

        <QueryAssist
          initialQuery={this.state.queryAssistValue}
          dataSource={this.getSuggestions.bind(this)}
          onQueryUpdate={newQuery => this.onQueryUpdated(newQuery)}/>

        {Platform.OS == 'ios' && <KeyboardSpacer/>}
      </View>
    </Menu>;
  }
}

export default IssueList;
