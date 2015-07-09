var React = require('react-native');
var Api = require('../../blocks/api/api');
var {View, Text, TouchableHighlight, ListView} = React;

class IssueList extends React.Component {

    constructor() {
        super();
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows(['row 1', 'row 2'])
        };
    }

    componentDidMount() {
        this.api = new Api(this.props.auth);

        this.getIssues()
            .then((issues) => {
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
        return this.api.getIssues();
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
                renderRow={(rowData) => <Text>{rowData}</Text>}
                />
        </View>);
    }
}

module.exports = IssueList;
