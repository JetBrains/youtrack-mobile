/* @flow */
import {View, Text, Image, TouchableOpacity, TextInput, Platform} from 'react-native';
import React from 'react';
import styles from './query-assist.styles';
import QueryAssistSuggestionsList from './query-assist__suggestions-list';
import type {TransformedSuggestion, SavedQuery} from '../../flow/Issue';
import {COLOR_PINK, COLOR_PLACEHOLDER} from '../../components/variables/variables';
import {clearSearch} from '../../components/icon/icon';
import Modal from 'react-native-root-modal';
import KeyboardSpacer from 'react-native-keyboard-spacer';

type Props = {
  suggestions: Array<TransformedSuggestion | SavedQuery>,
  currentQuery: string,
  onSetQuery: (query: string) => any,
  onChange: (query: string, caret: number) => any,
};

type State = {
  displayCancelSearch: boolean,
  showQueryAssist: boolean,
  input: string,
  caret: number,
  queryCopy: string,
  suggestionsListTop: number
}

export default class QueryAssist extends React.Component {
  state: State;
  props: Props;
  queryAssistContainer: ?Object;

  constructor() {
    super();
    this.state = {
      displayCancelSearch: false,
      showQueryAssist: false,
      input: '',
      caret: 0,
      queryCopy: '',
      suggestionsListTop: 0
    };
  }

  blurInput() {
    this.refs.searchInput.blur();
  }

  cancelSearch() {
    this.blurInput();
    this.setState({input: this.state.queryCopy});
  }

  beginEditing() {
    let {input} = this.state;
    input = input || '';
    this.setState({
      showQueryAssist: true,
      displayCancelSearch: true,
      queryCopy: input,
      suggestionsListTop: 0
    });

    this.props.onChange(input, input.length);
  }

  stopEditing() {
    this.setState({
      showQueryAssist: false,
      displayCancelSearch: false
    });
  }

  onSubmitEditing() {
    this.blurInput();
    this.props.onSetQuery(this.state.input || '');
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.currentQuery !== this.props.currentQuery) {
      this.setState({input: newProps.currentQuery});
    }
  }

  componentDidMount() {
    this.setState({input: this.props.currentQuery});
  }

  onSearch(query: string, caret: number) {
    this.setState({input: query, caret});
    this.props.onChange(query, caret);
  }

  onApplySuggestion = (suggestion: TransformedSuggestion) => {
    const suggestionText = `${suggestion.prefix}${suggestion.option}${suggestion.suffix}`;
    const oldQuery = this.state.input || '';
    const newQuery = oldQuery.substring(0, suggestion.completionStart) + suggestionText + oldQuery.substring(suggestion.completionEnd);
    this.setState({input: newQuery});
  }

  onApplySavedQuery = (savedQuery: SavedQuery) => {
    this.blurInput();
    this.props.onSetQuery(savedQuery.query);
  }

  _renderInput() {
    const {input, showQueryAssist} = this.state;

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
      <View style={styles.inputWrapper} ref={node => this.queryAssistContainer = node}>
        <TextInput
          ref="searchInput"
          keyboardAppearance="dark"
          style={[styles.searchInput, showQueryAssist ? styles.searchInputActive : null]}
          placeholderTextColor={showQueryAssist ? COLOR_PLACEHOLDER : COLOR_PINK}
          placeholder="Enter query"
          clearButtonMode="while-editing"
          returnKeyType="search"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          onFocus={() => this.beginEditing()}
          onBlur={() => this.stopEditing()}
          onSubmitEditing={() => this.onSubmitEditing()}
          value={input}
          onChangeText={text => this.setState({input: text})}
          onSelectionChange = {event => this.onSearch(input, event.nativeEvent.selection.start)}
        />
        {(input && showQueryAssist) ? <TouchableOpacity style={styles.clearIconWrapper} onPress={() => this.setState({input: ''})}>
          <Image style={styles.clearIcon} source={clearSearch}/>
        </TouchableOpacity> : null}
        {cancelButton}
      </View>
    );
  }

  _renderSuggestions() {
    const {suggestions} = this.props;
    return (
      <QueryAssistSuggestionsList
        style={styles.searchSuggestions}
        suggestions={suggestions}
        onApplySuggestion={this.onApplySuggestion}
        onApplySavedQuery={this.onApplySavedQuery}
      />
    );
  }

  render() {
    const {showQueryAssist} = this.state;

    return (
      <View style={styles.placeHolder}>
        <Modal visible style={[styles.modal, showQueryAssist && styles.modalFullScreen]}>
          {showQueryAssist && this._renderSuggestions()}

          {this._renderInput()}

          {Platform.OS === 'ios' && <KeyboardSpacer style={styles.keyboardSpacer}/>}
        </Modal>
      </View>
    );
  }
}
