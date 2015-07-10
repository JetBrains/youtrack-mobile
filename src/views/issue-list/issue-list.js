var React = require('react-native');
var {View, Text, TouchableHighlight, ListView, TextInput, LayoutAnimation, Image} = React;

var KeyboardEvents = require('react-native-keyboardevents');
var KeyboardEventEmitter = KeyboardEvents.Emitter;

var styles = require('./issue-list.styles');
var Api = require('../../blocks/api/api');
var ApiHelper = require('../../blocks/api/api__helper');
var RefreshableListView = require('react-native-refreshable-listview');
var ColorField = require('../../blocks/color-field/color-field');
var IssueRow = require('./issue-list__row');
var SearchesList = require('./issue-list__search-list');


var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class IssueList extends React.Component {

    constructor() {
        super();
        this.state = {
            displayCancelSearch: false,
            dataSource: ds.cloneWithRows([]),
            keyboardSpace: 0,
            searchListHeight: 0
        };
    }

    componentDidMount() {
        this.api = new Api(this.props.auth);
        this.loadIssues();

        KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillShowEvent, this._updateKeyboardSpace.bind(this));
        KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, this._resetKeyboardSpace.bind(this));
    }

    componentWillUnmount() {
        KeyboardEventEmitter.off(KeyboardEvents.KeyboardWillShowEvent, this._updateKeyboardSpace.bind(this));
        KeyboardEventEmitter.off(KeyboardEvents.KeyboardWillHideEvent, this._resetKeyboardSpace.bind(this));
    }

    _updateKeyboardSpace(frames) {
        var spacing = 110; //TODO: calculate it in runtime
        LayoutAnimation.configureNext(animations.layout.spring);
        this.setState({
            keyboardSpace: frames.end.height,
            searchListHeight: frames.end.y - spacing,
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

    logOut() {
        this.props.auth.logOut()
            .then(() => this.props.onBack());
    }

    loadIssues(text) {
        return this.api.getIssues(text)
            .then(ApiHelper.fillFieldHash)
            .then((issues) => {
                this.setState({dataSource: ds.cloneWithRows(issues)});
                console.log('Issues', issues);
            })
            .catch((res) => {
                console.error(res);
            });
    }

    updateIssues() {
        return this.loadIssues(this.state.input);
    }

    onRowClick(issue) {
        console.log('Issue clicked', issue);
    }

    cancelSearch() {
        this.refs.searchInput.blur();
    }

    getIssuesFolder() {
        return this.api.getIssueFolders()
            .then((res) => {
                console.log('IssueFolders', res);
                return res;
            })
    }

    addToQuery(query) {
        this.setState({input: query});
    }

    _renderHeader() {
        return (
            <View style={styles.headerContainer}>
                <TouchableHighlight
                    underlayColor="#FFF"
                    style={styles.logOut}
                    onPress={this.logOut.bind(this)}>
                    <Text style={styles.logOut__text}>Log Out</Text>
                </TouchableHighlight>

                <Image
                    style={styles.logo}
                    source={require('image!youtrack-logo')}
                    />
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
                    onEndEditing={(e) => this.loadIssues(e.nativeEvent.text)}
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
                <SearchesList getIssuesFolder={this.getIssuesFolder.bind(this)} applyIssueFolder={this.addToQuery.bind(this)}></SearchesList>
            </View>
        }

        return (<View style={styles.listContainer}>
            {this._renderHeader()}

            {searchContainer}

            <RefreshableListView
                dataSource={this.state.dataSource}
                loadData={this.updateIssues.bind(this)}
                renderRow={(issue) => <IssueRow issue={issue} onClick={this.onRowClick.bind(this)}></IssueRow>}
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
