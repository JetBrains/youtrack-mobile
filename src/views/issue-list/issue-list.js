import React, {AsyncStorage, View, Text, TouchableOpacity, ListView, ScrollView, TextInput, LayoutAnimation, DeviceEventEmitter, RefreshControl} from 'react-native'

import styles from './issue-list.styles';
import headerStyles from '../../components/header/header.styles';
import {COLOR_PINK} from '../../components/variables/variables';

import Api from '../../components/api/api';
import ApiHelper from '../../components/api/api__helper';
import IssueRow from './issue-list__row';
import SearchesList from './issue-list__search-list';
import {Actions} from 'react-native-router-flux';

const QUERY_STORAGE_KEY = 'YT_QUERY_STORAGE';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class IssueList extends React.Component {

    constructor() {
        super();
        this.state = {
            displayCancelSearch: false,
            isuesCount: 0,
            dataSource: ds.cloneWithRows([]),
            keyboardSpace: 0,
            searchListHeight: 0
        };
    }

    componentDidMount() {
        this.api = new Api(this.props.auth);
        this.loadStoredQuery().then(query => this.setQuery(query));

        DeviceEventEmitter.addListener('keyboardWillShow', this._updateKeyboardSpace.bind(this))
        DeviceEventEmitter.addListener('keyboardWillHide', this._resetKeyboardSpace.bind(this))
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
            .then(() => Actions.pop())
            .then(() => this.props.onLogOut());
    }

    loadIssues(text) {
        this.setState({isRefreshing: true});

        return this.api.getIssues(text)
            .then(ApiHelper.fillIssuesFieldHash)
            .then((issues) => {
                this.setState({
                    dataSource: ds.cloneWithRows(issues),
                    isuesCount: issues.length,
                    isRefreshing: false
                });
                console.log('Issues', issues);
            })
            .catch((err) => {
                console.error('Failed to fetch issues', err);
            });
    }

    updateIssues() {
        return this.loadIssues(this.state.input);
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
            <View style={headerStyles.header}>
                <TouchableOpacity
                    underlayColor="#FFF"
                    style={headerStyles.headerButton}
                    onPress={this.logOut.bind(this)}>
                    <Text style={headerStyles.headerButtonText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={headerStyles.headerCenter}>Sort by: Updated</Text>

                <View style={headerStyles.headerButton}></View>
            </View>
        )
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
            colors={[COLOR_PINK]}
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

            <ScrollView refreshControl={this._renderRefreshControl()}>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={(issue) => <IssueRow issue={issue} onClick={() => this.goToIssue()}></IssueRow>}
                    refreshDescription="Refreshing issues"/>
            </ScrollView>

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
