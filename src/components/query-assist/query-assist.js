/* @flow */

import {View, TouchableOpacity, TextInput} from 'react-native';
import React, {Component} from 'react';

import QueryAssistSuggestionsList from './query-assist__suggestions-list';
import {IconBack, IconClose} from '../icon/icon';
import ModalView from '../modal-view/modal-view';
import throttle from 'lodash.throttle';
import {View as AnimatedView} from 'react-native-animatable';
import KeyboardSpacerIOS from '../platform/keyboard-spacer.ios';

import styles from './query-assist.styles';

import type {TransformedSuggestion, SavedQuery} from '../../flow/Issue';
import {HIT_SLOP} from '../common-styles/button';

const SEARCH_THROTTLE = 30;
const SHOW_LIST_ANIMATION_DURATION = 500;

type Props = {
  suggestions: Array<TransformedSuggestion | SavedQuery>,
  currentQuery: string,
  onApplyQuery: (query: string) => any,
  onChange: (query: string, caret: number) => any,
  onClose: () => any
};

type State = {
  inputValue: string,
  caret: number,
  queryCopy: string,
  suggestionsListTop: number
}

export default class QueryAssist extends Component<Props, State> {
  queryAssistContainer: ?Object;
  lastQueryParams: { query: string, caret: number } = {query: '', caret: 0};
  initialState: State = {
    inputValue: '',
    caret: 0,
    queryCopy: '',
    suggestionsListTop: 0
  };

  constructor(props: Props) {
    super(props);
    this.state = Object.assign({}, this.initialState);
  }

  onSearch = throttle((query: string, caret: number) => {
    if (this.lastQueryParams.query === query || this.lastQueryParams.caret === caret) {
      return;
    }

    this.lastQueryParams = {query, caret};
    this.setState({inputValue: query, caret});
    this.props.onChange(query, caret);

  }, SEARCH_THROTTLE);

  resetState = () => {
    this.setState(this.initialState);
  };

  blurInput() {
    this.refs.searchInput.blur();
  }

  focusInput() {
    this.refs.searchInput.focus();
  }

  cancelSearch() {
    this.blurInput();
    this.setState({inputValue: this.state.queryCopy});
  }

  beginEditing() {
    let {inputValue} = this.state;
    inputValue = inputValue || '';
    this.setState({
      queryCopy: inputValue,
      suggestionsListTop: 0
    });

    this.props.onChange(inputValue, inputValue.length);
  }

  onSubmitEditing() {
    this.blurInput();
    this.props.onApplyQuery(this.state.inputValue || '');
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.currentQuery !== this.props.currentQuery) {
      this.setState({inputValue: newProps.currentQuery});
    }
  }

  componentDidMount() {
    this.setState({inputValue: this.props.currentQuery});
  }

  onApplySuggestion = (suggestion: TransformedSuggestion) => {
    const suggestionText = `${suggestion.prefix}${suggestion.option}${suggestion.suffix}`;
    const oldQuery = this.state.inputValue || '';
    const leftPartAndNewQuery = oldQuery.substring(0, suggestion.completionStart) + suggestionText;
    const newQuery = leftPartAndNewQuery + oldQuery.substring(suggestion.completionEnd);
    this.setState({inputValue: newQuery});
    this.focusInput();
    this.props.onChange(newQuery, leftPartAndNewQuery.length);
  };

  onApplySavedQuery = (savedQuery: SavedQuery) => {
    this.setState({inputValue: savedQuery.query});
    this.blurInput();
    this.props.onApplyQuery(savedQuery.query);
  };

  renderClearIcon() {
    return (
      <TouchableOpacity
        onPress={this.resetState}
        hitSlop={HIT_SLOP}
        style={styles.clearIcon}
      >
        <IconClose size={21} color={styles.link.color}/>
      </TouchableOpacity>
    );
  }

  _renderInput() {
    const {inputValue} = this.state;
    const {onClose} = this.props;

    return (
      <View
        style={[
          styles.inputWrapper,
          styles.inputWrapperActive
        ]}
        ref={node => this.queryAssistContainer = node}
      >

        <TouchableOpacity
          testID="query-assist-cancel"
          onPress={() => {
            this.cancelSearch();
            onClose();
          }}
        >
          <IconBack color={styles.link.color}/>
        </TouchableOpacity>

        <TextInput
          ref="searchInput"

          testID="query-assist-input"
          style={styles.searchInput}

          placeholderTextColor={styles.clearIcon.color}
          placeholder="Enter search request"

          clearButtonMode="never"
          returnKeyType="search"
          autoFocus={true}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          autoCapitalize="none"

          onFocus={() => this.beginEditing()}

          onSubmitEditing={() => this.onSubmitEditing()}
          onChangeText={text => this.setState({inputValue: text})}
          onSelectionChange={event => this.onSearch(inputValue, event.nativeEvent.selection.start)}

          value={inputValue}
        />

        {!!inputValue && this.renderClearIcon()}
      </View>
    );
  }

  _renderSuggestions() {
    const {suggestions} = this.props;
    return (
      <AnimatedView
        style={styles.suggestContainer}
        animation="fadeIn"
        useNativeDriver
        duration={SHOW_LIST_ANIMATION_DURATION}
      >
        <QueryAssistSuggestionsList
          suggestions={suggestions}
          onApplySuggestion={this.onApplySuggestion}
          onApplySavedQuery={this.onApplySavedQuery}
        />
      </AnimatedView>
    );
  }

  render() {
    return (
      <ModalView
        visible={true}
        animationType="fade"
        style={styles.modal}
      >

        {this._renderInput()}
        {this._renderSuggestions()}
        <KeyboardSpacerIOS/>

      </ModalView>
    );
  }
}
