/* @flow */
import {View, TouchableOpacity, Text, TextInput, FlatList, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import styles from './command-dialog.styles';
import {COLOR_ICON_MEDIUM_GREY, COLOR_PINK, COLOR_PLACEHOLDER} from '../variables/variables';
import throttle from 'lodash.throttle';
import Header from '../../components/header/header';
import ApiHelper from '../../components/api/api__helper';
import type {CommandSuggestionResponse, CommandSuggestion, SuggestedCommand} from '../../flow/Issue';
import ModalView from '../modal-view/modal-view';
import KeyboardSpacerIOS from '../platform/keyboard-spacer.ios';
import {IconCheck, IconClose} from '../icon/icon';

const SEARCH_THROTTLE = 30;

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
          returnKeyType="done"
          testID="command-input"
          autoFocus
          autoCorrect={false}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          value={input}
          editable={!isApplying}
          onSubmitEditing={() => {
            canApply && this.onApply();
          }}
          onChangeText={text => this.setState({input: text})}
          onSelectionChange={event => this.onSearch(input, event.nativeEvent.selection.start)}
        />

        {isApplying && <ActivityIndicator/>}
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
    );
  }

  render() {
    const {isApplying, suggestions} = this.props;
    const canApply = !isApplying && suggestions && suggestions.commands.every(command => !command.error);

    return (
      <ModalView
        visible
        animationType="fade"
        style={styles.modal}
      >
        <Header
          leftButton={<IconClose size={24} color={COLOR_PINK}/>}

          rightButton={
            <IconCheck testID="command-apply" size={24} color={canApply ? COLOR_PINK : COLOR_ICON_MEDIUM_GREY}/>
          }
          onRightButtonClick={() => canApply && this.onApply()}

          onBack={this.props.onCancel}
        >
          <Text style={styles.headerText}>{this.props.headerContent}</Text>
        </Header>

        {this._renderInput()}
        {this._renderCommandPreview()}
        {this._renderSuggestions()}

        {<KeyboardSpacerIOS/>}
      </ModalView>
    );
  }
}
