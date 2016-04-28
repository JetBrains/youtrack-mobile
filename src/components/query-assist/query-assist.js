import React, {View, Text, TouchableOpacity, TextInput} from 'react-native';
import styles from './query-assist.styles';
import QueryAssistSuggestionsList from './query-assist__suggestions-list';

export default class QueryAssist extends React.Component {
  constructor() {
    super();
    this.state = {
      displayCancelSearch: false,
      showQueryAssist: false,
      input: '',
      caret: ''
    };
  }

  getSuggestions(...args) {
    return this.props.dataSource(...args);
  }

  cancelSearch() {
    this.refs.searchInput.blur();
  }

  onSubmitEditing() {
    this.cancelSearch();
    this.props.onQueryUpdate(this.state.input);
  }

  componentWillReceiveProps(newProps, oldProps) {
    if (newProps.initialQuery !== oldProps.initialQuery) {
      this.setState({input: this.props.initialQuery});
    }
  }

  _renderInput() {
    let cancelButton = null;
    if (this.state.displayCancelSearch) {
      cancelButton = <TouchableOpacity
        style={styles.cancelSearch}
        onPress={this.cancelSearch.bind(this)}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>;
    }

    return (
      <View style={styles.inputWrapper}>
        <TextInput
          ref="searchInput"
          style={styles.searchInput}
          placeholder="Enter query"
          clearButtonMode="always"
          returnKeyType="search"
          autoCorrect={false}
          autofocus={true}
          autoCapitalize="none"
          onFocus={() => this.setState({showQueryAssist: true, displayCancelSearch: true})}
          onBlur={() => this.setState({showQueryAssist: false, displayCancelSearch: false})}
          onSubmitEditing={() => this.onSubmitEditing()}
          value={this.state.input}
          onChangeText={(text) => this.setState({input: text})}
          onSelectionChange = {(event) => {
            const caret = event.nativeEvent.selection.start;
            this.setState({caret});
          }}
        />
        {cancelButton}
      </View>
    );
  }

  _renderSuggestions() {
    return <QueryAssistSuggestionsList style={styles.searchSuggestions}
                                       getSuggestions={this.getSuggestions.bind(this)}
                                       caret={this.state.caret}
                                       query={this.state.input}
                                       onApplySuggestion={query => this.setState({input: query})}/>
  }

  render() {
    return <View>
      {this.state.showQueryAssist && this._renderSuggestions()}

      {this._renderInput()}
    </View>
  }
}
