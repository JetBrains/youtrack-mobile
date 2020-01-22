/* @flow */

import {
  View,
  Text,
  FlatList,
  RefreshControl,
  AppState,
  Modal,
  TouchableOpacity
} from 'react-native';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Header from '../../components/header/header';
import {COLOR_PINK, UNIT} from '../../components/variables/variables';
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
import Select from '../../components/select/select';
import Icon from 'react-native-vector-icons/FontAwesome';
import SearchPanel from './issue-list__search-panel';

import styles from './issue-list.styles';

type Props = IssuesListState & typeof issueActions & {
  openMenu: typeof openMenu,
  auth: Auth,
  api: Api,
  overridenQuery: ?string,
  onOpenContextSelect: () => any
};

export class IssueList extends Component<Props, void> {
  searchPanelNode: Object;

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

  _renderHeader() {
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text>Create</Text>}
        extraButton={<OpenScanButton/>}
        onBack={this.props.openMenu}
        onRightButtonClick={() => Router.CreateIssue()}
      >
      </Header>
    );
  }

  _renderRow = ({item}) => {
    return (
      <IssueRow
        key={item.id}
        issue={item}
        onClick={(issue) => this.goToIssue(issue)}
        onTagPress={(query) => Router.IssueList({query})}/>
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

  renderContextButton() {
    const {onOpenContextSelect, isRefreshing, searchContext, isSearchContextPinned} = this.props;

    return (
      <TouchableOpacity
        style={[
          styles.searchContext,
          isSearchContextPinned ? styles.searchContextPinned : null
        ]}
        disabled={isRefreshing || !searchContext}
        onPress={onOpenContextSelect}
      >
        <View
          style={styles.searchContextButton}
        >
          <Text
            numberOfLines={1}
            style={styles.contextButtonText}
          >
            {`${searchContext?.name || ''} `}
            {searchContext && <Icon name="angle-down" size={20}/>}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }


  renderContextSelect() {
    return (
      <Modal
        visible
        animationType="fade"
        onRequestClose={() => true}
      >
        <Select
          style={styles.contextSelect}
          getTitle={item => item.name}
          {...this.props.selectProps}
        />
      </Modal>
    );
  }

  searchPanelRef = (instance: ?SearchPanel) => {
    if (instance) {
      this.searchPanelNode = instance;
    }
  };

  onScroll = (nativeEvent: Object) => {
    const newY = nativeEvent.contentOffset.y;
    this.props.updateSearchContextPinned(newY >= UNIT / 2);
  };

  render() {
    const {
      query, issues, suggestIssuesQuery, queryAssistSuggestions, isIssuesContextOpen, onQueryUpdate, issuesCount
    } = this.props;

    return (
      <Menu>
        <View style={styles.listContainer} testID="issue-list-page">
          {this._renderHeader()}

          {this.renderContextButton()}
          {isIssuesContextOpen && this.renderContextSelect()}

          <FlatList
            ListHeaderComponent={
              <SearchPanel
                ref={this.searchPanelRef}
                queryAssistSuggestions={queryAssistSuggestions}
                query={query}
                suggestIssuesQuery={suggestIssuesQuery}
                onQueryUpdate={onQueryUpdate}
                issuesCount={issuesCount}
              />
            }
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
            onScroll={(params) => this.onScroll(params.nativeEvent)}
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
    overridenQuery: ownProps.query,
    searchContext: state.app?.user?.profiles?.general?.searchContext
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    openMenu: () => dispatch(openMenu()),
    onQueryUpdate: (query) => dispatch(issueActions.onQueryUpdate(query)),
    onOpenContextSelect: () => dispatch(issueActions.openIssuesContextSelect()),
    updateSearchContextPinned: (isSearchScrolledUp) => dispatch(issueActions.updateSearchContextPinned(isSearchScrolledUp))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueList);
