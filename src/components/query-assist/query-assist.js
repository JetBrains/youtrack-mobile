import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import React from 'react';
import styles from './query-assist.styles';
import QueryAssistSuggestionsList from './query-assist__suggestions-list';
import {COLOR_PINK, COLOR_FONT_GRAY} from '../../components/variables/variables';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import PubSub from 'pubsub-js';

export default class QueryAssist extends React.Component {
  constructor() {
    super();
    this.state = {
      displayCancelSearch: false,
      showQueryAssist: false,
      queryAssistStyle: {},
      input: '',
      caret: ''
    };

    this.pubSubToken = PubSub.subscribe('YTM_ORIENTATION_CHANGE',  () => this.measureSuggestionsListSpace(0, false));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.pubSubToken);
  }

  getSuggestions(...args) {
    return this.props.dataSource(...args);
  }

  blurInput() {
    this.refs.searchInput.blur();
  }

  cancelSearch() {
    this.blurInput();
    this.setState({input: this.state.queryCopy});
  }

  beginEditing() {
    this.setState({
      showQueryAssist: true,
      displayCancelSearch: true,
      queryCopy: this.state.input,
      suggestionsListTop: 0
    });
  }

  stopEditing() {
    this.setState({
      showQueryAssist: false,
      displayCancelSearch: false
    });
  }

  onSubmitEditing() {
    this.blurInput();
    this.props.onQueryUpdate(this.state.input || '');
  }

  componentWillReceiveProps(newProps, oldProps) {
    if (newProps.initialQuery !== this.state.input) {
      this.setState({input: this.props.initialQuery});
    }
  }

  componentDidMount() {
    this.measureSuggestionsListSpace();
  }

  measureSuggestionsListSpace(timeout = 0, recheck = true) {
    setTimeout(() => {
      this.refs.queryAssistContainer.measure((ox, oy, width, height, px, assistPositionY) => {
        this.setState({suggestionsListTop: -assistPositionY});
        if (recheck) {
          this.measureSuggestionsListSpace(100, false);
        }
      });
    }, timeout);
  }

  _renderInput() {
    let cancelButton = null;
    if (this.state.displayCancelSearch) {
      cancelButton = <TouchableOpacity
        style={styles.cancelSearch}
        onPress={this.cancelSearch.bind(this)}>
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </TouchableOpacity>;
    }

    return (
      <View style={styles.inputWrapper} ref="queryAssistContainer">
        <TextInput
          ref="searchInput"
          style={[styles.searchInput, this.state.showQueryAssist ? styles.searchInputActive : null]}
          placeholderTextColor={this.state.showQueryAssist ? COLOR_FONT_GRAY : COLOR_PINK}
          placeholder="Enter query"
          clearButtonMode="while-editing"
          returnKeyType="search"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          onFocus={() => this.beginEditing()}
          onBlur={() => this.stopEditing()}
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
    return <QueryAssistSuggestionsList style={[styles.searchSuggestions, {top: this.state.suggestionsListTop}]}
                                       getSuggestions={this.getSuggestions.bind(this)}
                                       caret={this.state.caret}
                                       query={this.state.input}
                                       onApplySuggestion={query => this.setState({input: query})}/>;
  }

  render() {
    return <View>
      {this.state.showQueryAssist && this._renderSuggestions()}

      {this._renderInput()}

      <View style={styles.keyboardSpacerHiddenContaioner}>
        <KeyboardSpacer onToggle={() => this.measureSuggestionsListSpace()}/>
      </View>
    </View>;
  }
}
