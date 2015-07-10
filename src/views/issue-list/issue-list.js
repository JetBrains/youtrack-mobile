var React = require('react-native');
var KeyboardEvents = require('react-native-keyboardevents');
var KeyboardEventEmitter = KeyboardEvents.Emitter;

var styles = require('./issue-list.styles');
var Api = require('../../blocks/api/api');
var ApiHelper = require('../../blocks/api/api__helper');
var RefreshableListView = require('react-native-refreshable-listview');
var ColorField = require('../../blocks/color-field/color-field');

var {View, Text, TouchableHighlight, ListView, TextInput, LayoutAnimation, Image} = React;

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class IssueList extends React.Component {

    constructor() {
        super();
        this.state = {
            dataSource: ds.cloneWithRows([]),
            keyboardSpace: 0
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
        LayoutAnimation.configureNext(animations.layout.spring);
        this.setState({keyboardSpace: frames.end.height});
    }

    _resetKeyboardSpace() {
        LayoutAnimation.configureNext(animations.layout.spring);
        this.setState({keyboardSpace: 0});
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

    _renderHeader() {
        return (
            <View style={styles.headerContainer}>
                <TouchableHighlight
                    underlayColor="#FFF" //TODO: not working(
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

    _renderRow(issue) {
        return (
            <TouchableHighlight onPress={() => this.onRowClick(issue)}>
                <View>
                    <View style={styles.row}>
                        <View>
                            <ColorField field={issue.fieldHash.Priority}></ColorField>
                        </View>
                        <View style={styles.rowText}>
                            <Text style={styles.summary}>
                                {issue.fieldHash.summary}
                            </Text>
                            <Text style={styles.subtext}>
                                {issue.id} by {issue.fieldHash.reporterFullName} for {issue.fieldHash.Assignee && issue.fieldHash.Assignee[0].fullName}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.separator}/>
                </View>
            </TouchableHighlight>
        );
    }

    _renderFooter() {
        return (
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Enter query"
                    clearButtonMode="always"
                    returnKeyType="search"
                    autoCorrect={false}
                    onEndEditing={(e) => this.loadIssues(e.nativeEvent.text)}
                    style={styles.searchInput}
                    onChangeText={(text) => this.setState({input: text})}
                    />
            </View>
        );
    }

    render() {
        return (<View style={styles.listContainer}>
            {this._renderHeader()}

            <RefreshableListView
                dataSource={this.state.dataSource}
                loadData={this.updateIssues.bind(this)}
                renderRow={this._renderRow.bind(this)}
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
                property: LayoutAnimation.Properties.opacity,
            },
            update: {
                type: LayoutAnimation.Types.spring,
                springDamping: 400,
            }
        }
    }
};

module.exports = IssueList;
