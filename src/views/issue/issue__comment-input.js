/* @flow */

import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import debounce from 'lodash.debounce';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';

import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import IconAttach from '@jetbrains/icons/attachment.svg';
import IconHourGlass from '@jetbrains/icons/hourglass.svg';
import log from '../../components/log/log';
import Mentions from '../../components/mentions/mentions';
import MultilineInput from '../../components/multiline-input/multiline-input';
import usage from '../../components/usage/usage';
import VisibilityControl from '../../components/visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../../components/analytics/analytics-ids';
import {attachmentActions} from './activity/issue-activity__attachment-actions-and-types';
import {commentPlaceholderText} from '../../app-text';
import {composeSuggestionText, getSuggestWord} from '../../components/mentions/mension-helper';
import {IconArrowUp} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './issue__comment-input.styles';

import type {Attachment, IssueComment} from '../../flow/CustomFields';
import type {AppState} from '../../reducers';
import type {Node} from 'react';
import type {Theme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';
import type {CustomError} from '../../flow/Error';


type Props = {
  onCommentChange: (comment: IssueComment) => any,
  onSubmitComment: (comment: IssueComment) => any,
  editingComment: ?$Shape<IssueComment>,
  suggestionsAreLoading: boolean,
  getCommentSuggestions: (query: string) => any,
  mentions: ?{ users: Array<User> },
  getCommentVisibilityOptions: () => Array<User | UserGroup>,
  canAttach: boolean,
  onAddSpentTime: (() => any) | null,
  onAttach: () => any,
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
  const dispatch = useDispatch();
  const theme: Theme = useContext(ThemeContext);
  const [state, updateState] = useState({
    isSaving: false,
    isAttachDialogVisible: false,
    editingComment: EMPTY_COMMENT,
    isLoadingSuggestions: false,
    showSuggestions: false,
    suggestionsQuery: '',
    suggestedUsers: [],
    commentCaret: 0,
    isVisibilityControlVisible: false,
    isSelectVisible: false,
  });
  const attachingImage: ?Attachment = useSelector((appState: AppState) => appState.issueActivity.attachingImage);
  const isAttachFileDialogVisible: boolean = useSelector((appState: AppState) => (
    appState.issueActivity.isAttachFileDialogVisible
  ));
  const removingImageId: string | null = useSelector((appState: AppState) => appState.issueActivity.removingImageId);

  let editCommentInput: MultilineInput;

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
    if (props.editingComment) {
      changeState({editingComment: {...state.editingComment, ...props.editingComment}});
    }
  }, [props.editingComment]);

  useEffect(() => {
    if (removingImageId) {
      const attachments: Array<Attachment> = state.editingComment?.attachments || [];
      const targetAttachment: Attachment = attachments.find((it: Attachment) => it.id === removingImageId);
      if (targetAttachment) {
        debouncedChange({
          ...props.editingComment,
          attachments: attachments.filter((it: Attachment) => it.id !== removingImageId)
        });
      }
    }
  }, [removingImageId]);

  const setComment = (editingComment: $Shape<IssueComment> = EMPTY_COMMENT): void => {
    changeState({editingComment});
  };

  const focus = (): void => {editCommentInput.focus();};

  const toggleVisibilityControl = (isVisibilityControlVisible: boolean): void => {
    changeState({isVisibilityControlVisible});
  };

  const submitComment = (): void => {
    toggleSaving(true);
    toggleVisibilityControl(false);
    props.onSubmitComment({
      ...props.editingComment,
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
      uiTheme={theme.uiTheme}
      getOptions={props.getCommentVisibilityOptions}
    />;
  };

  const renderSendButton = (): Node => {
    const {editingComment, isSaving} = state;
    const isDisabled: boolean = state.isSaving || (!state.editingComment.text && !editingComment.attachments);
    return (
      <TouchableOpacity
        style={[
          styles.commentSendButton,
          isDisabled ? styles.commentSendButtonDisabled : null
        ]}
        disabled={isDisabled}
        onPress={submitComment}>
        {!isSaving && (
          <IconArrowUp
            size={22}
            color={theme.uiTheme.colors.$textButton}
          />
        )}
        {isSaving && <ActivityIndicator color={theme.uiTheme.colors.$background}/>}
      </TouchableOpacity>
    );
  };

  const renderAttachFileDialog = () => {
    return (
      <AttachFileDialog
        hideVisibility={true}
        actions={attachmentActions.createAttachActions(dispatch)}
        attach={attachingImage}
        onCancel={() => {
          dispatch(attachmentActions.cancelImageAttaching());
          dispatch(attachmentActions.toggleAttachFileDialog(false));
        }}
        onAttach={async (file: Attachment, onAttachingFinish: () => any) => {
          if (!state.editingComment.id) {
            await props.onCommentChange(state.editingComment);
          }
          const attachments: Array<Attachment> = await dispatch(attachmentActions.uploadFileToDraftComment(file)) || [];
          onAttachingFinish();
          debouncedChange({...state.editingComment, attachments});
        }}
        uiTheme={theme.uiTheme}
      />
    );
  };


  const {isSaving, commentCaret, showSuggestions, editingComment, isVisibilityControlVisible, isSelectVisible} = state;
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
        {!!props.onAddSpentTime && <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionsContainerButton}
            onPress={props.onAddSpentTime}
          >
            <IconHourGlass
              fill={styles.actionsContainerButton.color}
              width={26}
              height={26}
            />
          </TouchableOpacity>
          {props.canAttach && (
            <TouchableOpacity
              style={styles.actionsContainerButton}
              disabled={isSaving || showSuggestions}
              onPress={() => dispatch(attachmentActions.toggleAttachFileDialog(true))}
            >
              <IconAttach
                fill={
                  isSaving || showSuggestions
                    ? styles.actionsContainerButtonDisabled.color
                    : styles.actionsContainerButton.color
                }
                width={26}
                height={26}
              />
            </TouchableOpacity>
          )}
        </View>}

        <View style={styles.commentInputContainer}>
          <MultilineInput
            {...{...props, autoFocus: !!editingComment.reply}}
            ref={(instance: ?MultilineInput) => instance && (editCommentInput = instance)}
            placeholder={commentPlaceholderText}
            value={editingComment.text}
            editable={!isSaving}
            underlineColorAndroid="transparent"
            keyboardAppearance={theme.uiTheme.name}
            placeholderTextColor={theme.uiTheme.colors.$icon}
            autoCapitalize="sentences"
            onSelectionChange={(event) => {
              changeState({commentCaret: event.nativeEvent.selection.start});
            }}
            onChangeText={(text) => {
              const updatedDraftComment: $Shape<IssueComment> = {
                ...editingComment,
                text: text,
              };
              setComment(updatedDraftComment);
              suggestionsNeededDetector(text, commentCaret);
              debouncedChange(updatedDraftComment);
            }}
            onFocus={() => toggleVisibilityControl(true)}
            onBlur={() => {
              changeState({showSuggestions: false});
              toggleVisibilityControl(false);
            }}
            style={styles.commentInput}
          />

          {Boolean(hasText || editingComment?.attachments) && renderSendButton()}
        </View>
      </View>

      {editingComment?.attachments?.length > 0 && (
        <AttachmentsRow
          style={styles.attachmentsContainer}
          attachments={editingComment.attachments}
          attachingImage={null}
          onImageLoadingError={(err: CustomError) => log.warn('onImageLoadingError', err.nativeEvent)}
          onOpenAttachment={() => (
            usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Preview comment attachment')
          )}
          canRemoveAttachment={true}
          onRemoveImage={(attachment: Attachment) => dispatch(
            attachmentActions.removeAttachmentFromDraftComment(attachment)
          )}
          uiTheme={theme.uiTheme}
        />
      )}

      {isAttachFileDialogVisible && renderAttachFileDialog()}
    </View>
  );
};

export default React.memo<any>(IssueCommentInput);
