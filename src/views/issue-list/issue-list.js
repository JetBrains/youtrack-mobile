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
import React from 'react';
import {connect} from 'react-redux';

import openByUrlDetector from '../../components/open-url-handler/open-url-handler';
import styles from './issue-list.styles';
import Header from '../../components/header/header';
import QueryAssist from '../../components/query-assist/query-assist';
import {COLOR_PINK} from '../../components/variables/variables';
import Cache from '../../components/cache/cache';
import {notifyError, resolveError, extractErrorMessage} from '../../components/notification/notification';
import usage from '../../components/usage/usage';

import ApiHelper from '../../components/api/api__helper';
import IssueRow from './issue-list__row';
import Menu from '../../components/menu/menu';
import Router from '../../components/router/router';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import * as issueActions from './issue-list-actions';
import {logOut} from '../../actions';

const PAGE_SIZE = 10;
const ISSUES_CACHE_KEY = 'yt_mobile_issues_cache';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export class IssueList extends React.Component {

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
      this.loadIssues(this.props.query);
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
          onUpdate: () => this.loadIssues(null)
        });
      },
      (issuesQuery) => {
        this.onQueryUpdated(issuesQuery);
      });

    this.props.loadQuery();
    //TODO: remove after move to redux
    setTimeout(() => this.loadIssues(this.props.query), 100);

    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    this.unsubscribeFromOpeningWithIssueUrl();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  goToIssue(issue) {
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id,
      api: this.props.api,
      onUpdate: () => this.loadIssues(this.props.query)
    });
  }

  logOut() {
    this.props.onLogOut();
    this.cache.store([]);
    Router.EnterServer({serverUrl: this.props.auth.config.backendUrl});
  }

  loadIssues(text) {
    this.setState({loadingError: null, listEndReached: false, isRefreshing: true, skip: 0});

    return this.props.api.getIssues(text, PAGE_SIZE)
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
    return this.loadIssues(this.props.query);
  }

  loadMore() {
    const {query} = this.props;
    const {isInitialized, isLoadingMore, isRefreshing, loadingError, listEndReached, skip, issues, dataSource} = this.state;
    if (!isInitialized || isLoadingMore || isRefreshing || loadingError || listEndReached) {
      return;
    }

    this.setState({isLoadingMore: true});
    const newSkip = skip + PAGE_SIZE;

    return this.props.api.getIssues(query, PAGE_SIZE, newSkip)
      .then(ApiHelper.fillIssuesFieldHash)
      .then((newIssues) => {
        const updatedIssues = issues.concat(newIssues);
        this.setState({
          issues: updatedIssues,
          dataSource: dataSource.cloneWithRows(updatedIssues),
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

  getSuggestions(query, caret) {
    return this.props.api.getQueryAssistSuggestions(query, caret)
      .then(res => {
        return res.suggest.items;
      })
      .catch(err => notifyError('Failed to fetch query assist suggestions', err));
  }

  onQueryUpdated(query) {
    this.props.storeQuery(query);
    this.props.setQuery(query);
    this.loadIssues(query);
  }

  _renderHeader() {
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text>Create</Text>}
        onBack={() => this.setState({showMenu: true})}
        onRightButtonClick={() => {
          return Router.CreateIssue({
            api: this.props.api,
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
        <Text style={styles.errorContent}>{extractErrorMessage(this.state.loadingError)}</Text>
        <TouchableOpacity style={styles.tryAgainButton} onPress={() => this.loadIssues(this.props.query)}>
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
    const {auth, query} = this.props;
    const {showMenu, dataSource} = this.state;

    return <Menu
      show={showMenu}
      auth={auth}
      issueQuery={query}
      onLogOut={this.logOut.bind(this)}
      onOpen={() => this.setState({showMenu: true})}
      onClose={() => this.setState({showMenu: false})}
    >
      <View style={styles.listContainer}>
        {this._renderHeader()}

        <ListView
          removeClippedSubviews={false}
          dataSource={dataSource}
          enableEmptySections={true}
          renderRow={(issue) => <IssueRow issue={issue} onClick={(issue) => this.goToIssue(issue)}></IssueRow>}
          renderSeparator={(sectionID, rowID) => <View style={styles.separator} key={rowID}/>}
          onEndReached={this.loadMore.bind(this)}
          onEndReachedThreshold={30}
          renderScrollComponent={(props) => <ScrollView {...props} refreshControl={this._renderRefreshControl()}/>}
          renderFooter={() => this._renderListMessage()}
          refreshDescription="Refreshing issues"/>

        <QueryAssist
          initialQuery={query}
          dataSource={this.getSuggestions.bind(this)}
          onQueryUpdate={newQuery => this.onQueryUpdated(newQuery)}/>

        {Platform.OS == 'ios' && <KeyboardSpacer/>}
      </View>
    </Menu>;
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
    setQuery: (query) => dispatch(issueActions.setIssuesQuery(query)),
    storeQuery: (query) => dispatch(issueActions.storeIssuesQuery(query)),
    loadQuery: () => dispatch(issueActions.readStoredIssuesQuery()),
    onLogOut: () => dispatch(logOut()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueList);
