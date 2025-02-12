import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import IconAttachment from '@jetbrains/icons/attachment.svg';
import InputScrollView from 'react-native-input-scroll-view';
import {useDispatch} from 'react-redux';

import AttachFileDialog from 'components/attach-file/attach-file-dialog';
import AttachmentAddPanel from 'components/attachments-row/attachments-add-panel';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import Header from 'components/header/header';
import {IconAdd} from 'components/icon/icon';
import IconTime from 'components/icon/assets/time.svg';
import IssueVisibility from 'components/visibility/issue-visibility';
import log from 'components/log/log';
import Mentions from 'components/mentions/mentions';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import useIsReporter from 'components/user/useIsReporter';
import VisibilityControl from 'components/visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {
  composeSuggestionText,
  getSuggestWord,
} from 'components/mentions/mension-helper';
import {getAttachmentActions} from 'components/attachments-row/attachment-actions';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconArrowUp, IconCheck, IconClose} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables';

import styles, { MIN_INPUT_SIZE} from './comment-edit.styles';

import type {Attachment, IssueComment} from 'types/CustomFields';
import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {Theme} from 'types/Theme';
import type {User, UserMentions} from 'types/User';
import type {Visibility, VisibilityGroups} from 'types/Visibility';

interface EditingComment extends IssueComment {
  reply?: boolean;
}

export interface Props {
  canAttach: boolean;
  canCommentPublicly: boolean;
  canRemoveAttach: (attachment: Attachment) => boolean;
  canUpdateCommentVisibility?: boolean;
  editingComment: EditingComment;
  focus?: boolean;
  getCommentSuggestions: (query: string) => Promise<UserMentions>;
  getVisibilityOptions: (q: string) => Promise<VisibilityGroups>;
  header?: React.ReactNode;
  isArticle?: boolean;
  isEditMode?: boolean;
  onAddSpentTime?: (() => any) | null;
  onAttach: (files: NormalizedAttachment[], comment: IssueComment) => Promise<Attachment[]>;
  onCommentChange: (comment: IssueComment, isAttachmentChange?: boolean) => Promise<IssueComment | null>;
  onSubmitComment: (comment: IssueComment) => any;
  visibilityLabel?: string;
}

interface State {
  attachFileSource: string | null;
  commentCaret: number;
  editingComment: EditingComment;
  height: number;
  isAttachActionsVisible: boolean;
  isAttachFileDialogVisible: boolean;
  isSaving: boolean;
  isVisibilityControlVisible: boolean;
  isVisibilitySelectVisible: boolean;
  mentions: UserMentions | null;
  mentionsLoading: boolean;
  mentionsQuery: string;
  mentionsVisible: boolean;
  visibility?: Visibility;
}


const EMPTY_COMMENT: EditingComment = {
  text: '',
  updated: -1,
} as EditingComment;

