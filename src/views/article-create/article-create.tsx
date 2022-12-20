import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useDebouncedCallback} from 'use-debounce';
import {useDispatch, useSelector} from 'react-redux';
import * as articleCreateActions from './arcticle-create-actions';
import AttachFileDialog from 'components/attach-file/attach-file-dialog';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import AttachmentAddPanel from 'components/attachments-row/attachments-add-panel';
import Badge from 'components/badge/badge';
import Header from 'components/header/header';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import Router from 'components/router/router';
import Select from 'components/select/select';
import Separator from 'components/separator/separator';
import SummaryDescriptionForm from 'components/form/summary-description-form';
import VisibilityControl from 'components/visibility/visibility-control';
import {ANALYTICS_ARTICLE_CREATE_PAGE} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown, IconCheck, IconClose} from 'components/icon/icon';
import {PanelWithSeparator} from 'components/panel/panel-with-separator';
import {SkeletonCreateArticle} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {View as AnimatedView} from 'react-native-animatable';
import styles from './article-create.styles';
import type {AppState} from '../../reducers';
import type {Article, ArticleDraft, ArticleProject} from 'types/Article';
import type {ArticleCreateState} from './article-create-reducers';
import type {Attachment, IssueProject} from 'types/CustomFields';
import type {CustomError} from 'types/Error';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Theme, UIThemeColors} from 'types/Theme';
import type {Visibility} from 'types/Visibility';
type Props = {
  articleDraft?:
    | (Article & {
        project: ArticleProject | null;
      })
    | null;
  isNew?: boolean;
  originalArticleId?: string;
  breadCrumbs?: React.ReactElement<React.ComponentProps<any>, any> | null;
  isSplitView: boolean;
  onHide: () => any;
};

