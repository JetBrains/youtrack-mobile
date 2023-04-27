import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import InputScrollView from 'react-native-input-scroll-view';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import {useDispatch} from 'react-redux';
import AttachFileDialog from '../attach-file/attach-file-dialog';
import AttachmentAddPanel from '../attachments-row/attachments-add-panel';
import AttachmentsRow from '../attachments-row/attachments-row';
import Header from '../header/header';
import IconHourGlass from '@jetbrains/icons/hourglass.svg';
import IconAttachment from '@jetbrains/icons/attachment.svg';
import log from '../log/log';
import Mentions from '../mentions/mentions';
import ModalPanelBottom from '../modal-panel-bottom/modal-panel-bottom';
import Router from '../router/router';
import usage from '../usage/usage';
import VisibilityControl from '../visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {
  composeSuggestionText,
  getSuggestWord,
} from '../mentions/mension-helper';
import {getAttachmentActions} from '../attachments-row/attachment-actions';
import {hasType} from '../api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconArrowUp, IconCheck, IconClose, IconAdd} from '../icon/icon';
import {ThemeContext} from '../theme/theme-context';
import styles, {MIN_INPUT_SIZE} from './comment-edit.styles';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {AttachmentActions} from '../attachments-row/attachment-actions';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Theme} from 'types/Theme';
import type {User} from 'types/User';
import type {Visibility, VisibilityGroups} from 'types/Visibility';

type UserMentions = {
  users: User[];
};
type EditingComment = Partial<
  IssueComment & {
    reply: boolean;
  }
>;

interface Props {
  canAttach: boolean;
  canRemoveAttach: (attachment: Attachment) => boolean;
  editingComment?: EditingComment;
  focus?: boolean;
  getCommentSuggestions: (query: string) => Promise<UserMentions>;
  getVisibilityOptions: () => Promise<VisibilityGroups>;
  isArticle?: boolean;
  isEditMode?: boolean;
  onAddSpentTime?: (() => any) | null;
  onAttach: (
    attachment: Attachment,
    comment: IssueComment,
  ) => Array<Attachment>;
  onCommentChange: (comment: IssueComment, isAttachmentChange: boolean) => any;
  onSubmitComment: (comment: IssueComment) => any;
  visibilityLabel?: string;
  header?: React.ReactElement<React.ComponentProps<any>, any>;
}

type State = {
  attachFileSource: string | null;
  commentCaret: number;
  editingComment: EditingComment;
  editingCommentText: string;
  isAttachFileDialogVisible: boolean;
  isAttachActionsVisible: boolean;
  isSaving: boolean;
  isVisibilityControlVisible: boolean;
  isVisibilitySelectVisible: boolean;
  mentions: UserMentions | null;
  mentionsLoading: boolean;
  mentionsQuery: string;
  mentionsVisible: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};
const EMPTY_COMMENT: EditingComment = {
  text: '',
  visibility: null,
};

