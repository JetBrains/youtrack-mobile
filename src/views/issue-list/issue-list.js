var React = require('react-native');
var Api = require('../../blocks/api/api');
var ApiHelper = require('../../blocks/api/api__helper');
var RefreshableListView = require('react-native-refreshable-listview');

var {View, Text, TouchableHighlight, ListView, StyleSheet, TextInput} = React;

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class IssueList extends React.Component {

    constructor() {
        super();
        this.state = {
            dataSource: ds.cloneWithRows([])
        };
    }

    componentDidMount() {
        this.api = new Api(this.props.auth);
        this.loadIssues();
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
            .catch(() => {
                debugger;
            });
    }

    updateIssues() {
        return this.loadIssues(this.state.input);
    }

    onRowClick(issue) {
        console.log('Issue clicked', issue);
    }

    _renderRow(issue) {
        return (
            <TouchableHighlight onPress={() => this.onRowClick(issue)}>
                <View>
                    <View style={styles.row}>
                        <Text style={styles.id}>
                            {issue.id}
                        </Text>
                        <Text style={styles.description}>
                            {issue.fieldHash.summary}
                        </Text>
                    </View>
                    <View style={styles.separator}/>
                </View>
            </TouchableHighlight>
        );
    }

    _renderFooter() {
        return (
            <View>
                <TextInput
                    placeholder="Enter query"
                    clearButtonMode="always"
                    onSubmitEditing={(e) => this.loadIssues(e.nativeEvent.text)}
                    style={{height: 24, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({input: text})}
                    />
            </View>
        );
    }

    render() {
        return (<View>
            <TouchableHighlight
                style={{borderWidth: 1, marginTop: 16}}
                onPress={this.logOut.bind(this)}>
                <Text>Log Out</Text>
            </TouchableHighlight>

            <View>
                <TextInput
                    placeholder="Enter query"
                    clearButtonMode="always"
                    onSubmitEditing={(e) => this.loadIssues(e.nativeEvent.text)}
                    style={{height: 24, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({input: text})}
                    />
            </View>

            <RefreshableListView
                dataSource={this.state.dataSource}
                loadData={this.updateIssues.bind(this)}
                renderRow={this._renderRow.bind(this)}
                refreshDescription="Refreshing issues"
                />

        </View>);
    }
}

var styles = StyleSheet.create({
    refreshableList: {
        //height: 100
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10,
        backgroundColor: '#F6F6F6'
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC'
    },
    id: {
        width: 48
    },
    description: {
        marginLeft: 16
    }
});

module.exports = IssueList;
