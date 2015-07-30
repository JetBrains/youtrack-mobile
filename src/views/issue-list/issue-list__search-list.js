var React = require('react-native');

var {View, ListView, Text, TouchableHighlight, StyleSheet} = React;

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SearchListView extends React.Component {
    constructor() {
        super();
        this.state = {dataSource: ds.cloneWithRows([])};
    }

    componentDidMount() {
        let folderList = this.refs.foldersList;
        this.props.getIssuesFolder()
            .then((issueFolders) => {
                this.setState({
                    dataSource: ds.cloneWithRows(issueFolders)
                });
            })
            .then(() => {
                //TODO: scroll to bottom
            })
    }

    applyIssueFolder(issueFolderName) {
        let hasSpaces = issueFolderName.indexOf(' ') >= 0;
        let query = '#' + (hasSpaces ? '{' : '') + issueFolderName + (hasSpaces ? '}' : '');
        this.props.onAddQuery(query);
    }

    _renderRow(issueFolder) {
        return (
            <TouchableHighlight
                style={styles.searchRow}
                underlayColor='#FFF'
                onPress={() => this.applyIssueFolder(issueFolder.name)}>
                <Text style={styles.searchText}>{issueFolder.name}</Text>
            </TouchableHighlight>);
    }

    render() {
        return (
            <ListView
                contentInset={{top:0}}
                automaticallyAdjustContentInsets={false}
                ref="foldersList"
                dataSource={this.state.dataSource}
                renderRow={(issueFolder) => this._renderRow(issueFolder)}
                keyboardShouldPersistTaps={true}/>
        );
    }
}

let styles = StyleSheet.create({
    searchRow: {
        flex: 1,
        padding: 16
    },
    searchText: {
        flex: 1,
        fontSize: 20,
        textAlign: 'center'
    }
});

module.exports = SearchListView;