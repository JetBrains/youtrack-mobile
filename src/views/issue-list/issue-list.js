import React, {AsyncStorage, View, Text, TouchableHighlight, ListView, TextInput, LayoutAnimation, Image, StatusBarIOS, DeviceEventEmitter} from 'react-native'

import styles from './issue-list.styles';
import headerStyles from '../../blocks/header/header.styles';

import Api from '../../blocks/api/api';
import ApiHelper from '../../blocks/api/api__helper';
import RefreshableListView from 'react-native-refreshable-listview';
import IssueRow from './issue-list__row';
import SearchesList from './issue-list__search-list';
import SingleIssue from '../single-issue/singe-issue';

const QUERY_STORAGE_KEY = 'YT_QUERY_STORAGE';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

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
        var spacing = 110; //TODO: calculate it in runtime
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
        this.props.navigator.push({
            title: 'Issue',
            component: <SingleIssue issueId={issue.id} api={this.api} onBack={() => this.props.navigator.pop()} navigator={this.props.navigator}></SingleIssue>
        })
    }

    logOut() {
        this.props.auth.logOut()
            .then(() => this.props.onBack());
    }

    loadIssues(text) {
        //StatusBarIOS.setNetworkActivityIndicatorVisible(true);

        return this.api.getIssues(text)
            .then(ApiHelper.fillIssuesFieldHash)
            .then((issues) => {
                this.setState({
                    dataSource: ds.cloneWithRows(issues),
                    isuesCount: issues.length
                });
                console.log('Issues', issues);
                //StatusBarIOS.setNetworkActivityIndicatorVisible(false);
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
                <TouchableHighlight
                    underlayColor="#FFF"
                    style={headerStyles.headerButton}
                    onPress={this.logOut.bind(this)}>
                    <Text style={headerStyles.headerButtonText}>Log Out</Text>
                </TouchableHighlight>

                <Text style={headerStyles.headerCenter}>Sort by: Updated</Text>

                <View style={headerStyles.headerButton}></View>
            </View>
        )
    }

    _renderFooter() {
        let cancelButton = null;
        if (this.state.displayCancelSearch) {
            cancelButton = <TouchableHighlight
                style={styles.cancelSearch}
                onPress={this.cancelSearch.bind(this)}
                underlayColor="#2CB8E6">
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableHighlight>;
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

            <RefreshableListView
                contentInset={{top:0}}
                automaticallyAdjustContentInsets={false}
                dataSource={this.state.dataSource}
                loadData={this.updateIssues.bind(this)}
                renderRow={(issue) => <IssueRow issue={issue} onClick={this.goToIssue.bind(this)}></IssueRow>}
                refreshDescription="Refreshing issues"
                />

            {this._renderFooter()}

            <View style={{height: this.state.keyboardSpace}}></View>
        </View>);
    }
}

var animations = {
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
