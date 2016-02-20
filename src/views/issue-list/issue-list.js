import React, {AsyncStorage, View, Text, TouchableOpacity, ListView, ScrollView, TextInput, LayoutAnimation, DeviceEventEmitter, RefreshControl} from 'react-native'

import styles from './issue-list.styles';
import Header from '../../components/header/header';
import {COLOR_PINK} from '../../components/variables/variables';
import Cache from '../../components/cache/cache';

import Api from '../../components/api/api';
import ApiHelper from '../../components/api/api__helper';
import IssueRow from './issue-list__row';
import SearchesList from './issue-list__search-list';
import {Actions} from 'react-native-router-flux';

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

            isRefreshing: false,
            displayCancelSearch: false,
            keyboardSpace: 0,
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
        this.loadStoredQuery().then(query => this.setQuery(query));
        this._unsubscribeKeyShow = DeviceEventEmitter.addListener('keyboardWillShow', this._updateKeyboardSpace.bind(this))
        this._unsubscribeKeyHide = DeviceEventEmitter.addListener('keyboardWillHide', this._resetKeyboardSpace.bind(this))
    }

    componentWillUnmount() {
        this._unsubscribeKeyShow.remove();
        this._unsubscribeKeyHide.remove();
    }

    _updateKeyboardSpace(e) {
        const spacing = 110; //TODO: calculate it in runtime
        LayoutAnimation.configureNext(animations.layout.spring);
        this.setState({
            keyboardSpace: e.endCoordinates.height,
            searchListHeight: e.endCoordinates.screenY - spacing,
            displayCancelSearch: true
        });
    }

    _resetKeyboardSpace() {
        LayoutAnimation.configureNext(animations.layout.spring);
        this.setState({
            keyboardSpace: 0,
            searchListHeight: 0,
            displayCancelSearch: false
        });
    }

    storeQuery(query) {
        return AsyncStorage.setItem(QUERY_STORAGE_KEY, query);
    }

    loadStoredQuery() {
        return AsyncStorage.getItem(QUERY_STORAGE_KEY);
    }

    goToIssue(issue) {
        Actions.SingleIssue({
            issueId: issue.id,
            api: this.api
        });
    }

    logOut() {
        this.props.auth.logOut()
            .then(() => Actions.LogIn());
    }

    loadIssues(text, skip) {
        this.setState({isRefreshing: true});

        return this.api.getIssues(text, PAGE_SIZE, skip)
            .then(ApiHelper.fillIssuesFieldHash)
            .then((issues) => {
                this.setState({
                    issues: issues,
                    dataSource: this.state.dataSource.cloneWithRows(issues),
                    isRefreshing: false
                });
                this.cache.store(issues);
                console.log('Issues', issues);
            })
            .catch((err) => {
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
                    return;
                }
                const updatedIssues = this.state.issues.concat(newIssues);
                this.setState({
                    issues: updatedIssues,
                    dataSource: this.state.dataSource.cloneWithRows(updatedIssues),
                    skip: newSkip
                });
                this.cache.store(updatedIssues);
                console.log('More issues loaded', newIssues);
            })
            .then(() => this.setState({isLoadingMore: false}))
            .catch(() => this.setState({isLoadingMore: false}))
    }

    cancelSearch() {
        this.refs.searchInput.blur();
    }

    getIssueFolders() {
        return this.api.getIssueFolders()
            .then((res) => {
                console.log('IssueFolders', res);
                return res;
            })
    }

    setQuery(query) {
        this.setState({input: query});
        this.loadIssues(query);
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
                onRightButtonClick={() => Actions.CreateIssue({api: this.api})}
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

    render() {
        let searchContainer;
        if (this.state.searchListHeight) {
            searchContainer = <View ref="searchContainer" style={{height: this.state.searchListHeight}}>
                <SearchesList getIssuesFolder={this.getIssueFolders.bind(this)} onAddQuery={this.onQueryUpdated.bind(this)}></SearchesList>
            </View>
        }

        return (<View style={styles.listContainer}>
            {this._renderHeader()}

            {searchContainer}

                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={(issue) => <IssueRow issue={issue} onClick={(issue) => this.goToIssue(issue)}></IssueRow>}
                    renderSeparator={(sectionID, rowID) => <View style={styles.separator} key={rowID}/>}
                    onEndReached={this.loadMore.bind(this)}
                    onEndReachedThreshold={10}
                    renderScrollComponent={(props) => <ScrollView {...props} refreshControl={this._renderRefreshControl()}/>}
                    refreshDescription="Refreshing issues"/>

            {this._renderFooter()}

            <View style={{height: this.state.keyboardSpace}}></View>
        </View>);
    }
}

const animations = {
    layout: {
        spring: {
            duration: 400,
            create: {
                duration: 300,
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            },
            update: {
                type: LayoutAnimation.Types.spring,
                springDamping: 400
            }
        }
    }
};

module.exports = IssueList;
