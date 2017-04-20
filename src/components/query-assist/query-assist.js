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
import throttle from 'lodash.throttle';
import {View as AnimatedView} from 'react-native-animatable';

const SEARCH_THROTTLE = 30;
const SHOW_LIST_ANIMATION_DURATION = 500;

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
  lastQueryParams: {query: string, caret: number} = {query: '', caret: 0};

  constructor(props: Props) {
    super(props);
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

  onSearch = throttle((query: string, caret: number) => {
    if (this.lastQueryParams.query === query || this.lastQueryParams.caret === caret) {
      return;
    }

    this.lastQueryParams = {query, caret};
    this.setState({input: query, caret});
    this.props.onChange(query, caret);

  }, SEARCH_THROTTLE)

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
        testID="query-assist-cancel"
        onPress={this.cancelSearch.bind(this)}
      >
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
          testID="query-assist-input"
          autoFocus={showQueryAssist}
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
        {(input && showQueryAssist)
        ? <TouchableOpacity style={styles.clearIconWrapper} onPress={() => this.setState({input: ''})} testID="query-assist-clear">
          <Image style={styles.clearIcon} source={clearSearch}/>
        </TouchableOpacity>
        : null}
        {cancelButton}
      </View>
    );
  }

  _renderSuggestions() {
    const {suggestions} = this.props;
    return (
      <AnimatedView
        style={styles.listContainer}
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
    const {showQueryAssist} = this.state;

    const ContainerComponent = showQueryAssist ? Modal : View;
    const containerProps = showQueryAssist ? {
      visible: true,
      style: [styles.modal, showQueryAssist && styles.modalFullScreen]
    } : {
      style: styles.placeHolder
    };

    return (
      <ContainerComponent {...containerProps}>
        {showQueryAssist && this._renderSuggestions()}

        {this._renderInput()}

        {Platform.OS === 'ios' && <KeyboardSpacer style={styles.keyboardSpacer}/>}
      </ContainerComponent>
    );
  }
}
