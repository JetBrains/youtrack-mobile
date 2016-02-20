import React, {ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

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
      })
      .then(() => {
        //TODO: scroll to bottom
      })
  }

  applyIssueFolder(issueFolderName) {
    let hasSpaces = issueFolderName.indexOf(' ') >= 0;
    let query = '#' + (hasSpaces ? '{' : '') + issueFolderName + (hasSpaces ? '}' : ''); //eslint-disable-line prefer-template
    this.props.onAddQuery(query);
  }

  _renderRow(issueFolder) {
    return (
      <TouchableOpacity
        style={styles.searchRow}
        underlayColor='#FFF'
        onPress={() => this.applyIssueFolder(issueFolder.name)}>
        <Text style={styles.searchText}>{issueFolder.name}</Text>
      </TouchableOpacity>);
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
