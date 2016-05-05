import React, {
  AsyncStorage,
  View,
  Text,
  ListView,
  ScrollView,
  RefreshControl,
  Platform
} from 'react-native'

import openUrlHandler from '../../components/open-url-handler/open-url-handler';
import styles from './issue-list.styles';
import Header from '../../components/header/header';
import QueryAssist from '../../components/query-assist/query-assist';
import {COLOR_PINK} from '../../components/variables/variables';
import Cache from '../../components/cache/cache';

import Api from '../../components/api/api';
import ApiHelper from '../../components/api/api__helper';
import IssueRow from './issue-list__row';
import IssueListMenu from './issue-list__menu';
import Router from '../../components/router/router';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SideMenu from 'react-native-side-menu';

const QUERY_STORAGE_KEY = 'YT_QUERY_STORAGE';
const PAGE_SIZE = 10;
const ISSUES_CACHE_KEY = 'yt_mobile_issues_cache';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

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
      queryAssistValue: '',
      isRefreshing: false
    };

    this.cache.read().then(issues => {
      this.setState({
        issues: issues,
        dataSource: this.state.dataSource.cloneWithRows(issues)
      });
    });
  }

  componentDidMount() {
    this.api = new Api(this.props.auth);
    openUrlHandler(issueId => Router.SingleIssue({
      issueId: issueId,
      api: this.api,
      onUpdate: () => this.loadIssues(null, null, false)
    }));

    this.loadStoredQuery().then(query => this.setQuery(query));
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
      onUpdate: () => this.loadIssues(this.state.queryAssistValue, null, false)
    });
  }

  logOut() {
    return this.props.auth.logOut()
      .then(() => this.cache.store([]))
      .then(() => Router.LogIn());
  }

  loadIssues(text, skip, showLoader = true) {
    if (showLoader) {
      this.setState({isRefreshing: true});
    }

    this.setState({listEndReached: false});

    return this.api.getIssues(text, PAGE_SIZE, skip)
      .then(ApiHelper.fillIssuesFieldHash)
      .then((issues) => {
        this.setState({
          issues: issues,
          dataSource: this.state.dataSource.cloneWithRows(issues),
          isRefreshing: false
        });
        this.cache.store(issues);
      })
      .catch((err) => {
        this.setState({isRefreshing: false});
        console.error('Failed to fetch issues', err);
      });
  }

  updateIssues() {
    return this.loadIssues(this.state.queryAssistValue);
  }

  loadMore() {
    if (this.state.isLoadingMore) {
      return;
    }

    this.setState({isLoadingMore: true});
    const newSkip = this.state.skip + PAGE_SIZE;

    return this.api.getIssues(this.state.queryAssistValue, PAGE_SIZE, newSkip)
      .then(ApiHelper.fillIssuesFieldHash)
      .then((newIssues) => {
        if (!newIssues.length) {
          console.info('Issues list end reached');
          this.setState({listEndReached: true});
          return;
        }
        const updatedIssues = this.state.issues.concat(newIssues);
        this.setState({
          issues: updatedIssues,
          dataSource: this.state.dataSource.cloneWithRows(updatedIssues),
          skip: newSkip
        });
        this.cache.store(updatedIssues);
      })
      .then(() => this.setState({isLoadingMore: false}))
      .catch(() => this.setState({isLoadingMore: false}))
  }

  getSuggestions(query, caret) {
    return this.api.getQueryAssistSuggestions(query, caret)
      .then(res => {
        return res.suggest.items;
      });
  }

  setQuery(query) {
    this.setState({queryAssistValue: query});
    this.loadIssues(query, null, false);
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
        onRightButtonClick={() => Router.CreateIssue({api: this.api, onCreate: () => this.loadIssues(this.state.queryAssistValue, null, false)})}
      >
        <Text>Sort by: Updated</Text>
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
    if (!this.state.isRefreshing && !this.state.isLoadingMore && this.state.issues.length === 0) {
      return <Text style={styles.loadingMore}>No issues found</Text>
    }

    if (this.state.isLoadingMore && !this.state.listEndReached) {
      return <Text style={styles.loadingMore}>Loading more issues...</Text>
    }
  }

  render() {
    return (<SideMenu menu={<IssueListMenu onLogOut={this.logOut.bind(this)}/>} isOpen={this.state.showMenu}>
      <View style={styles.listContainer}>
        {this._renderHeader()}
        <ListView
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
    </SideMenu>);
  }
}

export default IssueList;
