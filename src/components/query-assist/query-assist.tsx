import React from 'react';
import {View, TouchableOpacity, TextInput} from 'react-native';

import debounce from 'lodash.debounce';
import {View as AnimatedView} from 'react-native-animatable';

import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import QueryAssistSuggestionsList from './query-assist__suggestions-list';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconClose} from 'components/icon/icon';
import {KeyboardWrapper} from 'components/keyboard/keboard-wrapper';

import styles from './query-assist.styles';

import type {AssistSuggest, TransformedSuggestion} from 'types/Issue';
import type {Folder} from 'types/User';

const SHOW_LIST_ANIMATION_DURATION = 500;

interface Props {
  suggestions: AssistSuggest[];
  currentQuery: string;
  onApplyQuery: (query: string) => any;
  onChange: (query: string, caret: number) => any;
  onClose: (query: string) => any;
}

interface State {
  inputValue: string;
  caret: number;
  queryCopy: string;
  suggestionsListTop: number;
}

export class QueryAssist<P extends Props, S extends State> extends React.PureComponent<P, S> {
  private searchInputRef: React.RefObject<TextInput> = React.createRef<TextInput>();
  private lastQueryParams: {query: string; caret: number;} = {
    query: '',
    caret: 0,
  };
  initialState: State = {
    inputValue: '',
    caret: 0,
    queryCopy: '',
    suggestionsListTop: 0,
  };

  constructor(props: P) {
    super(props);
    this.state = Object.assign({}, this.initialState) as S;
  }

  onSearch = debounce((query: string, caret: number) => {
    if (this.lastQueryParams.query === query || this.lastQueryParams.caret === caret) {
      return;
    }

    this.lastQueryParams = {query, caret};
    this.setState({inputValue: query, caret});
    this.props.onChange(query, caret);
  }, 100);

  resetState = () => {
    this.setState(this.initialState);
  };

  blurInput() {
    this.searchInputRef.current?.blur?.();
  }

  focusInput() {
    this.searchInputRef.current?.focus?.();
  }

  cancelSearch() {
    this.blurInput();
    this.setState({
      inputValue: this.state.queryCopy,
    });
  }

  beginEditing() {
    let {inputValue} = this.state;
    inputValue = inputValue || '';
    this.setState({
      queryCopy: inputValue,
      suggestionsListTop: 0,
    });
    this.props.onChange(inputValue, inputValue.length);
  }

  onSubmitEditing = () => {
    this.blurInput();
    this.props.onApplyQuery(this.state.inputValue || '');
  };

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.currentQuery !== this.props.currentQuery) {
      this.setState({
        inputValue: newProps.currentQuery,
      });
    }
  }

  componentDidMount() {
    this.setState({
      inputValue: this.props.currentQuery,
    });
  }

  onApplySuggestion: (suggestion: TransformedSuggestion) => void = (suggestion: TransformedSuggestion) => {
    const suggestionText = `${suggestion.prefix}${suggestion.option}${suggestion.suffix}`;
    const oldQuery = this.state.inputValue || '';
    const leftPartAndNewQuery = oldQuery.substring(0, suggestion.completionStart) + suggestionText;
    const newQuery = leftPartAndNewQuery + oldQuery.substring(suggestion.completionEnd);
    this.setState({
      inputValue: newQuery,
    });
    this.props.onChange(newQuery, leftPartAndNewQuery.length);
    setTimeout(() => this.focusInput(), 0);
  };

  onApplySavedQuery = (savedQuery: Folder) => {
    this.setState({inputValue: savedQuery.query});
    this.blurInput();
    this.props.onApplyQuery(savedQuery.query);
  };

  onClose = () => {
    this.cancelSearch();
    this.props.onClose(this.state.inputValue);
  };

  renderCloseButton() {
    return <IconBack color={styles.link.color} />;
  }

  _renderInput() {
    const {inputValue} = this.state;
    return (
      <View style={[styles.inputWrapper, styles.inputWrapperActive]}>
        <TouchableOpacity
          testID="query-assist-cancel"
          accessibilityLabel="query-assist-cancel"
          accessible={true}
          onPress={this.onClose}
        >
          {this.renderCloseButton()}
        </TouchableOpacity>

        <TextInput
          ref={this.searchInputRef}
          testID="test:id/query-assist-input"
          accessible={true}
          style={styles.searchInputWithMinHeight}
          placeholderTextColor={styles.clearIcon.color}
          placeholder={i18n('Enter search request')}
          clearButtonMode="never"
          returnKeyType="search"
          autoFocus={true}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          onFocus={() => this.beginEditing()}
          onSubmitEditing={() => this.onSubmitEditing()}
          onChangeText={text =>
            this.setState({
              inputValue: text,
            })
          }
          onSelectionChange={event => this.onSearch(inputValue, event.nativeEvent.selection.start)}
          value={inputValue}
        />

        {!!inputValue && (
          <TouchableOpacity onPress={this.resetState} hitSlop={HIT_SLOP} style={styles.clearIcon}>
            <IconClose size={18} color={styles.clearIcon.color} />
          </TouchableOpacity>
        )}
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
      <ModalView animationType="fade" style={styles.container}>
        <KeyboardWrapper>
          {this._renderInput()}
          {this._renderSuggestions()}
        </KeyboardWrapper>
      </ModalView>
    );
  }
}


export class QueryAssistModal extends QueryAssist<Props, State & { visible: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = {...this.state, visible: true};
  }

  onHide = (): void => {
    this.setState({
      visible: false,
    });
  };

  onClose() {
    super.onClose();
    this.onHide();
  }

  onApplySavedQuery(savedQuery: Folder) {
    super.onApplyQuery(savedQuery.query);
    this.onHide();
  }

  onSubmitEditing() {
    super.onSubmitEditing();
    this.onHide();
  }

  renderCloseButton() {
    return <IconClose size={21} color={styles.link.color} />;
  }

  render() {
    return (
      <ModalPortal onHide={this.onClose}>
        <KeyboardWrapper isInModal={true}>
          {this._renderInput()}
          {this._renderSuggestions()}
        </KeyboardWrapper>
      </ModalPortal>
    );
  }
}


export default QueryAssist;