const IssueCommentEdit = (props: Props) => {
  const dispatch = useDispatch();
  const theme: Theme = useContext(ThemeContext);
  const attachmentActions: AttachmentActions = getAttachmentActions(
    'issueCommentInput',
  );
  const [state, updateState] = useState({
    attachFileSource: null,
    commentCaret: 0,
    editingComment: EMPTY_COMMENT,
    editingCommentText: EMPTY_COMMENT.text,
    isAttachFileDialogVisible: false,
    isAttachActionsVisible: false,
    isSaving: false,
    isVisibilitySelectVisible: false,
    isVisibilityControlVisible: false,
    mentions: null,
    mentionsLoading: false,
    mentionsQuery: '',
    mentionsVisible: false,
    height: null,
    timer: null,
  });
  const editCommentInput = useRef(null);

  const changeState = (statePart: Partial<State>): void => {
    updateState((prevState: State) => ({...prevState, ...statePart}));
  };

  const toggleSaving = (isSaving: boolean) => {
    changeState({
      isSaving,
    });
  };

  const getCurrentComment = useCallback(
    (data: EditingComment = {} as any): EditingComment => ({
      ...props.editingComment,
      text: state.editingCommentText,
      attachments: state.editingComment.attachments,
      visibility: state.editingComment.visibility,
      usesMarkdown: true,
      ...data,
    }),
    [props.editingComment, state.editingComment, state.editingCommentText],
  );
  const setComment = useCallback(
    (editingComment: Partial<IssueComment> = EMPTY_COMMENT): void => {
      changeState({
        editingComment,
      });
    },
    [],
  );

  const delayedChange = useCallback(
      (draft: Partial<IssueComment>, isAttachmentChange: boolean = false) => {
        const timer = setTimeout(() => {
          props.onCommentChange(draft, isAttachmentChange);
          changeState({timer: null});
        }, 300);
        changeState({timer});
      },
    [props],
  );
  useEffect(() => {
    return () => setComment();
  }, [setComment]);
  useEffect(() => {
    if (
      state.editingComment.id === undefined && props.editingComment?.id ||
      (
        state.editingComment.id &&
        state.editingComment?.updated < props.editingComment?.updated
      )
    ) {
      // set draft id
      changeState({
        editingComment: {...state.editingComment, ...props.editingComment},
      });
    }

    if (props.editingComment === null && state.editingComment?.id) {
      // reset after submitting
      changeState({
        editingComment: EMPTY_COMMENT,
      });
    }

    if (props.editingComment?.reply === true) {
      // do reply
      changeState({
        editingComment: props.editingComment,
      });
      delayedChange(
        getCurrentComment({
          text: props.editingComment?.text,
        }),
        false,
      );
    }

    if (
      state.editingComment.id === undefined &&
      !state.editingComment.text &&
      props.editingComment?.text
    ) {
      //set draft text
      changeState({
        editingCommentText: props.editingComment?.text,
      });
    }
  }, [
    delayedChange,
    getCurrentComment,
    props.editingComment,
    state.editingComment,
    state.editingComment.id,
    state.editingComment.text,
    state.editingCommentText,
  ]);

  const focus = (): void => {
    editCommentInput?.current?.focus();
  };

  const toggleVisibilityControl = (
    isVisibilityControlVisible: boolean,
  ): void => {
    changeState({
      isVisibilityControlVisible,
    });
  };

  const submitComment = (updatedComment: IssueComment): void => {
    toggleSaving(true);
    toggleVisibilityControl(false);
    return props
      .onSubmitComment(updatedComment)
      .then(() => {
        changeState({
          editingComment: EMPTY_COMMENT,
          editingCommentText: EMPTY_COMMENT.text,
        });
      })
      .finally(() => toggleSaving(false));
  };

  const suggestionsNeededDetector = async (
    text: string,
    caret: number,
  ): Promise<void> => {
    const word: string | null | undefined = (getSuggestWord(
      text,
      caret,
    ) as any) as string | null;

    if (!word) {
      return changeState({
        mentionsVisible: false,
        mentionsQuery: '',
      });
    }

    if (word[0] === '@') {
      const mentionsQuery: string = word.slice(1);
      changeState({
        mentionsVisible: true,
        mentionsQuery,
        mentionsLoading: true,
      });
      const mentions: UserMentions = await props.getCommentSuggestions(
        mentionsQuery,
      );
      changeState({
        mentionsLoading: false,
        mentions,
      });
    }
  };

  const applySuggestion = (user: User) => {
    const newText: string | null | undefined = composeSuggestionText(
      user,
      state.editingComment.text,
      state.commentCaret,
    );

    if (newText) {
      const updatedText: string = `${newText} `;
      const updatedComment: EditingComment = {
        ...state.editingComment,
        text: updatedText,
      };
      changeState({
        editingComment: updatedComment,
        editingCommentText: updatedText,
        mentionsVisible: false,
        isVisibilityControlVisible: true,
      });
      delayedChange(
        getCurrentComment({
          text: updatedText,
        }),
      );
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
            setTimeout(focus, 150);
          }}
        />
      );
    }
  };

  const renderVisibility = (): React.ReactNode => {
    const toggleSelectVisibility = (isVisibilitySelectVisible: boolean) =>
      changeState({
        isVisibilitySelectVisible,
      });

    return (
      <VisibilityControl
        onShow={() => toggleSelectVisibility(true)}
        onHide={() => toggleSelectVisibility(false)}
        visibility={state.editingComment.visibility}
        onSubmit={(visibility: Visibility) => {
          const comment: Partial<IssueComment> = getCurrentComment({
            visibility,
          });
          setComment(comment);
          !props.isEditMode && delayedChange(comment);
        }}
        uiTheme={theme.uiTheme}
        getOptions={props.getVisibilityOptions}
        visibilityDefaultLabel={props.visibilityLabel}
      />
    );
  };

  const toggleAttachFileDialog = (isAttachFileDialogVisible: boolean): void => {
    changeState({
      isAttachFileDialogVisible,
    });
  };

  const renderSendButton = (): React.ReactNode => {
    const {editingComment, isSaving, timer} = state;
    const draftHasId: boolean = !!state.editingComment.id;
    const isDisabled: boolean =
      !draftHasId ||
      isSaving ||
      !!timer ||
      (!editingComment.text && !editingComment.attachments);
    return (
      <TouchableOpacity
        style={[
          styles.commentSendButton,
          isDisabled ? styles.commentSendButtonDisabled : null,
        ]}
        disabled={isDisabled}
        onPress={() => {
          const comment: IssueComment = getCurrentComment();
          props
            .onCommentChange(comment, false)
            .then((response: IssueComment | null | undefined) => {
              submitComment(response || comment);
            });
        }}
      >
        {!isSaving && draftHasId && (
          <IconArrowUp size={22} color={theme.uiTheme.colors.$textButton} />
        )}
        {(isSaving || !draftHasId) && (
          <ActivityIndicator color={theme.uiTheme.colors.$background} />
        )}
      </TouchableOpacity>
    );
  };

  const renderAttachFileDialog = () => {
    return (
      <AttachFileDialog
        hideVisibility={true}
        getVisibilityOptions={props.getVisibilityOptions}
        actions={{
          onAttach: async (
            files: NormalizedAttachment[],
            onAttachingFinish: () => any,
          ) => {
            let draftComment: IssueComment = state.editingComment;

            if (!draftComment.id) {
              draftComment = await props.onCommentChange(
                state.editingComment,
                false,
              );
            }

            const addedAttachments: Attachment[] = await dispatch(
              props.onAttach(files, state.editingComment),
            );
            onAttachingFinish();
            toggleAttachFileDialog(false);
            const updatedComment: IssueComment = getCurrentComment({
              ...state.editingComment,
              ...draftComment,
              attachments: []
                .concat(state.editingComment.attachments || [])
                .concat(addedAttachments),
            });
            setComment(updatedComment);
            delayedChange(updatedComment, true);
          },
          onCancel: () => {
            changeState({
              isAttachFileDialogVisible: false,
            });
            delayedChange(getCurrentComment());
          },
        }}
      />
    );
  };

  const renderAttachments = (): React.ReactNode => {
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
          const resource: (...args: any[]) => any = props.isArticle
            ? attachmentActions.removeAttachmentFromArticleComment
            : attachmentActions.removeAttachmentFromIssueComment;
          await dispatch(
            resource(
              attachment,
              hasType.commentDraft(state.editingComment)
                ? undefined
                : state.editingComment.id,
            ),
          );
          const attachments: Attachment[] = (
            state.editingComment.attachments || []
          ).filter((it: Attachment) => it.id !== attachment.id);
          const isDeleted: boolean =
            !state.editingComment.text && !attachments.length;
          const updatedComment: IssueComment = getCurrentComment({
            attachments,
            deleted: isDeleted,
          });
          setComment(isDeleted ? undefined : updatedComment);
          delayedChange(updatedComment, true);

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
  ): React.ReactNode => {
    return (
      <TextInput
        autoCorrect={true}
        multiline={true}
        autoFocus={autoFocus || props.isEditMode}
        ref={editCommentInput}
        placeholder={i18n('Write a comment, @mention people')}
        value={state.editingComment.text}
        editable={!state.isSaving}
        underlineColorAndroid="transparent"
        keyboardAppearance={theme.uiTheme.name}
        placeholderTextColor={theme.uiTheme.colors.$icon}
        autoCapitalize="sentences"
        onSelectionChange={event => {
          changeState({
            commentCaret: event.nativeEvent.selection.start,
          });
        }}
        onChangeText={(text: string) => {
          if (state.timer && !props.isEditMode) {
            clearTimeout(state.timer);
          }
          const updatedDraftComment: Partial<IssueComment> = getCurrentComment({text});
          changeState({
            editingComment: updatedDraftComment,
            editingCommentText: text,
          });
          suggestionsNeededDetector(text, state.commentCaret);
          if (!props.isEditMode) {
            delayedChange(updatedDraftComment);
          }
        }}
        onContentSizeChange={event => {
          changeState({
            height: event.nativeEvent.contentSize.height,
          });
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

  const hasAttachments = (): boolean =>
    !!state.editingComment?.attachments?.length;

  const renderAddNewComment = (): React.ReactNode => {
    const {
      isSaving,
      mentionsVisible,
      editingComment,
      isVisibilityControlVisible,
      isVisibilitySelectVisible,
    } = state;
    const hasText: boolean = !!editingComment.text;
    const showVisibilityControl: boolean =
      !mentionsVisible &&
      (!!editingComment.visibility ||
        isVisibilitySelectVisible ||
        isVisibilityControlVisible);

    const hideAttachActionsPanel = () =>
      changeState({
        isAttachActionsVisible: false,
      });

    return (
      <>
        {!!editingComment.id && props.header}
        <View
          style={[
            styles.commentHeaderContainer,
            showVisibilityControl ? styles.commentHeaderContainerCreate : null,
          ]}
        >
          {showVisibilityControl && renderVisibility()}
        </View>

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
                <IconAdd
                  color={styles.actionsContainerButton.color}
                  size={22}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.commentInputContainer}>
            {renderCommentInput(
              props.focus || !!editingComment.reply,
              () => toggleVisibilityControl(true),
              () => {
                changeState({
                  mentionsVisible: false,
                });
                toggleVisibilityControl(false);
              },
            )}
            {Boolean(hasText || hasAttachments()) && renderSendButton()}
          </View>
        </View>

        {hasAttachments() && (
          <View style={styles.attachmentsContainer}>{renderAttachments()}</View>
        )}

        {state.isAttachActionsVisible && (
          <ModalPanelBottom onHide={hideAttachActionsPanel}>
            {props.canAttach && (
              <TouchableOpacity
                style={[
                  styles.actionsContainerButton,
                  styles.floatContextButton,
                ]}
                disabled={isSaving || mentionsVisible || !!state.timer}
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
                <IconHourGlass
                  fill={styles.actionsContainerButton.color}
                  width={20}
                  height={20}
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
          </ModalPanelBottom>
        )}
      </>
    );
  };

  const renderEditComment = (): React.ReactNode => {
    const {isSaving, editingComment} = state;
    const isSubmitEnabled: boolean = !!editingComment.text || hasAttachments();
    return (
      <View style={styles.commentEditContainer}>
        {!state.mentionsVisible && (
          <Header
            style={styles.commentEditHeader}
            title={i18n('Edit comment')}
            leftButton={
              <IconClose
                size={21}
                color={isSaving ? styles.disabled.color : styles.link.color}
              />
            }
            onBack={() => !isSaving && closeModal()}
            rightButton={
              isSaving ? (
                <ActivityIndicator color={styles.link.color} />
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
                await submitComment(state.editingComment);
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
            {!state.mentionsVisible && (
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
                      state.mentionsLoading ||
                      !!state.timer
                    }
                    showAddAttachDialog={() => toggleAttachFileDialog(true)}
                  />
                )}
              </View>
            )}

            <KeyboardSpacerIOS />
          </View>
        </InputScrollView>
      </View>
    );
  };

  return (
    <View
      style={props.isEditMode ? styles.commentEditContainer : styles.container}
    >
      {renderUserMentions()}
      {props.isEditMode ? renderEditComment() : renderAddNewComment()}

      {state.isAttachFileDialogVisible && renderAttachFileDialog()}
    </View>
  );
};

export default React.memo<Props>(IssueCommentEdit);