const CommentEdit = (props: Props) => {
  const dispatch: ReduxThunkDispatch = useDispatch();
  const theme: Theme = React.useContext(ThemeContext);
  const attachmentActions: AttachmentActions = getAttachmentActions('issueCommentInput');
  const isReporter = useIsReporter();

  const editCommentInput = React.useRef<TextInput | null>(null);
  const editingCommentRef = React.useRef<EditingComment>(EMPTY_COMMENT);

  const [state, updateState] = React.useState<State>({
    attachFileSource: null,
    commentCaret: 0,
    editingComment: {...EMPTY_COMMENT, ...props.editingComment},
    height: UNIT * 4,
    isAttachActionsVisible: false,
    isAttachFileDialogVisible: false,
    isSaving: false,
    isVisibilityControlVisible: false,
    isVisibilitySelectVisible: false,
    mentions: null,
    mentionsLoading: false,
    mentionsQuery: '',
    mentionsVisible: false,
  });

  const changeState = (statePart: Partial<State>): void => {
    updateState((prevState: State) => ({...prevState, ...statePart}));
  };

  const setEditingComment = React.useCallback((editingComment: EditingComment) => {
    changeState({editingComment});
    editingCommentRef.current = editingComment;
  }, []);

  const setEmptyComment = () => {
    setEditingComment(EMPTY_COMMENT);
  };

  const toggleSaving = (isSaving: boolean): void => {
    changeState({isSaving});
  };

  const getCurrentComment = React.useCallback(
    (data: EditingComment | Partial<EditingComment> = {}): EditingComment => ({
      ...props.editingComment,
      attachments: state.editingComment.attachments,
      visibility: state.editingComment.visibility || props.editingComment.visibility,
      usesMarkdown: true,
      canUpdateVisibility: !!(state.editingComment.canUpdateVisibility || props.canUpdateCommentVisibility),
      ...data,
    }),
    [
      props.canUpdateCommentVisibility,
      props.editingComment,
      state.editingComment.attachments,
      state.editingComment.canUpdateVisibility,
      state.editingComment.visibility,
    ]
  );

  const onCommentChange = React.useCallback(
    async (draft: EditingComment, isAttachmentChange: boolean = false): Promise<IssueComment> => {
      toggleSaving(true);
      const comment = await props.onCommentChange(draft, isAttachmentChange);
      toggleSaving(false);
      return comment || draft;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onCommentChange]
  );
  const onSubmitComment = React.useCallback(
    async (): Promise<void> => {
      toggleVisibilityControl(false);
      toggleSaving(true);
      const draft = getCurrentComment(state.editingComment);
      const visibility = !draft.canUpdateVisibility ? undefined : draft.visibility;
      const comment = await onCommentChange({
        ...draft,
        visibility,
      });
      await props.onSubmitComment(comment);
      setEmptyComment();
      toggleSaving(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onSubmitComment, toggleSaving]
  );

  React.useEffect(() => {
    return () => {
      if (editingCommentRef.current.id || editingCommentRef.current.text || editingCommentRef.current.visibility) {
        onCommentChange(getCurrentComment(editingCommentRef.current)).then(() => setEditingComment(EMPTY_COMMENT));
      } else {
        setEditingComment(EMPTY_COMMENT);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(
    () => {
      if (
        props.editingComment?.reply === true ||
        (state.editingComment.id === undefined && props.editingComment?.id) ||
        (state.editingComment.id && state.editingComment?.updated < props.editingComment?.updated)
      ) {
        const comment: EditingComment = {...state.editingComment, ...props.editingComment};
        setEditingComment(comment);
        changeState({commentCaret: comment.text?.length});
        if (props.editingComment.reply) {
          focus();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.editingComment, setEditingComment]
  );

  const focus = (): void => {
    editCommentInput.current?.focus();
  };

  const toggleVisibilityControl = (isVisibilityControlVisible: boolean): void => {
    changeState({isVisibilityControlVisible});
  };

  const onMentionsShow = async (
    text: string,
    caret: number,
  ): Promise<void> => {
    const word = (getSuggestWord(text, caret));
    if (!word) {
      changeState({
        mentionsVisible: false,
        mentionsQuery: '',
      });
    } else if (word[0] === '@') {
      const mentionsQuery = word.slice(1);
      changeState({
        mentionsVisible: true,
        mentionsQuery,
        mentionsLoading: true,
      });
      const mentions: UserMentions = await props.getCommentSuggestions(mentionsQuery);
      changeState({
        mentionsLoading: false,
        mentions,
      });
    }
  };

  const applySuggestion = (user: User) => {
    const newText = composeSuggestionText(
      user,
      state.editingComment.text,
      state.commentCaret,
    );

    if (newText) {
      const updatedText = `${newText} `;
      setEditingComment({
        ...state.editingComment,
        text: updatedText,
      });
      changeState({
        mentionsVisible: false,
        isVisibilityControlVisible: true,
      });
    }
  };

  const renderUserMentions = (): React.ReactNode | undefined => {
    if (state.mentionsVisible) {
      return (
        <Mentions
          style={[
            {
              maxHeight: Dimensions.get('window').height / 4.7,
            },
            props.isEditMode ? styles.mentionsEdit : styles.mentions,
          ]}
          isLoading={state.mentionsLoading}
          mentions={state.mentions}
          onApply={(user: User) => {
            applySuggestion(user);
            focus();
          }}
        />
      );
    }
  };

  const renderVisibility = () => {
    const toggleSelectVisibility = (isVisibilitySelectVisible: boolean) => changeState({isVisibilitySelectVisible});
    const enabled = state.editingComment.canUpdateVisibility || props.canUpdateCommentVisibility;
    return (
      <VisibilityControl
        color={styles.private.color}
        disabled={!enabled}
        onShow={() => toggleSelectVisibility(true)}
        onHide={() => toggleSelectVisibility(false)}
        visibility={state.editingComment.visibility}
        onSubmit={async (visibility: Visibility | null) => {
          const draft = getCurrentComment({...state.editingComment, visibility});
          setEditingComment(draft);
          await onCommentChange(draft);
        }}
        getOptions={props.getVisibilityOptions}
        visibilityDefaultLabel={props.visibilityLabel}
      />
    );
  };

  const toggleAttachFileDialog = (isAttachFileDialogVisible: boolean): void => {
    changeState({isAttachFileDialogVisible});
  };

  const renderSubmitButton = () => {
    const {isSaving} = state;
    const isDisabled: boolean = !state.editingComment.text && !state.editingComment.attachments || isSaving;
    return (
      <TouchableOpacity
        testID="test:id/commentSubmitButton"
        accessibilityLabel="commentSubmitButton"
        accessible={true}
        style={[
          styles.commentSendButton,
          isDisabled ? styles.commentSendButtonDisabled : null,
        ]}
        disabled={isDisabled}
        onPress={async () => {
          await onSubmitComment();
        }}
      >
        {!isSaving && <IconArrowUp color={styles.commentSendButtonIcon.color}/>}
        {isSaving && <ActivityIndicator color={styles.commentSendButtonIcon.backgroundColor}/>}
      </TouchableOpacity>
    );
  };

  const renderAttachFileDialog = () => {
    return (
      <AttachFileDialog
        hideVisibility={false}
        getVisibilityOptions={props.getVisibilityOptions}
        actions={{
          onAttach: async (
            files: NormalizedAttachment[],
            onAttachingFinish: () => any,
          ) => {
            let draftComment: EditingComment = state.editingComment;

            if (!draftComment.id) {
              draftComment = await onCommentChange(state.editingComment) as EditingComment;
            }

            const addedAttachments = await dispatch(props.onAttach(files, draftComment));
            onAttachingFinish();
            toggleAttachFileDialog(false);
            const updatedComment: EditingComment = getCurrentComment({
              ...state.editingComment,
              ...draftComment,
              attachments: [
                ...(state.editingComment.attachments || []),
                ...addedAttachments,
              ],
            });
            setEditingComment(updatedComment);
            onCommentChange(updatedComment, true);
          },
          onCancel: () => {
            toggleAttachFileDialog(false);
          },
        }}
      />
    );
  };

  const renderAttachments = () => {
    return (
      <AttachmentsRow
        attachments={state.editingComment.attachments}
        attachingImage={null}
        onImageLoadingError={(err: any) =>
          log.warn('onImageLoadingError', err.nativeEvent)
        }
        onOpenAttachment={() =>
          usage.trackEvent(
            ANALYTICS_ISSUE_STREAM_SECTION,
            'Preview comment attachment',
          )
        }
        userCanRemoveAttachment={(attachment: Attachment) =>
          !state.isSaving && props.canRemoveAttach(attachment)
        }
        onRemoveImage={async (attachment: Attachment) => {
          const resource = props.isArticle
            ? attachmentActions.removeAttachmentFromArticleComment
            : attachmentActions.removeAttachmentFromIssueComment;
          await dispatch(
            resource(
              attachment,
              hasType.commentDraft(state.editingComment) ? undefined : state.editingComment.id,
            ),
          );
          const attachments: Attachment[] = (
            state.editingComment.attachments || []
          ).filter((it: Attachment) => it.id !== attachment.id);
          const updatedComment: EditingComment = getCurrentComment({attachments});
          setEditingComment(updatedComment);
          await onCommentChange(updatedComment, true);

          if (props.isEditMode) {
            closeModal();
          }
        }}
        uiTheme={theme.uiTheme}
      />
    );
  };

  const renderCommentInput = (
    autoFocus: boolean,
    onFocus: (...args: any[]) => any,
    onBlur: (...args: any[]) => any,
  ) => {
    return (
      <TextInput
        testID="test:id/commentEditInput"
        accessibilityLabel="commentEditInput"
        accessible={true}
        autoCorrect={true}
        multiline={true}
        autoFocus={autoFocus || props.isEditMode}
        ref={editCommentInput}
        placeholder={i18n('Write a comment, @mention people')}
        value={state.editingComment.text}
        editable={!state.isSaving}
        underlineColorAndroid="transparent"
        keyboardAppearance={theme.uiTheme.name}
        placeholderTextColor={styles.commentInputPlaceholder.color}
        autoCapitalize="sentences"
        onSelectionChange={event => {
          changeState({commentCaret: event.nativeEvent.selection.start});
        }}
        onChangeText={(text: string) => {
          const updatedDraftComment = getCurrentComment({text});
          setEditingComment(updatedDraftComment);
          onMentionsShow(text, state.commentCaret);
        }}
        onContentSizeChange={event => {
          changeState({height: event.nativeEvent.contentSize.height});
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        style={[
          styles.commentInput,
          {
            height: Math.max(MIN_INPUT_SIZE, state.height + 8),
          },
        ]}
      />
    );
  };

  const closeModal = (): void => {
    Router.pop(true);
  };

  const hasAttachments = (): boolean => !!state.editingComment?.attachments?.length;

  const renderAddNewComment = () => {
    const {
      isSaving,
      mentionsVisible,
      isVisibilityControlVisible,
      isVisibilitySelectVisible,
      editingComment,
    } = state;

    const showVisibilityControl = !mentionsVisible && (
      IssueVisibility.isSecured(editingComment.visibility) ||
      !!editingComment.text ||
      editingComment.visibility ||
      !!editingComment?.attachments?.length ||
      (isVisibilitySelectVisible || isVisibilityControlVisible)
    );

    const hideAttachActionsPanel = () => changeState({isAttachActionsVisible: false});

    return (
      <>
        {!!editingComment.id && props.header}
        {!isReporter &&
          <View
            style={[styles.commentHeaderContainer, showVisibilityControl ? styles.commentHeaderContainerCreate : null]}
          >
            {showVisibilityControl && renderVisibility()}
          </View>
        }

        <View style={styles.commentContainer}>
          {(!!props.onAddSpentTime || props.canAttach) && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionsContainerButton}
                onPress={() =>
                  changeState({
                    isAttachActionsVisible: true,
                  })
                }
              >
                <IconAdd color={styles.actionsContainerButton.color}/>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[styles.commentInputContainer, !props.canCommentPublicly && styles.commentInputContainerHighlighted]}
          >
            {renderCommentInput(
              props.focus || !!editingComment.reply,
              () => toggleVisibilityControl(true),
              () => {
                if (!isVisibilitySelectVisible) {
                  changeState({mentionsVisible: false});
                  toggleVisibilityControl(false);
                }
              },
            )}
            {Boolean(!!editingComment.text || hasAttachments()) && renderSubmitButton()}
          </View>
        </View>

        {hasAttachments() && (
          <View style={styles.attachmentsContainer}>{renderAttachments()}</View>
        )}

        {state.isAttachActionsVisible && (
          <BottomSheetModal
            isVisible={true}
            onClose={hideAttachActionsPanel}
            withHandle={false}
            snapPoint={130}
          >
            {props.canAttach && (
              <TouchableOpacity
                style={[
                  styles.actionsContainerButton,
                  styles.floatContextButton,
                ]}
                disabled={isSaving || mentionsVisible}
                onPress={() => {
                  changeState({
                    isAttachActionsVisible: false,
                    isAttachFileDialogVisible: true,
                  });
                }}
              >
                <IconAttachment
                  width={22}
                  height={22}
                  fill={styles.actionsContainerButton.color}
                />
                <Text
                  style={[
                    styles.actionsContainerButtonText,
                    styles.floatContextButtonText,
                  ]}
                >
                  {i18n('Attach file')}
                </Text>
              </TouchableOpacity>
            )}
            {!!props.onAddSpentTime && (
              <TouchableOpacity
                style={[
                  styles.actionsContainerButton,
                  styles.floatContextButton,
                ]}
                onPress={() => {
                  changeState({
                    isAttachActionsVisible: false,
                  });

                  if (props.onAddSpentTime) {
                    props.onAddSpentTime();
                  }
                }}
              >
                <IconTime
                  color={styles.actionsContainerButton.color}
                  width={22}
                  height={22}
                />
                <Text
                  style={[
                    styles.actionsContainerButtonText,
                    styles.floatContextButtonText,
                  ]}
                >
                  {i18n('Add spent time')}
                </Text>
              </TouchableOpacity>
            )}
          </BottomSheetModal>
        )}
      </>
    );
  };

  const renderEditComment = () => {
    const isSubmitEnabled: boolean = !!state.editingComment.text || hasAttachments();
    return (
      <View style={styles.commentEditContainer}>
        {!state.mentionsVisible && (
          <Header
            style={styles.commentEditHeader}
            title={i18n('Edit comment')}
            leftButton={
              <IconClose
                size={21}
                color={state.isSaving ? styles.disabled.color : styles.link.color}
              />
            }
            onBack={() => !state.isSaving && closeModal()}
            rightButton={
              state.isSaving ? (
                <ActivityIndicator color={styles.link.color}/>
              ) : (
                <IconCheck
                  size={20}
                  color={
                    isSubmitEnabled ? styles.link.color : styles.disabled.color
                  }
                />
              )
            }
            onRightButtonClick={async () => {
              if (isSubmitEnabled) {
                await onSubmitComment();
                closeModal();
              }
            }}
          />
        )}

        <InputScrollView
          topOffset={styles.commentEditContentTopOffset.marginTop}
          multilineInputStyle={styles.mainText}
        >
          <View style={styles.commentEditContent}>
            {!isReporter && !state.mentionsVisible && (
              <View style={styles.commentEditVisibility}>
                {renderVisibility()}
              </View>
            )}

            <View style={styles.commentEditInput}>
              {renderCommentInput(
                true,
                () => {},
                () => {
                  changeState({
                    mentionsVisible: false,
                  });
                },
              )}
            </View>

            {!state.mentionsVisible && (
              <View style={styles.commentEditAttachments}>
                {renderAttachments()}

                {props.canAttach && (
                  <AttachmentAddPanel
                    style={styles.commentEditAttachmentsAttachButton}
                    isDisabled={
                      state.isSaving ||
                      state.isAttachFileDialogVisible ||
                      state.mentionsLoading
                    }
                    showAddAttachDialog={() => toggleAttachFileDialog(true)}
                  />
                )}
              </View>
            )}
          </View>
        </InputScrollView>
      </View>
    );
  };

  return (
    <View
      testID="test:id/commentEdit"
      accessibilityLabel="commentEdit"
      accessible={true}
      style={props.isEditMode ? styles.commentEditContainer : styles.container}
    >
      {renderUserMentions()}
      {props.isEditMode ? renderEditComment() : renderAddNewComment()}

      {state.isAttachFileDialogVisible && renderAttachFileDialog()}
    </View>
  );
};

export default React.memo<Props>(CommentEdit);
