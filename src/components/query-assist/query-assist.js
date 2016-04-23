import React, {View, Text, TouchableOpacity, TextInput, Modal} from 'react-native';
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
          onBlur={() => this.setState({showQueryAssist: false, displayCancelSearch: false})}
          onSubmitEditing={(e) => this.props.onQueryUpdate(e.nativeEvent.text)}
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
    return <View style={styles.searchSuggestions}>
      <QueryAssistSuggestionsList getSuggestions={this.getSuggestions.bind(this)}
                                  caret={this.state.caret}
                                  query={this.state.input}
                                  onApplySuggestion={query => this.setState({input: query})}/>
    </View>
  }

  render() {
    return <View>

      <Modal visible={this.state.showQueryAssist} transparent={true} animated={true}>
        {this._renderSuggestions()}
        <View style={{position: 'absolute', bottom: 216, left: 0, right: 0}}>
          {this._renderInput()}
        </View>
      </Modal>

      {!this.state.showQueryAssist && <View style={styles.inputWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter query"
          onFocus={() => {
            this.setState({showQueryAssist: true, displayCancelSearch: true});
            setTimeout(() => this.refs.searchInput.focus(), 100);
          }}
          value={this.state.input}
        />
      </View>}
    </View>
  }
}
