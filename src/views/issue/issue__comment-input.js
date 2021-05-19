/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import debounce from 'lodash.debounce';
import {TouchableOpacity} from 'react-native-gesture-handler';

import IconHourGlass from '@jetbrains/icons/hourglass.svg';
import Mentions from '../../components/mentions/mentions';
import MultilineInput from '../../components/multiline-input/multiline-input';
import VisibilityControl from '../../components/visibility/visibility-control';
import {commentPlaceholderText} from '../../app-text';
import {composeSuggestionText, getSuggestWord} from '../../components/mentions/mension-helper';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconArrowUp} from '../../components/icon/icon';

import styles from './issue__comment-input.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {Node} from 'react';
import type {UITheme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';

type DraftGetterResponse = { draft: IssueComment | null };
type Props = {
  draftGetter: () => Promise<DraftGetterResponse>,
  onCommentChange?: (comment: IssueComment) => any,
  onSubmitComment: (comment: IssueComment) => any,
  editingComment: ?$Shape<IssueComment>,
  suggestionsAreLoading: boolean,
  getCommentSuggestions: (query: string) => any,
  mentions: ?{ users: Array<User> },
  getCommentVisibilityOptions: () => Array<User | UserGroup>,
  canAttach: boolean,
  onAddSpentTime: (() => any) | null,
  onAttach: () => any,
  uiTheme: UITheme,
};

type State = {
  isSaving: boolean,
  editingComment: $Shape<IssueComment>,
  isLoadingSuggestions: boolean,
  showSuggestions: boolean,
  suggestionsQuery: string,
  commentCaret: number,
  suggestedUsers: Array<User>,
  isVisibilityControlVisible: boolean,
  isSelectVisible: boolean,
};

const EMPTY_COMMENT: $Shape<IssueComment> = {text: '', visibility: null};


const IssueCommentInput = (props: Props) => {
  let editCommentInput: MultilineInput;

  const [state, updateState] = useState({
    isSaving: false,
    editingComment: EMPTY_COMMENT,
    isLoadingSuggestions: false,
    showSuggestions: false,
    suggestionsQuery: '',
    suggestedUsers: [],
    commentCaret: 0,
    isVisibilityControlVisible: false,
    isSelectVisible: false,
  });

  const onChange = (editingComment: $Shape<IssueComment> | null): void => {
    props.onCommentChange && props.onCommentChange(editingComment);
  };

  const changeState = (statePart: $Shape<State>): void => {
    updateState((prevState: State) => ({...prevState, ...statePart}));
  };

  const toggleSaving = (isSaving: boolean) => {
    changeState({isSaving});
  };

  const debouncedChange = useCallback(debounce((draft: $Shape<IssueComment>) => (
    onChange(draft)
  ), 300), []);

  useEffect(() => {
    toggleSaving(true);
    props.draftGetter().then((draft: IssueComment | null) => {
      if (draft) {
        changeState({editingComment: draft});
      }
    }).finally(() => toggleSaving(false));
    return () => onChange(null);
  }, []);

  useEffect(() => {
    debouncedChange(state.editingComment);
  }, [state.editingComment]);

  const setComment = (editingComment: $Shape<IssueComment> = EMPTY_COMMENT): void => {
    changeState({editingComment});
  };

  const focus = (): void => {editCommentInput.focus();};

  const toggleVisibilityControl = (isVisibilityControlVisible: boolean): void => {
    changeState({isVisibilityControlVisible});
  };

  const updateComment = (): void => {
    toggleSaving(true);
    toggleVisibilityControl(false);
    props.onSubmitComment({
      ...state.editingComment,
      usesMarkdown: true,
    }).then(() => setComment()).finally(() => toggleSaving(false));
  };

  const suggestionsNeededDetector = (text: string, caret: number): void => {
    let word: ?string = ((getSuggestWord(text, caret): any): string | null);
    if (!word) {
      return changeState({
        showSuggestions: false,
        suggestionsQuery: '',
      });
    }

    if (word === '@') {
      word = word.slice(1);
      changeState({
        showSuggestions: true,
        suggestionsQuery: word,
      });
      props.getCommentSuggestions(word);
    }
  };

  const applySuggestion = (user: User) => {
    const newText: ?string = composeSuggestionText(user, editingComment.text, state.commentCaret);
    if (newText) {
      changeState({
        editingComment: {...editingComment, text: `${newText} `},
        showSuggestions: false,
        isVisibilityControlVisible: true,
      });
    }
  };


  const renderUserMentions = (): Node => {
    return (
      <Mentions
        isLoading={props.suggestionsAreLoading}
        mentions={props.mentions}
        onApply={(user: User) => {
          applySuggestion(user);
          setTimeout(focus, 150);
        }}
      />
    );
  };

  const renderVisibility = (): Node => {
    const toggleSelectVisibility = (isSelectVisible: boolean) => changeState({isSelectVisible});
    return <VisibilityControl
      onShow={() => toggleSelectVisibility(true)}
      onHidde={() => toggleSelectVisibility(false)}
      visibility={state.editingComment.visibility}
      onSubmit={(visibility: Visibility) => {
        const comment: $Shape<IssueComment> = {
          ...state.editingComment,
          visibility,
        };
        setComment(comment);
        onChange(comment);
      }}
      uiTheme={props.uiTheme}
      getOptions={props.getCommentVisibilityOptions}
    />;
  };

  const renderSendButton = (): Node => {
    const isDisabled: boolean = !(state.editingComment.text || '').trim() || state.isSaving;

    return (
      <TouchableOpacity
        style={[
          styles.commentSendButton,
          isDisabled ? styles.commentSendButtonDisabled : null
        ]}
        disabled={isDisabled}
        onPress={updateComment}>
        {!state.isSaving && (
          <IconArrowUp
            size={22}
            color={props.uiTheme.colors.$textButton}
          />
        )}
        {state.isSaving && <ActivityIndicator color={props.uiTheme.colors.$background}/>}
      </TouchableOpacity>
    );
  };

  const setInputRef: (instance: ?MultilineInput) => ?MultilineInput = (instance: ?MultilineInput) => (
    instance && (editCommentInput = instance)
  );

  const {uiTheme, onAddSpentTime} = props;
  const {
    isSaving,
    commentCaret,
    showSuggestions,
    editingComment,
    isVisibilityControlVisible,
    isSelectVisible
  } = state;
  const hasText: boolean = !!editingComment.text;
  const showVisibilityControl: boolean = !showSuggestions && (
    editingComment.visibility ||
    isSelectVisible ||
    isVisibilityControlVisible
  );

  return (
    <View style={styles.container}>
      {showSuggestions && renderUserMentions()}

      <View style={[
        styles.commentHeaderContainer,
        showVisibilityControl ? styles.commentHeaderContainerCreate : null,
      ]}>

        {showVisibilityControl && renderVisibility()}

      </View>

      <View style={styles.commentContainer}>
        {!!onAddSpentTime && <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionsContainerIcon}
            hitSlop={HIT_SLOP}
            onPress={onAddSpentTime}
          >
            <IconHourGlass
              fill={styles.actionsContainerIcon.color}
              width={26}
              height={26}
            />
          </TouchableOpacity>
        </View>}

        <View style={styles.commentInputContainer}>
          <MultilineInput
            ref={setInputRef}
            {...{...props, autoFocus: !!editingComment.reply}}
            placeholder={commentPlaceholderText}
            value={editingComment.text}
            editable={!isSaving}
            underlineColorAndroid="transparent"
            keyboardAppearance={uiTheme.name}
            placeholderTextColor={uiTheme.colors.$icon}
            autoCapitalize="sentences"
            onSelectionChange={(event) => {
              changeState({commentCaret: event.nativeEvent.selection.start});
            }}
            onChangeText={(text) => {
              setComment({...editingComment, text: text});
              suggestionsNeededDetector(text, commentCaret);
            }}
            onFocus={() => toggleVisibilityControl(true)}
            onBlur={() => {
              changeState({showSuggestions: false});
              toggleVisibilityControl(false);
            }}
            style={styles.commentInput}
          />

          {hasText && renderSendButton()}
        </View>
      </View>
    </View>
  );
};

export default React.memo<any>(IssueCommentInput);
