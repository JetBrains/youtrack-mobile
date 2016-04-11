import React, {
  AsyncStorage,
  View,
  Text,
  TouchableOpacity,
  ListView,
  ScrollView,
  TextInput,
  RefreshControl,
  Platform
} from 'react-native'

import openUrlHandler from '../../components/open-url-handler/open-url-handler';
import styles from './issue-list.styles';
import Header from '../../components/header/header';
import {COLOR_PINK} from '../../components/variables/variables';
import Cache from '../../components/cache/cache';

import Api from '../../components/api/api';
import ApiHelper from '../../components/api/api__helper';
import IssueRow from './issue-list__row';
// import SearchesList from './issue-list__search-list';
import Router from '../../components/router/router';
import KeyboardSpacer from 'react-native-keyboard-spacer';

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

      isRefreshing: false,
      displayCancelSearch: false,
      searchListHeight: 0
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
      onUpdate: () => this.loadIssues(null, null, false)
    });
  }

  logOut() {
    this.props.auth.logOut()
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
    return this.loadIssues(this.state.input);
  }

  loadMore() {
    if (this.state.isLoadingMore) {
      return;
    }

    this.setState({isLoadingMore: true});
    const newSkip = this.state.skip + PAGE_SIZE;

    return this.api.getIssues(this.state.input, PAGE_SIZE, newSkip)
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

  cancelSearch() {
    this.refs.searchInput.blur();
  }

  getIssueFolders() {
    return this.api.getIssueFolders();
  }

  setQuery(query) {
    this.setState({input: query});
    this.loadIssues(query, null, false);
  }

  onQueryUpdated(query) {
    this.storeQuery(query);
    this.setQuery(query);
    this.cancelSearch();
  }

  _renderHeader() {
    return (
      <Header
        leftButton={<Text>Log Out</Text>}
        rightButton={<Text>Create</Text>}
        onBack={this.logOut.bind(this)}
        onRightButtonClick={() => Router.CreateIssue({api: this.api, onCreate: () => this.loadIssues(null, null, false)})}
      >
        <Text>Sort by: Updated</Text>
      </Header>
    );
  }

  _renderFooter() {
    let cancelButton = null;
    if (this.state.displayCancelSearch) {
      cancelButton = <TouchableOpacity
        style={styles.cancelSearch}
        onPress={this.cancelSearch.bind(this)}
        underlayColor="#2CB8E6">
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>;
    }

    return (
      <View style={styles.inputWrapper}>
        <TextInput
          ref="searchInput"
          placeholder="Enter query"
          clearButtonMode="always"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={(e) => this.onQueryUpdated(e.nativeEvent.text)}
          style={[styles.searchInput]}
          value={this.state.input}
          onChangeText={(text) => this.setState({input: text})}
        />
        {cancelButton}
      </View>
    );
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.state.isRefreshing}
      onRefresh={this.updateIssues.bind(this)}
      tintColor={COLOR_PINK}
    />;
  }

  _renderLoadMoreMessage() {
    if (!this.state.isLoadingMore || this.state.listEndReached) {
      return;
    }
    return <Text style={styles.loadingMore}>Loading more issues...</Text>
  }

  render() {
    // let searchContainer;
    // if (this.state.searchListHeight) {
    //   searchContainer = <View ref="searchContainer" style={[styles.searchSuggestions, {bottom: this.state.keyboardSpace}]}>
    //     <SearchesList getIssuesFolder={this.getIssueFolders.bind(this)}
    //                   onAddQuery={this.onQueryUpdated.bind(this)}></SearchesList>
    //   </View>
    // }

    return (<View style={styles.listContainer}>
      {this._renderHeader()}
      <ListView
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        renderRow={(issue) => <IssueRow issue={issue} onClick={(issue) => this.goToIssue(issue)}></IssueRow>}
        renderSeparator={(sectionID, rowID) => <View style={styles.separator} key={rowID}/>}
        onEndReached={this.loadMore.bind(this)}
        onEndReachedThreshold={30}
        renderScrollComponent={(props) => <ScrollView {...props} refreshControl={this._renderRefreshControl()}/>}
        renderFooter={() => this._renderLoadMoreMessage()}
        refreshDescription="Refreshing issues"/>

      {/*searchContainer*/}

      {this._renderFooter()}

      {Platform.OS == 'ios' && <KeyboardSpacer onToggle={(opened) => this.setState({displayCancelSearch: opened})}/>}
    </View>);
  }
}

export default IssueList;
