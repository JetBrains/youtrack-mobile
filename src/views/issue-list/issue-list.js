var React = require('react-native');
var Api = require('../../blocks/api/api');
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

        this.getIssues()
            .then((issues) => {
                this.setState({dataSource: ds.cloneWithRows(issues)})
                console.log('Issues', issues);
            })
            .catch(() => {
                debugger;
            });
    }

    logOut() {
        this.props.auth.logOut()
            .then(() => this.props.onBack());
    }

    getIssues() {
        return this.api.getIssues()
    }

    issuesDataSource() {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.getIssues();
        return ds.cloneWithRows(['row 1', 'row 2'])
    }

    render() {
        return (<View>
            <Text>Test Issues List</Text>

            <TouchableHighlight
                style={{borderWidth: 1}}
                onPress={this.logOut.bind(this)}>
                <Text>Log Out</Text>
            </TouchableHighlight>
            <ListView
                dataSource={this.state.dataSource}
                renderRow={(rowData) => <Text>{rowData.id}</Text>}
                />

        </View>);
    }
}

var styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#6A85B1',
        height: 300
    }
});

module.exports = IssueList;
