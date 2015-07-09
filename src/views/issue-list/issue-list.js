var React = require('react-native');
var Api = require('../../blocks/api/api');
var ApiHelper = require('../../blocks/api/api__helper');
var RefreshableListView = require('react-native-refreshable-listview')

var {View, Text, TouchableHighlight, ListView, StyleSheet} = React;

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

    loadIssues() {
        return this.api.getIssues()
            .then(ApiHelper.fillFieldHash)
            .then((issues) => {
                this.setState({dataSource: ds.cloneWithRows(issues)});
                console.log('Issues', issues);
            })
            .catch(() => {
                debugger;
            });
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

    render() {
        return (<View>
            <Text>Test Issues List</Text>

            <TouchableHighlight
                style={{borderWidth: 1}}
                onPress={this.logOut.bind(this)}>
                <Text>Log Out</Text>
            </TouchableHighlight>
            <RefreshableListView
                dataSource={this.state.dataSource}
                loadData={this.loadIssues.bind(this)}
                renderRow={this._renderRow.bind(this)}
                refreshDescription="Refreshing issues"
                />

        </View>);
    }
}

var styles = StyleSheet.create({
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
