import React, {Component} from 'react';
import {View, TouchableOpacity, Text, TextInput, ActivityIndicator} from 'react-native';

import debounce from 'lodash.debounce';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

import ApiHelper from 'components/api/api__helper';
import CommandDialogSuggestions from 'components/command-dialog/command-dialog-suggestions';
import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconCheck} from 'components/icon/icon';

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
  caret: number;
}

export default class CommandDialog extends Component<Props, State> {
  state: State = {
    displayCancelSearch: false,
    inputValue: '',
    caret: 0,
  };
  lastUsedParams: {command: string | null; caret: number} = {command: null, caret: 0};

  onSearch = debounce((command: string, caret: number) => {
    if (this.lastUsedParams.command === command && this.lastUsedParams.caret === caret) {
      return;
    }

    this.lastUsedParams = {command, caret};
    this.setState({inputValue: command, caret});
    if (this.props.onChange) {
      this.props.onChange(command, caret);
    }
  }, 150);

  componentDidMount() {
    const {initialCommand} = this.props;

    if (initialCommand) {
      this.setState({
        inputValue: initialCommand,
        caret: initialCommand.length,
      });
    }

    this.onSearch(initialCommand, initialCommand.length);
  }

  onApplySuggestion = (suggestion: CommandSuggestion) => {
    const suggestionText = `${suggestion.prefix || ''}${suggestion.option}${suggestion.suffix || ''}`;
    const oldQuery = this.state.inputValue || '';
    const newQuery =
      oldQuery.substring(0, suggestion.completionStart) + suggestionText + oldQuery.substring(suggestion.completionEnd);
    this.setState({inputValue: newQuery});
    this.onSearch(newQuery, suggestion.caret);
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
        onChangeText={text => this.setState({inputValue: text})}
        onSelectionChange={event => this.onSearch(inputValue, event.nativeEvent.selection.start)}
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
          <KeyboardAwareScrollView>
            <CommandDialogSuggestions suggestions={suggestions} onApplySuggestion={this.onApplySuggestion} />
          </KeyboardAwareScrollView>
        )}
      </View>
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