const ArticleCreate = (props: Props) => {
  const articleDraftDataInitial = Object.freeze({
    summary: '',
    content: '',
    project: {
      id: null,
      name: 'Select project',
    },
    visibility: null,
    attachments: [],
  });
  const dispatch = useDispatch();
  const theme: Theme = useContext(ThemeContext);
  const isConnected: boolean = useSelector(
    (state: AppState) => state.app.networkState.isConnected,
  );
  const articleDraft: ArticleDraft = useSelector(
    (state: AppState) => state.articleCreate.articleDraft,
  );
  const error: CustomError | null = useSelector(
    (state: AppState) => state.articleCreate.error,
  );
  const isProcessing: boolean = useSelector(
    (state: AppState) => state.articleCreate.isProcessing,
  );
  const issuePermissions: IssuePermissions = useSelector(
    (state: AppState) => state.app.issuePermissions,
  );
  const attachingImage: Attachment = useSelector(
    (state: AppState) => state.articleCreate.attachingImage,
  );
  const isAttachFileDialogVisible: boolean = useSelector(
    (state: AppState) => state.articleCreate.isAttachFileDialogVisible,
  );
  const [isProjectSelectVisible, updateProjectSelectVisibility] = useState(
    false,
  );
  const [articleDraftData, updateArticleDraftData] = useState(
    articleDraftDataInitial,
  );
  const createArticleDraft = useCallback(
    async (articleId?: string) =>
      await dispatch(articleCreateActions.createArticleDraft(articleId)),
    [dispatch],
  );
  useEffect(() => {
    if (props.articleDraft) {
      dispatch(articleCreateActions.setDraft(props.articleDraft));
      updateArticleDraftData({
        attachments: props.articleDraft?.attachments,
        summary: props.articleDraft?.summary || articleDraftDataInitial.summary,
        content: props.articleDraft?.content || articleDraftDataInitial.content,
        project: props.articleDraft?.project || articleDraftDataInitial.project,
        visibility: props.articleDraft?.visibility,
      } as any);
    } else {
      createArticleDraft();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, createArticleDraft]);

  const doUpdate = async (
    articleDraft: ArticleDraft,
  ): ((...args: any[]) => any) => {
    let draft: Partial<ArticleDraft> = articleDraft;

    if (props.originalArticleId && !draft.id) {
      const createdArticleDraft: ArticleDraft = await createArticleDraft(
        props.originalArticleId,
      );
      draft = {...createdArticleDraft, ...articleDraft};
    }

    return dispatch(articleCreateActions.updateArticleDraft(draft));
  };

  const debouncedUpdate = useDebouncedCallback(doUpdate, 350);

  const updateDraft = (data: Record<string, any>) => {
    updateArticleDraftData({...articleDraftData, ...data} as any);
    debouncedUpdate({...articleDraft, ...data});
  };

  const renderProjectSelect = () => {
    if (isProjectSelectVisible) {
      const selectedItems = [];

      const hideSelect = () => updateProjectSelectVisibility(false);

      const selectProps = {
        multi: false,
        selectedItems: selectedItems,
        emptyValue: null,
        placeholder: i18n('Filter projects'),
        dataSource: () =>
          Promise.resolve(
            getStorageState().projects.filter((it: ArticleProject) =>
              issuePermissions.articleCanCreateArticle(it.ringId),
            ),
          ),
        onSelect: (project: IssueProject) => {
          updateDraft({
            project: project,
            parentArticle: null,
            visibility: null,
          });
          hideSelect();
        },
        onCancel: hideSelect,
      };
      return <Select {...selectProps} />;
    }
  };

  const closeCreateArticleScreen = () => {
    const {onHide = () => Router.pop(true)} = props;

    if (!isProcessing) {
      onHide();
    }
  };

  const renderHeader = () => {
    const draft: ArticleDraft = {...articleDraft, ...articleDraftData} as any;
    const isSubmitDisabled: boolean =
      !draft.id ||
      isProcessing ||
      !articleDraftData.project.id ||
      articleDraftData.summary.length === 0 ||
      !isConnected;
    return (
      <Header
        style={styles.header}
        title={props.isNew ? 'New Article' : 'Draft'}
        leftButton={
          <IconClose
            size={21}
            color={isProcessing ? uiThemeColors.$disabled : linkColor}
          />
        }
        onBack={() => {
          if (draft.id) {
            if (!draft.project?.id) {
              draft.project = null;
            }

            doUpdate(draft);
          }

          closeCreateArticleScreen();
        }}
        rightButton={
          isProcessing && articleDraft ? (
            articleDraft && (
              <ActivityIndicator color={theme.uiTheme.colors.$link} />
            )
          ) : (
            <IconCheck
              size={20}
              color={isSubmitDisabled ? uiThemeColors.$disabled : linkColor}
            />
          )
        }
        onRightButtonClick={async () => {
          if (!isSubmitDisabled) {
            const createdArticle: Article | null | undefined = await dispatch(
              articleCreateActions.publishArticleDraft(draft),
            );

            if (!error) {
              if (props.isSplitView) {
                Router.KnowledgeBase({
                  lastVisitedArticle: createdArticle,
                });
              } else {
                Router.KnowledgeBase({
                  preventReload: true,
                }); //TODO #YTM-12710. It fixes hanging after creating 2nd sub-article #YTM-12655

                Router.Article({
                  articlePlaceholder: createdArticle,
                });
              }
            }
          }
        }}
      />
    );
  };

  const onAddAttachment = async (
    files: NormalizedAttachment[],
    onAttachingFinish: () => any,
  ) => {
    await dispatch(articleCreateActions.uploadFile(files));
    onAttachingFinish();
    dispatch(articleCreateActions.loadAttachments());
  };

  const renderAttachFileDialog = (): React.ReactElement<
    React.ComponentProps<typeof AttachFileDialog>,
    typeof AttachFileDialog
  > | null => {
    if (!articleDraft) {
      return null;
    }

    return (
      <AttachFileDialog
        hideVisibility={true}
        getVisibilityOptions={() =>
          getApi().articles.getVisibilityOptions(articleDraft.id)
        }
        actions={{
          onAttach: async (
            files: NormalizedAttachment[],
            onAttachingFinish: () => any,
          ) => {
            onAddAttachment(files, onAttachingFinish);
          },
          onCancel: () => {
            dispatch(articleCreateActions.cancelAddAttach(attachingImage));
            dispatch(articleCreateActions.hideAddAttachDialog());
          },
        }}
      />
    );
  };

  const renderDiscardButton = () =>
    articleDraft?.id && (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
        style={styles.discard}
      >
        <TouchableOpacity
          style={styles.discardButton}
          disabled={isProcessing || !isConnected}
          onPress={async () => {
            dispatch(articleCreateActions.deleteDraft()).then(
              closeCreateArticleScreen,
            );
          }}
        >
          <Text
            style={[
              styles.discardButtonText,
              !isConnected && styles.discardButtonTextDisabled,
            ]}
          >
            {props.isNew
              ? i18n('Delete draft')
              : i18n('Discard unpublished changes')}
          </Text>
        </TouchableOpacity>
        <Separator />
      </AnimatedView>
    );

  const renderProjectPanel = () =>
    hasArticleDraft && (
      <PanelWithSeparator style={styles.projectPanel}>
        <View style={styles.projectContainer}>
          <TouchableOpacity
            style={styles.projectSelector}
            disabled={isProcessing}
            onPress={() => updateProjectSelectVisibility(true)}
          >
            <Text style={styles.projectSelectorText}>
              {articleDraftData.project.name}
            </Text>
            <IconAngleDown size={20} color={linkColor} />
          </TouchableOpacity>
        </View>
      </PanelWithSeparator>
    );

  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
  const linkColor: string = uiThemeColors.$link;
  const hasArticleDraft: boolean = articleDraft !== null;
  return (
    <View testID="createArticle" style={styles.container}>
      {renderHeader()}

      {!hasArticleDraft && (
        <View style={styles.content}>
          <SkeletonCreateArticle />
        </View>
      )}
      {hasArticleDraft && renderProjectSelect()}

      <ScrollView scrollEnabled={hasArticleDraft}>
        {renderDiscardButton()}
        {renderProjectPanel()}
        {props.breadCrumbs}

        {hasArticleDraft && (
          <View style={styles.content}>
            <View style={styles.formHeader}>
              <VisibilityControl
                style={styles.visibilitySelector}
                visibility={articleDraftData.visibility}
                onSubmit={(visibility: Visibility) =>
                  updateDraft({
                    visibility,
                  })
                }
                uiTheme={theme.uiTheme}
                getOptions={() =>
                  getApi().articles.getDraftVisibilityOptions(articleDraft.id)
                }
              />

              {articleDraft?.id && !props.isNew && (
                <Badge text="unpublished changes" />
              )}
            </View>

            <SummaryDescriptionForm
              analyticsId={ANALYTICS_ARTICLE_CREATE_PAGE}
              testID="createIssueSummary"
              summary={articleDraftData.summary}
              description={articleDraftData.content}
              editable={!!articleDraft}
              onSummaryChange={(summary: string) =>
                updateDraft({
                  summary,
                })
              }
              onDescriptionChange={(content: string) =>
                updateDraft({
                  content,
                })
              }
              summaryPlaceholder={i18n('Title')}
              descriptionPlaceholder={i18n('Article content')}
            />
          </View>
        )}

        {hasArticleDraft && (
          <>
            <Separator fitWindow indent />

            <View style={styles.attachments}>
              <AttachmentAddPanel
                isDisabled={isProcessing}
                showAddAttachDialog={() =>
                  dispatch(articleCreateActions.showAddAttachDialog())
                }
              />
              <AttachmentsRow
                attachments={articleDraft.attachments}
                attachingImage={attachingImage}
                canRemoveAttachment={true}
                onRemoveImage={(attachment: Attachment) =>
                  dispatch(
                    articleCreateActions.deleteDraftAttachment(attachment.id),
                  )
                }
                uiTheme={theme.uiTheme}
              />
            </View>
            <View style={styles.attachments} />
          </>
        )}
      </ScrollView>

      {isAttachFileDialogVisible && renderAttachFileDialog()}
    </View>
  );
};

export default React.memo<ArticleCreateState>(
  ArticleCreate,
) as React$AbstractComponent<ArticleCreateState, unknown>;
