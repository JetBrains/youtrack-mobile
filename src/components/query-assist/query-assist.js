/* @flow */
import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import React from 'react';
import styles from './query-assist.styles';
import QueryAssistSuggestionsList from './query-assist__suggestions-list';
import type {ServersideSuggestion} from './query-assist__suggestion';
import {COLOR_PINK, COLOR_FONT_GRAY} from '../../components/variables/variables';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import PubSub from 'pubsub-js';

type Props = {
  dataSource: (query: string, caret: number) => Promise<Array<ServersideSuggestion>>,
  onQueryUpdate: (query: string) => any,
  initialQuery: string
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
  pubSubToken: string;

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

    this.pubSubToken = PubSub.subscribe('YTM_ORIENTATION_CHANGE',  () => this.measureSuggestionsListSpace(0, false));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.pubSubToken);
  }

  getSuggestions(...args: Array<any>) {
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

  componentWillReceiveProps(newProps: Props) {
    if (newProps.initialQuery !== this.props.initialQuery) {
      this.setState({input: newProps.initialQuery});
    }
  }

  componentDidMount() {
    this.measureSuggestionsListSpace();
  }

  measureSuggestionsListSpace(timeout: number = 0, recheck: boolean = true) {
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
