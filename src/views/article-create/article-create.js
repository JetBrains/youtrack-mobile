/* @flow */

import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, View, Text, TouchableOpacity} from 'react-native';

import {useDebouncedCallback} from 'use-debounce';
import {useDispatch, useSelector} from 'react-redux';

import * as articleCreateActions from './arcticle-create-actions';
import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import AttachmentAddPanel from '../../components/attachments-row/attachments-add-panel';
import Badge from '../../components/badge/badge';
import Header from '../../components/header/header';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Separator from '../../components/separator/separator';
import SummaryDescriptionForm from '../../components/form/summary-description-form';
import VisibilityControl from '../../components/visibility/visibility-control';
import {ANALYTICS_ARTICLE_CREATE_PAGE} from '../../components/analytics/analytics-ids';
import {attachmentActions} from './article-create__attachment-actions-and-types';
import {getApi} from '../../components/api/api__instance';
import {getStorageState} from '../../components/storage/storage';
import {IconAngleDown, IconCheck, IconClose} from '../../components/icon/icon';
import {PanelWithSeparator} from '../../components/panel/panel-with-separator';
import {SkeletonCreateArticle} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './article-create.styles';

import type {AppState} from '../../reducers';
import type {Article, ArticleDraft, ArticleProject} from '../../flow/Article';
import type {ArticleCreateState} from './article-create-reducers';
import type {Attachment, IssueProject} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';
import type {Theme, UIThemeColors} from '../../flow/Theme';
import type {Visibility} from '../../flow/Visibility';

type ArticleDraftData = $Shape<Article>;

type Props = {
  articleDraft?: Article,
  isNew?: boolean,
  originalArticleId?: string,
  breadCrumbs?: React$Element<any> | null
}

