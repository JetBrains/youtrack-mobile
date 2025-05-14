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
import {IconAdd, IconArrowUp, IconCheck, IconClose} from 'components/icon/icon';
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
  onAddSpentTime?: (() => void) | null;
  onAttach: (files: NormalizedAttachment[], comment: IssueComment) => Promise<Attachment[]>;
  onCommentChange: (comment: IssueComment, isAttachmentChange?: boolean) => Promise<IssueComment>;
  onSubmitComment: (comment: IssueComment) => any;
  visibilityLabel?: string;
}

const EMPTY_COMMENT = {
  text: '',
  updated: -1,
} as EditingComment;

function isCommentEqual(c1: EditingComment, c2: EditingComment): boolean {
  return JSON.stringify(c1) === JSON.stringify(c2);
}

const CommentEdit = (props: Props) => {
  const dispatch: ReduxThunkDispatch = useDispatch();
  const theme: Theme = React.useContext(ThemeContext);
  const attachmentActions: AttachmentActions = getAttachmentActions('issueCommentInput');
  const isReporter = useIsReporter();
  const {onCommentChange: doChange} = props;

  const editCommentInput = React.useRef<TextInput | null>(null);

  const [commentCaret, setCommentCaret] = React.useState<number>(0);

  const textRef = React.useRef<string>('');
  const editingCommentRef = React.useRef<EditingComment>(EMPTY_COMMENT);
  const visibilityRef = React.useRef<VisibilityGroups | null | undefined>();

  const [editingComment, setEditingComment] = React.useState<EditingComment>(EMPTY_COMMENT);
  const setComment = (comment: EditingComment) => {
    setEditingComment(comment);
    editingCommentRef.current = comment;
  };

  const [commentText, setCommentText] = React.useState<string>('');
  const setText = (txt: string) => {
    setCommentText(txt);
    textRef.current = txt;
  };
  const [commentVisibility, setCommentVisibility] = React.useState<VisibilityGroups | null | undefined>(null);
  const setVisibility = (v: VisibilityGroups | null | undefined) => {
    setCommentVisibility(v);
    visibilityRef.current = v;
  };

  const [height, setHeight] = React.useState<number>(UNIT * 4);

  const [isAttachActionsVisible, setAttachActionsVisible] = React.useState<boolean>(false);
  const [isAttachFileDialogVisible, setAttachFileDialogVisible] = React.useState<boolean>(false);
  const [isSaving, setSaving] = React.useState<boolean>(false);
  const [isVisibilityControlVisible, setVisibilityControlVisible] = React.useState<boolean>(false);
  const [isVisibilitySelectVisible, setIsVisibilitySelectVisible] = React.useState<boolean>(false);

  const [mentions, setMentions] = React.useState<UserMentions | null>(null);
  const [mentionsLoading, setMentionsLoading] = React.useState<boolean>(false);
  const [mentionsQuery, setMentionsQuery] = React.useState<string>('');
  const [mentionsVisible, setMentionsVisible] = React.useState<boolean>(false);

  const onCommentChange = React.useCallback(
    async (comment: EditingComment, isAttachmentChange: boolean = false): Promise<IssueComment> => {
      setSaving(true);
      const c = await doChange(comment, isAttachmentChange);
      setSaving(false);
      return c;
    },
    [doChange]
  );

  const onSubmitComment = async () => {
    setSaving(true);
    setVisibilityControlVisible(false);
    const c = await onCommentChange({
      ...editingComment,
      text: commentText,
      visibility: !editingComment.canUpdateVisibility ? undefined : commentVisibility,
    });
    await props.onSubmitComment(c);

    setComment(EMPTY_COMMENT);
    setSaving(false);
  };

  React.useEffect(
    () => {
      const comment = props.editingComment;
      if (isCommentEqual(comment, editingCommentRef.current)) {
        return;
      }

      setText(comment.text);
      setVisibility(comment.visibility);
      setComment(comment);
      setCommentCaret(comment.text.length || 0);

      if (comment?.reply === true) {
        focus();
      }
    },
    [props.editingComment]
  );

  React.useEffect(() => {
    return () => {
      const text = textRef.current;
      const comment = editingCommentRef.current;
      const visibility = visibilityRef.current;
      if (
        text &&
        text !== props.editingComment.text ||
        (comment.id &&
          JSON.stringify(visibility) !== JSON.stringify(props.editingComment.visibility))
      ) {
        onCommentChange({...comment, text, visibility}).then(() => {
          setComment(EMPTY_COMMENT);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focus = () => {
    if (editCommentInput.current) {
      editCommentInput.current.focus();
    }
  };

  const onMentionsShow = async (
    txt: string,
    caret: number,
  ) => {
    const word = (getSuggestWord(txt, caret));
    if (!word) {
      setMentionsVisible(false);
      setMentionsQuery('');
    } else if (word[0] === '@') {
      const q = word.slice(1);
      setMentionsVisible(true);
      setMentionsQuery(q);
      setMentionsLoading(true);
      const um: UserMentions = await props.getCommentSuggestions(mentionsQuery);
      setMentionsLoading(false);
      setMentions(um);
    }
  };

  const applySuggestion = (user: User) => {
    const newText = composeSuggestionText(
      user,
      commentText,
      commentCaret,
    );

    if (newText) {
      const updatedText = `${newText} `;
      setText(updatedText);
      setMentionsVisible(false);
      setVisibilityControlVisible(true);
    }
  };

  const renderUserMentions = () => {
    if (mentionsVisible) {
      return (
        <Mentions
          style={[
            {
              maxHeight: Dimensions.get('window').height / 4.7,
            },
            props.isEditMode ? styles.mentionsEdit : styles.mentions,
          ]}
          isLoading={mentionsLoading}
          mentions={mentions}
          onApply={(user: User) => {
            applySuggestion(user);
            focus();
          }}
        />
      );
    }
  };

  const renderVisibility = () => {
    const enabled = editingComment.canUpdateVisibility || props.canUpdateCommentVisibility;
    return (
      <VisibilityControl
        color={styles.private.color}
        disabled={!enabled}
        onShow={() => setIsVisibilitySelectVisible(true)}
        onHide={() => setIsVisibilitySelectVisible(false)}
        visibility={commentVisibility}
        onSubmit={(v: Visibility | null) => {
          setVisibility(v);
        }}
        getOptions={props.getVisibilityOptions}
        visibilityDefaultLabel={props.visibilityLabel}
      />
    );
  };

  const renderSubmitButton = () => {
    const isDisabled: boolean = !commentText && !editingComment.attachments || isSaving;
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
            onAttachingFinish: () => void,
          ) => {
            let draftComment: EditingComment = editingComment;

            if (!draftComment.id) {
              draftComment = await onCommentChange(editingComment);
            }

            const addedAttachments = await dispatch(props.onAttach(files, draftComment));
            onAttachingFinish();
            setAttachFileDialogVisible(false);
            const c = {
              ...draftComment,
              attachments: (editingComment.attachments || []).concat(addedAttachments),
            };
            setComment(c);
            onCommentChange(c, true);
          },
          onCancel: () => {
            setAttachFileDialogVisible(false);
          },
        }}
      />
    );
  };

  const renderAttachments = () => {
    return (
      <AttachmentsRow
        attachments={editingComment.attachments}
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
          !isSaving && props.canRemoveAttach(attachment)
        }
        onRemoveImage={async (attachment: Attachment) => {
          const resource = props.isArticle
            ? attachmentActions.removeAttachmentFromArticleComment
            : attachmentActions.removeAttachmentFromIssueComment;
          await dispatch(
            resource(
              attachment,
              hasType.commentDraft(editingComment) ? undefined : editingComment.id,
            ),
          );
          const attachments: Attachment[] = (
            editingComment.attachments || []
          ).filter((it: Attachment) => it.id !== attachment.id);
          const c = {...editingComment, attachments};
          setComment(c);
          await onCommentChange(c, true);

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
    onFocus: () => void,
    onBlur: () => void,
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
        value={commentText}
        editable={!isSaving}
        underlineColorAndroid="transparent"
        keyboardAppearance={theme.uiTheme.name}
        placeholderTextColor={styles.commentInputPlaceholder.color}
        autoCapitalize="sentences"
        onSelectionChange={event => {
          setCommentCaret(event.nativeEvent.selection.start);
        }}
        onChangeText={(txt: string) => {
          setText(txt);
          onMentionsShow(txt, commentCaret);
        }}
        onContentSizeChange={event => {
          setHeight(event.nativeEvent.contentSize.height);
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        style={[
          styles.commentInput,
          {
            height: Math.max(MIN_INPUT_SIZE, height + 8),
          },
        ]}
      />
    );
  };

  const closeModal = () => Router.pop(true);

  const hasAttachments = (): boolean => !!editingComment?.attachments?.length;

  const renderAddNewComment = () => {
    const showVisibilityControl = editingComment && !mentionsVisible && (
      IssueVisibility.isSecured(commentVisibility) ||
      !!editingComment.text ||
      commentVisibility ||
      !!editingComment?.attachments?.length ||
      (isVisibilitySelectVisible || isVisibilityControlVisible)
    );

    const hideAttachActionsPanel = () => setAttachActionsVisible(false);

    return (
      <>
        {editingComment.id ? props.header : null}
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
                onPress={() => setAttachActionsVisible(true)}
              >
                <IconAdd color={styles.actionsContainerButton.color}/>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[styles.commentInputContainer, !props.canCommentPublicly && styles.commentInputContainerHighlighted]}
          >
            {renderCommentInput(
              props.focus || !!editingComment?.reply,
              () => setVisibilityControlVisible(true),
              () => {
                if (!isVisibilitySelectVisible) {
                  setMentionsVisible(false);
                  setVisibilityControlVisible(false);
                }
              },
            )}
            {Boolean(!!commentText || hasAttachments()) && renderSubmitButton()}
          </View>
        </View>

        {hasAttachments() && (
          <View style={styles.attachmentsContainer}>{renderAttachments()}</View>
        )}

        {isAttachActionsVisible && (
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
                  setAttachActionsVisible(false);
                  setAttachFileDialogVisible(true);
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
                  setAttachActionsVisible(false);

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
    const isSubmitEnabled: boolean = !!commentText || hasAttachments();
    return (
      <View style={styles.commentEditContainer}>
        {!mentionsVisible && (
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
            {!isReporter && !mentionsVisible && (
              <View style={styles.commentEditVisibility}>
                {renderVisibility()}
              </View>
            )}

            <View style={styles.commentEditInput}>
              {renderCommentInput(
                true,
                () => {},
                () => {
                  setMentionsVisible(false);
                },
              )}
            </View>

            {!mentionsVisible && (
              <View style={styles.commentEditAttachments}>
                {renderAttachments()}

                {props.canAttach && (
                  <AttachmentAddPanel
                    style={styles.commentEditAttachmentsAttachButton}
                    isDisabled={
                      isSaving ||
                      isAttachFileDialogVisible ||
                      mentionsLoading
                    }
                    showAddAttachDialog={() => setAttachFileDialogVisible(true)}
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

      {isAttachFileDialogVisible && renderAttachFileDialog()}
    </View>
  );
};

export default React.memo<Props>(CommentEdit, (prevProps, nextProps) => {
  return isCommentEqual(prevProps.editingComment, nextProps.editingComment);
});
