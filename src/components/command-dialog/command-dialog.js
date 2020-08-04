/* @flow */
import {View, TouchableOpacity, Text, TextInput, FlatList, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {COLOR_GRAY, COLOR_PINK, COLOR_PLACEHOLDER} from '../variables/variables';
import throttle from 'lodash.throttle';
import ApiHelper from '../../components/api/api__helper';
import ModalView from '../modal-view/modal-view';
import KeyboardSpacerIOS from '../platform/keyboard-spacer.ios';
import {IconBack, IconCheck} from '../icon/icon';

import styles from './command-dialog.styles';

import type {CommandSuggestionResponse, CommandSuggestion, SuggestedCommand} from '../../flow/Issue';
import SelectItem from '../select/select__item';

type Props = {
  headerContent: string,
  suggestions: ?CommandSuggestionResponse,
  initialCommand: string,
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

const SEARCH_THROTTLE = 30;

export default class CommandDialog extends Component<Props, State> {
  static defaultProps: DefaultProps = {
    onChange: () => {}
  };
  state: State = {
    displayCancelSearch: false,
    input: '',
    caret: 0
  };
  lastUsedParams: { command: ?string, caret: number } = {command: null, caret: 0};
  onSearch = throttle((command: string, caret: number) => {
    if (this.lastUsedParams.command === command && this.lastUsedParams.caret === caret) {
      return;
    }
    this.lastUsedParams = {command, caret};

    this.setState({input: command, caret});
    this.props.onChange(command, caret);
  }, SEARCH_THROTTLE);

  componentDidMount() {
    const {initialCommand} = this.props;
    if (initialCommand) {
      this.setState({input: initialCommand, caret: initialCommand.length});
    }

    this.onSearch(initialCommand, initialCommand.length);
  }

  onApplySuggestion = (suggestion: CommandSuggestion) => {
    const suggestionText = `${suggestion.prefix || ''}${suggestion.option}${suggestion.suffix || ''}`;
    const oldQuery = this.state.input || '';
    const newQuery = oldQuery.substring(0, suggestion.completionStart) + suggestionText + oldQuery.substring(suggestion.completionEnd);
    this.setState({input: newQuery});
    this.onSearch(newQuery, suggestion.caret);
  };

  onApply = () => {
    this.props.onApply(this.state.input);
  };

  canApplyCommand(): boolean {
    const {input} = this.state;
    const {isApplying, suggestions} = this.props;
    return !!input && !isApplying && !!suggestions && suggestions.commands.every(command => !command.error);
  }

  _renderInput() {
    const {input} = this.state;
    const {isApplying} = this.props;

    return (
      <TextInput
        style={styles.searchInput}
        placeholderTextColor={COLOR_PLACEHOLDER}
        placeholder="Enter command"
        clearButtonMode="while-editing"
        returnKeyType="done"
        testID="command-input"
        autoFocus
        autoCorrect={false}
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        value={input}
        editable={!isApplying}
        onSubmitEditing={() => {
          this.canApplyCommand() && this.onApply();
        }}
        onChangeText={text => this.setState({input: text})}
        onSelectionChange={event => this.onSearch(input, event.nativeEvent.selection.start)}
      />
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

  _renderSuggestion = (suggestion: CommandSuggestion) => {
    return (
      <SelectItem
        item={suggestion}
        titleRenderer={() => (
          <View style={styles.suggestion}>
            <Text numberOfLines={2} style={styles.suggestionDescription}>{suggestion.description}</Text>
            <Text style={styles.suggestionText}>{suggestion.option}</Text>
          </View>
        )}
        onPress={() => this.onApplySuggestion(suggestion)}
        isSelected={false}
      />
    );
  };

  _extractKey = (item: CommandSuggestion) => item.id + item.option + item.description;

  _renderSuggestions() {
    const {suggestions} = this.props;
    return (
      <View style={styles.listContainer}>
        {suggestions && (
          <FlatList
            data={suggestions.suggestions}
            keyExtractor={this._extractKey}
            renderItem={(listItem) => this._renderSuggestion(listItem.item)}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    );
  }

  render() {
    const {isApplying} = this.props;
    const canApply = this.canApplyCommand();

    return (
      <ModalView
        animationType="slide"
      >
        <View style={styles.inputWrapper}>

          <TouchableOpacity
            testID="commandBackButton"
            onPress={this.props.onCancel}
          >
            <IconBack size={28}/>
          </TouchableOpacity>

          {this._renderInput()}

          <TouchableOpacity
            testID="command-apply"
            disabled={!canApply}
            style={styles.applyButton}
            onPress={() => this.onApply()}
          >
            <IconCheck size={20} color={canApply ? COLOR_PINK : COLOR_GRAY}/>
          </TouchableOpacity>

        </View>

        {this._renderCommandPreview()}

        {this._renderSuggestions()}

        {isApplying && <ActivityIndicator/>}

        {<KeyboardSpacerIOS/>}
      </ModalView>
    );
  }
}