const ArticleCreate = (props: Props) => {
  const articleDraftDataInitial: ArticleDraftData = {
    summary: '',
    content: '',
    project: {id: null, name: 'Select project'},
    visibility: null,
    attachments: []
  };

  const dispatch = useDispatch();
  const theme: Theme = useContext(ThemeContext);

  const articleDraft: ArticleDraft = useSelector((state: AppState) => state.articleCreate.articleDraft);
  const error: CustomError | null = useSelector((state: AppState) => state.articleCreate.error);
  const isProcessing: boolean = useSelector((state: AppState) => state.articleCreate.isProcessing);
  const issuePermissions: IssuePermissions = useSelector((state: AppState) => state.app.issuePermissions);
  const attachingImage: Attachment = useSelector((state: AppState) => state.articleCreate.attachingImage);
  const isAttachFileDialogVisible: boolean = useSelector(
    (state: AppState) => state.articleCreate.isAttachFileDialogVisible);

  const [isProjectSelectVisible, updateProjectSelectVisibility] = useState(false);
  const [articleDraftData, updateArticleDraftData] = useState(articleDraftDataInitial);

  const createArticleDraft = async (articleId?: string) => await dispatch(
    articleCreateActions.createArticleDraft(articleId)
  );

  useEffect(() => {
    const {articleDraft} = props;
    if (articleDraft) {
      dispatch(articleCreateActions.setDraft(articleDraft));
      updateArticleDraftData({
        attachments: articleDraft.attachments,
        summary: articleDraft?.summary || articleDraftDataInitial.summary,
        content: articleDraft?.content || articleDraftDataInitial.content,
        project: articleDraft?.project || articleDraftDataInitial.project,
        visibility: articleDraft.visibility
      });
    } else {
      createArticleDraft();
    }
  }, []);

  const doUpdate = async (articleDraft: ArticleDraft): Function => {
    let draft: ArticleDraft = articleDraft;
    if (props.originalArticleId && !draft.id) {
      const createdArticleDraft: ArticleDraft = await createArticleDraft(props.originalArticleId);
      draft = {...createdArticleDraft, ...articleDraft};
    }
    return dispatch(articleCreateActions.updateArticleDraft(draft));
  };
  const debouncedUpdate = useDebouncedCallback(doUpdate, 350);

  const updateDraft = (data: $Shape<ArticleDraftData>) => {
    updateArticleDraftData({...articleDraftData, ...data});
    debouncedUpdate.callback({...articleDraft, ...data});
  };

  const renderProjectSelect = () => {
    if (isProjectSelectVisible) {
      const selectedItems = [];
      const hideSelect = () => updateProjectSelectVisibility(false);
      const selectProps = {
        show: true,
        multi: false,
        selectedItems: selectedItems,
        emptyValue: null,
        placeholder: 'Filter projects',
        dataSource: () => Promise.resolve(getStorageState().projects.filter(
          (it: ArticleProject) => issuePermissions.articleCanCreateArticle(it.ringId)
        )),
        onSelect: (project: IssueProject) => {
          updateDraft({
            project: project,
            parentArticle: null,
            visibility: null
          });
          hideSelect();
        },
        onCancel: hideSelect
      };

      return (
        <Select {...selectProps}/>
      );
    }
  };

  const closeCreateArticleScreen = () => !isProcessing && Router.pop(true);

  const renderHeader = () => {
    const draft: ArticleDraft = {...articleDraft, ...articleDraftData};
    const isSubmitDisabled: boolean = (
      !draft.id ||
      isProcessing ||
      !articleDraftData.project.id ||
      articleDraftData.summary.length === 0
    );

    return (
      <Header
        style={styles.header}
        title={props.isNew ? 'New Article' : 'Draft'}
        leftButton={<IconClose size={21} color={isProcessing ? uiThemeColors.$disabled : linkColor}/>}
        onBack={() => {
          if (draft.id) {
            if (!draft.project.id) {
              draft.project = null;
            }
            doUpdate(draft);
          }
          closeCreateArticleScreen();
        }}
        rightButton={(
          isProcessing && articleDraft
            ? articleDraft && <ActivityIndicator color={theme.uiTheme.colors.$link}/>
            : <IconCheck
              size={20}
              color={isSubmitDisabled ? uiThemeColors.$disabled : linkColor}
            />
        )}
        onRightButtonClick={async () => {
          if (!isSubmitDisabled) {
            const createdArticle: ?Article = await dispatch(
              articleCreateActions.publishArticleDraft(draft)
            );
            if (!error) {
              Router.KnowledgeBase({preventReload: true}); //TODO #YTM-12710. It fixes hanging after creating 2nd sub-article #YTM-12655
              Router.Article({articlePlaceholder: createdArticle});
            }
          }
        }}/>
    );
  };

  const onAddAttachment = async (attach: Attachment, onAttachingFinish: () => any) => {
    await dispatch(articleCreateActions.uploadFile(attach));
    onAttachingFinish();
    dispatch(articleCreateActions.loadAttachments());
  };

  const renderAttachFileDialog = () => {
    if (!articleDraft) {
      return null;
    }

    return (
      <AttachFileDialog
        hideVisibility={true}
        issueId={articleDraft.id}
        actions={attachmentActions.createAttachActions(dispatch)}
        attach={attachingImage}
        onCancel={() => {
          dispatch(articleCreateActions.cancelAddAttach(attachingImage));
          dispatch(articleCreateActions.hideAddAttachDialog());
        }}
        onAttach={onAddAttachment}
        uiTheme={theme.uiTheme}
      />
    );
  };

  const renderDiscardButton = () => (
    articleDraft?.id && (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
        style={styles.discard}>
        <TouchableOpacity
          style={styles.discardButton}
          disabled={isProcessing}
          onPress={() => dispatch(articleCreateActions.deleteDraft())}
        >
          <Text style={styles.discardButtonText}>
            {props.isNew ? 'Delete draft' : 'Discard unpublished changes'}
          </Text>
        </TouchableOpacity>
        <Separator/>
      </AnimatedView>
    )
  );

  const renderProjectPanel = () => (
    hasArticleDraft && (
      <PanelWithSeparator style={styles.projectPanel}>
        <View style={styles.projectContainer}>
          <TouchableOpacity
            style={styles.projectSelector}
            disabled={isProcessing}
            onPress={() => updateProjectSelectVisibility(true)}
          >
            <Text style={styles.projectSelectorText}>{articleDraftData.project.name}</Text>
            <IconAngleDown size={20} color={linkColor}/>
          </TouchableOpacity>
        </View>
      </PanelWithSeparator>
    )
  );


  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
  const linkColor: string = uiThemeColors.$link;
  const hasArticleDraft: boolean = articleDraft !== null;

  return (
    <View
      testID="createArticle"
      style={styles.container}
    >
      {renderHeader()}

      {!hasArticleDraft && <View style={styles.content}><SkeletonCreateArticle/></View>}
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
                onSubmit={(visibility: Visibility) => updateDraft({visibility})}
                uiTheme={theme.uiTheme}
                getOptions={() => getApi().articles.getDraftVisibilityOptions(articleDraft.id)}
              />

              {articleDraft?.id && !props.isNew && <Badge text='unpublished changes'/>}
            </View>

            <SummaryDescriptionForm
              analyticsId={ANALYTICS_ARTICLE_CREATE_PAGE}
              testID="createIssueSummary"
              summary={articleDraftData.summary}
              description={articleDraftData.content}
              editable={!!articleDraft}
              onSummaryChange={(summary: string) => updateDraft({summary})}
              onDescriptionChange={(content: string) => updateDraft({content})}
              uiTheme={theme.uiTheme}
              summaryPlaceholder='Title'
              descriptionPlaceholder='Article content'
            />
          </View>
        )}

        {hasArticleDraft && (
          <>
            <Separator fitWindow indent/>

            <View style={styles.attachments}>
              <AttachmentAddPanel
                isDisabled={isProcessing}
                showAddAttachDialog={() => dispatch(articleCreateActions.showAddAttachDialog())}
              />
              <AttachmentsRow
                attachments={articleDraft.attachments}
                attachingImage={attachingImage}
                imageHeaders={getApi().auth.getAuthorizationHeaders()}
                canRemoveAttachment={true}
                onRemoveImage={(attachment: Attachment) => dispatch(
                  articleCreateActions.deleteDraftAttachment(attachment.id))}
                uiTheme={theme.uiTheme}
              />
            </View>
            <View style={styles.attachments}>
            </View>
          </>
        )}

      </ScrollView>

      {isAttachFileDialogVisible && renderAttachFileDialog()}
    </View>
  );

};

export default React.memo<ArticleCreateState>(ArticleCreate);
