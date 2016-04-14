import React, {ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import debounce from 'debounce';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

function transformSuggestions(suggest) {
  let result = [];
  for (let i = 0, length = suggest.length; i < length; i++) {
    result.push({
      prefix: suggest[i].pre || '',
      option: suggest[i].o || '',
      suffix: suggest[i].suf || '',
      description: suggest[i].hd || suggest[i].d || '',
      matchingStart: suggest[i].ms,
      matchingEnd: suggest[i].me,
      caret: suggest[i].cp,
      completionStart: suggest[i].cs,
      completionEnd: suggest[i].ce
    });
  }
  return result;
}

class SearchListView extends React.Component {
  constructor() {
    super();
    this.state = {dataSource: ds.cloneWithRows([])};

    this.debouncedLoadSuggestions = debounce((query, caret) => this.loadSuggestions(query, caret), 100, true);
  }

  loadSuggestions(query, caret) {
    this.props.getSuggestions(query, caret)
      .then((suggestions) => {
        suggestions = transformSuggestions(suggestions);
        if (!this.isUnmounted) {
          this.setState({
            dataSource: ds.cloneWithRows(suggestions)
          });
        }
      });
  }

  componentDidMount() {
    this.loadSuggestions(this.props.query, this.props.caret)
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  componentWillReceiveProps(newProps) {
    if (this.props.query !== newProps.query || this.props.caret !== newProps.caret) {
      this.debouncedLoadSuggestions(newProps.query, newProps.caret);
    }
  }

  onApplySuggestion(suggestion) {
    const suggestionText = `${suggestion.prefix}${suggestion.option}${suggestion.suffix}`;
    const newQuery = this.props.query.substring(0, suggestion.completionStart) + suggestionText + this.props.query.substring(suggestion.completionEnd);
    return this.props.onApplySuggestion(newQuery);
  }

  _renderRow(suggestion) {
    return (
      <TouchableOpacity style={styles.searchRow} onPress={() => this.onApplySuggestion(suggestion)}>
        <Text style={styles.searchText}>{suggestion.option}</Text>
      </TouchableOpacity>);
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        renderRow={(suggestion) => this._renderRow(suggestion)}
        renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
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
