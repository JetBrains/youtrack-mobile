/* @flow */
import {View, TouchableOpacity, Text, TextInput, Platform, FlatList, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import styles from './command-dialog.styles';
import {COLOR_PLACEHOLDER} from '../../components/variables/variables';
import Modal from 'react-native-root-modal';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import throttle from 'lodash.throttle';
import {View as AnimatedView} from 'react-native-animatable';
import Header from '../../components/header/header';
import ApiHelper from '../../components/api/api__helper';
import type {CommandSuggestionResponse, CommandSuggestion, SuggestedCommand} from '../../flow/Issue';

const SEARCH_THROTTLE = 30;
const SHOW_LIST_ANIMATION_DURATION = 500;

type Props = {
  headerContent: string,
  suggestions: ?CommandSuggestionResponse,
  onApply: (command: string) => any,
  onChange: (command: string, caret: number) => any,
  isApplying: boolean,
  onCancel: Function
};

type State = {
  displayCancelSearch: boolean,
  input: string,
  caret: number
}

type DefaultProps = {
  onChange: Function
}

export default class CommandDialog extends Component<DefaultProps, Props, State> {
  props: Props;
  state: State = {
    displayCancelSearch: false,
    input: '',
    caret: 0
  };

  lastUsedParams: {command: ?string, caret: number} = {command: null, caret: 0};

  static defaultProps = {
    onChange: () => {}
  };

  onSearch = throttle((command: string, caret: number) => {
    if (this.lastUsedParams.command === command && this.lastUsedParams.caret === caret) {
      return;
    }
    this.lastUsedParams = {command, caret};

    this.setState({input: command, caret});
    this.props.onChange(command, caret);
  }, SEARCH_THROTTLE);

  onApplySuggestion = (suggestion: CommandSuggestion) => {
    const suggestionText = `${suggestion.prefix || ''}${suggestion.option}${suggestion.suffix || ''}`;
    const oldQuery = this.state.input || '';
    const newQuery = oldQuery.substring(0, suggestion.completionStart) + suggestionText + oldQuery.substring(suggestion.completionEnd);
    this.setState({input: newQuery});
  };

  onApply = () => {
    this.props.onApply(this.state.input);
  }

  _renderInput() {
    const {input} = this.state;
    const {isApplying, suggestions} = this.props;

    const canApply = !isApplying && suggestions && suggestions.commands.every(command => !command.error);

    return (
      <View style={styles.inputWrapper}>
        <TextInput
          keyboardAppearance="dark"
          style={styles.searchInput}
          placeholderTextColor={COLOR_PLACEHOLDER}
          placeholder="Enter command"
          clearButtonMode="while-editing"
          returnKeyType="search"
          testID="command-input"
          autoFocus
          autoCorrect={false}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          value={input}
          editable={isApplying}
          onChangeText={text => this.setState({input: text})}
          onSelectionChange = {event => this.onSearch(input, event.nativeEvent.selection.start)}
        />

        {isApplying && <ActivityIndicator/>}

        <TouchableOpacity
          style={styles.applyButton}
          disabled={!canApply}
          testID="command-apply"
          onPress={this.onApply}
        >
          <Text style={[styles.applyText, !canApply && styles.applyTextDisabled]}>Apply</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderCommandPreview() {
    const {suggestions} = this.props;
    const {input} = this.state;
    if (!suggestions || !input) {
      return null;
    }

    return (
      <View style={styles.commandPreview}>
        {suggestions.commands.map((command: SuggestedCommand, index: number) => (
          <View key={command.description}>
            <Text style={[styles.commandDescription, command.error && styles.commandDescriptionError]}>
              {index + 1}: {ApiHelper.stripHtml(command.description)}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  _renderSuggestion = ({item}) => {
    const suggestion: CommandSuggestion = item;
    return (
      <TouchableOpacity style={styles.suggestionRow} onPress={() => this.onApplySuggestion(suggestion)}>
        <View style={styles.suggestionDescriptionContainer}>
          <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
        </View>
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionText}>{suggestion.option}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  _extractKey = (item: CommandSuggestion) => item.id + item.option + item.description;

  _renderSuggestions() {
    const {suggestions} = this.props;
    return (
      <AnimatedView
        style={styles.animatedListContainer}
        animation="fadeIn"
        useNativeDriver
        duration={SHOW_LIST_ANIMATION_DURATION}
      >
        <View style={styles.listContainer}>
          {suggestions && (
            <FlatList
              contentContainerStyle={styles.suggestionsList}
              data={suggestions.suggestions}
              keyExtractor={this._extractKey}
              renderItem={this._renderSuggestion}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </AnimatedView>
    );
  }

  render() {
    return (
      <Modal visible>
        <Header
          leftButton={<Text>Cancel</Text>}
          onBack={this.props.onCancel}
        >
          <Text style={styles.headerText}>{this.props.headerContent}</Text>
        </Header>
        {this._renderCommandPreview()}
        {this._renderSuggestions()}
        {this._renderInput()}
        {Platform.OS === 'ios' && <KeyboardSpacer style={styles.keyboardSpacer}/>}
      </Modal>
    );
  }
}
