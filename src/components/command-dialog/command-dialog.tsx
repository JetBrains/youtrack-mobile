import React, {Component} from 'react';
import {View, TouchableOpacity, Text, TextInput, ActivityIndicator} from 'react-native';

import debounce from 'lodash.debounce';

import ApiHelper from 'components/api/api__helper';
import CommandDialogSuggestions from 'components/command-dialog/command-dialog-suggestions';
import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconCheck} from 'components/icon/icon';
import {KeyboardWrapper} from 'components/keyboard/keboard-wrapper';

import styles from './command-dialog.styles';

import type {CommandSuggestionResponse, CommandSuggestion, SuggestedCommand} from 'types/Issue';
import type {UITheme} from 'types/Theme';

interface Props {
  suggestions: CommandSuggestionResponse | null | undefined;
  initialCommand: string;
  onApply: (command: string) => void;
  onChange: (command: string, caret: number) => void;
  isApplying: boolean;
  onCancel: () => unknown;
  uiTheme: UITheme;
}

interface State {
  displayCancelSearch: boolean;
  inputValue: string;
}

export default class CommandDialog extends Component<Props, State> {
  state: State = {
    displayCancelSearch: false,
    inputValue: '',
  };
  lastUsedParams: {command: string | null; caret: number} = {command: null, caret: 0};
  latestInputValueForSearch: string = '';
  private textInputRef: React.RefObject<TextInput> = React.createRef<TextInput>();

  onSearch = debounce((command: string, caret: number) => {
    if (this.lastUsedParams.command === command && this.lastUsedParams.caret === caret) {
      return;
    }

    this.lastUsedParams = {command, caret};
    if (this.props.onChange) {
      this.props.onChange(command, caret);
    }
  }, 150);

  componentDidMount() {
    const {initialCommand} = this.props;

    if (initialCommand) {
      this.latestInputValueForSearch = initialCommand;
      this.setState({
        inputValue: initialCommand,
      });
    }

    this.onSearch(initialCommand, initialCommand.length);
  }

  componentWillUnmount() {
    this.onSearch.cancel();
  }

  onChangeText = (text: string) => {
    this.latestInputValueForSearch = text;
    this.setState({inputValue: text});
  };

  onSelectionChange = (event: Record<string, any>) => {
    const caret = event.nativeEvent.selection.start;
    this.onSearch(this.latestInputValueForSearch, caret);
  };

  onApplySuggestion = (suggestion: CommandSuggestion) => {
    const suggestionText = `${suggestion.prefix || ''}${suggestion.option}${suggestion.suffix || ''}`;
    const oldQuery = this.state.inputValue || '';
    const newQuery =
      oldQuery.substring(0, suggestion.completionStart) + suggestionText + oldQuery.substring(suggestion.completionEnd);
    this.latestInputValueForSearch = newQuery;
    this.setState({inputValue: newQuery});
    this.onSearch(newQuery, suggestion.caret);
    setTimeout(() => this.textInputRef.current?.focus(), 0);
  };

  onApply = () => {
    this.props.onApply(this.state.inputValue);
  };

  canApplyCommand(): boolean {
    const {inputValue} = this.state;
    const {isApplying, suggestions} = this.props;
    return !!inputValue && !isApplying && !!suggestions && suggestions.commands.every(command => !command.error);
  }

  _renderInput() {
    const {inputValue} = this.state;
    const {isApplying, uiTheme} = this.props;
    return (
      <TextInput
        ref={this.textInputRef}
        style={styles.searchInput}
        placeholderTextColor={uiTheme.colors.$icon}
        placeholder={i18n('Enter command')}
        clearButtonMode="while-editing"
        returnKeyType="done"
        testID="test:id/selectInput"
        accessibilityLabel="selectInput"
        accessible={true}
        autoFocus={true}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        value={inputValue}
        editable={!isApplying}
        onSubmitEditing={() => {
          if (this.canApplyCommand()) {
            this.onApply();
          }
        }}
        onChangeText={this.onChangeText}
        onSelectionChange={this.onSelectionChange}
      />
    );
  }

  _renderCommandPreview() {
    const {suggestions} = this.props;
    const {inputValue} = this.state;

    if (!suggestions || !inputValue) {
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

  renderContent() {
    const {isApplying, uiTheme, suggestions} = this.props;
    const canApply = this.canApplyCommand();
    return (
      <KeyboardWrapper isInModal={true}>
        <View style={styles.container}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              testID="test:id/selectBackButton"
              accessibilityLabel="selectBackButton"
              accessible={true}
              onPress={this.props.onCancel}
            >
              <IconBack />
            </TouchableOpacity>

            {this._renderInput()}

            <TouchableOpacity
              testID="test:id/applyButton"
              accessibilityLabel="applyButton"
              accessible={true}
              disabled={!canApply}
              style={styles.applyButton}
              onPress={() => this.onApply()}
            >
              {isApplying ? (
                <ActivityIndicator color={uiTheme.colors.$link} />
              ) : (
                <IconCheck color={canApply ? uiTheme.colors.$link : uiTheme.colors.$disabled} />
              )}
            </TouchableOpacity>
          </View>

          {this._renderCommandPreview()}

          {!!suggestions && (
            <CommandDialogSuggestions suggestions={suggestions} onApplySuggestion={this.onApplySuggestion} />
          )}
        </View>
      </KeyboardWrapper>
    );
  }

  render() {
    return <ModalView>{this.renderContent()}</ModalView>;
  }
}

export class CommandDialogModal extends CommandDialog {
  render() {
    return <ModalPortal onHide={this.props.onCancel}>{this.renderContent()}</ModalPortal>;
  }
}
