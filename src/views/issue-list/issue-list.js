/* @flow */

import {
  View,
  Text,
  FlatList,
  RefreshControl,
  AppState,
  TouchableOpacity
} from 'react-native';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {COLOR_BLACK, COLOR_PINK} from '../../components/variables/variables';
import {notifyError} from '../../components/notification/notification';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';

import IssueRow from './issue-list__row';
import ErrorMessage from '../../components/error-message/error-message';
import Router from '../../components/router/router';
import * as issueActions from './issue-list-actions';
import type Auth from '../../components/auth/auth';
import type Api from '../../components/api/api';
import type {IssuesListState} from './issue-list-reducers';
import type {IssueOnList} from '../../flow/Issue';
import Select from '../../components/select/select';
import SearchPanel from './issue-list__search-panel';
import ModalView from '../../components/modal-view/modal-view';

import {IconAngleDown, IconPlus} from '../../components/icon/icon';
import {isReactElement} from '../../util/util';
import {HIT_SLOP} from '../../components/common-styles/button';

import {headerSeparator} from '../../components/common-styles/navigation';
import styles from './issue-list.styles';

type Props = IssuesListState & typeof issueActions & {
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

  renderCreateIssueButton = () => {
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={styles.createIssueButton}
        onPress={() => Router.CreateIssue()}
      >
        <IconPlus size={28} color={COLOR_PINK}/>
      </TouchableOpacity>
    );
  };



  _renderRow = ({item}) => {
    if (isReactElement(item)) {
      return item;
    }

    return (
      <IssueRow
        key={item.id}
        issue={item}
        onClick={(issue) => this.goToIssue(issue)}
        onTagPress={(query) => Router.IssueList({query})}/>
    );
  };

  getKey = (item: Object) => {
    return `${isReactElement(item) ? item.key : item.id}`;
  };

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

  _renderSeparator = (item) => {
    if (isReactElement(item.leadingItem)) {
      return null;
    }
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

  renderContextButton = () => {
    const {onOpenContextSelect, isRefreshing, searchContext, isSearchContextPinned} = this.props;

    return (
      <TouchableOpacity
        key="issueListContext"
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
            {searchContext && <IconAngleDown color={COLOR_BLACK} size={17}/>}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  renderContextSelect() {
    return (
      <ModalView
        visible
        animationType="fade"
        onRequestClose={() => true}
      >
        <Select
          getTitle={item => item.name}
          {...this.props.selectProps}
        />
      </ModalView>
    );
  }

  searchPanelRef = (instance: ?SearchPanel) => {
    if (instance) {
      this.searchPanelNode = instance;
    }
  };

  onScroll = (nativeEvent: Object) => {
    const newY = nativeEvent.contentOffset.y;
    const isPinned: boolean = newY >= headerSeparator.height;
    if (this.props.isSearchContextPinned !== isPinned) {
      this.props.updateSearchContextPinned(isPinned);
    }
  };

  renderSearchPanel = () => {
    const {query, suggestIssuesQuery, queryAssistSuggestions, onQueryUpdate, issuesCount} = this.props;
    return (
      <SearchPanel
        key="SearchPanel"
        ref={this.searchPanelRef}
        queryAssistSuggestions={queryAssistSuggestions}
        query={query}
        suggestIssuesQuery={suggestIssuesQuery}
        onQueryUpdate={onQueryUpdate}
        issuesCount={issuesCount}
        clearButtonMode="always"
      />
    );
  };

  render() {
    const {issues, isIssuesContextOpen} = this.props;
    const listData: Array<Object> = [
      <View key="issueListContextSeparator" style={headerSeparator}/>,
      this.renderContextButton(),
      this.renderSearchPanel()
    ].concat(issues);

    return (
      <View
        style={styles.listContainer}
        testID="issue-list-page"
      >

        {isIssuesContextOpen && this.renderContextSelect()}

        <FlatList
          stickyHeaderIndices={[1]}
          removeClippedSubviews={false}
          data={listData}
          keyExtractor={this.getKey}
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

        {this.renderCreateIssueButton()}

      </View>
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
    onQueryUpdate: (query) => dispatch(issueActions.onQueryUpdate(query)),
    onOpenContextSelect: () => dispatch(issueActions.openIssuesContextSelect()),
    updateSearchContextPinned: (isSearchScrolledUp) => dispatch(issueActions.updateSearchContextPinned(isSearchScrolledUp))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueList);
