var React = require('react-native');

var {View, ListView, Text, TouchableHighlight, StyleSheet} = React;

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SearchListView extends React.Component {
    constructor() {
        super();
        this.state = {dataSource: ds.cloneWithRows([])};
    }

    componentDidMount() {
        this.props.getIssuesFolder()
            .then((issueFolders) => {
                this.setState({
                    dataSource: ds.cloneWithRows(issueFolders)
                });
            });
    }

    _renderRow(issueFolder) {
        return (
            <TouchableHighlight
                style={styles.searchRow}
                underlayColor='#FFF'
                onPress={() => this.props.applyIssueFolder(issue)}>
                <Text style={styles.searchText}>{issueFolder.name}</Text>
            </TouchableHighlight>);
    }

    render() {
        return (
            <ListView
                dataSource={this.state.dataSource}
                renderRow={(issueFolder) => this._renderRow(issueFolder)}
                refreshDescription="Refreshing issues"
                />
        );
    }
}

let styles = StyleSheet.create({
    searchRow: {
        flex: 1,
        justifyContent: 'center',
        height: 40
    },
    searchText: {
        flex: 1,
        fontSize: 20
    }
});

module.exports = SearchListView;