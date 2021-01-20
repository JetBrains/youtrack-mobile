/* @flow */

import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';

import {useDebouncedCallback} from 'use-debounce';
import {useDispatch, useSelector} from 'react-redux';

import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import AttachmentAddPanel from '../../components/attachments-row/attachments-add-panel';
import Badge from '../../components/badge/badge';
import CustomField from '../../components/custom-field/custom-field';
import Header from '../../components/header/header';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Separator from '../../components/separator/separator';
import SummaryDescriptionForm from '../../components/form/summary-description-form';
import VisibilityControl from '../../components/visibility/visibility-control';
import {attachmentActions} from './article-create__attachment-actions-and-types';
import {
  cancelAddAttach,
  createArticleDraft,
  hideAddAttachDialog, loadAttachments,
  publishArticleDraft,
  setDraft,
  showAddAttachDialog,
  updateArticleDraft,
  uploadFile
} from './arcticle-create-actions';
import {createNullProjectCustomField} from '../../util/util';
import {getApi} from '../../components/api/api__instance';
import {getStorageState} from '../../components/storage/storage';
import {IconCheck, IconClose} from '../../components/icon/icon';
import {PanelWithSeparator} from '../../components/panel/panel-with-separator';
import {SkeletonCreateArticle} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article-create.styles';

import type {AppState} from '../../reducers';
import type {Article, ArticleDraft, ArticleProject} from '../../flow/Article';
import type {ArticleCreateState} from './article-create-reducers';
import type {Attachment, IssueProject} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';
import type {Theme, UIThemeColors} from '../../flow/Theme';
import type {Visibility} from '../../flow/Visibility';

type ArticleDraftData = { summary: string, content: string, project: IssueProject, visibility: Visibility };

type Props = {
  articleDraft?: Article
}

const ArticleCreate = (props: Props) => {
  const articleDraftDataInitial: ArticleDraftData = {
    summary: '',
    content: '',
    project: {id: null, name: 'Select project'},
    visibility: null
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

  useEffect(() => {
    const {articleDraft} = props;
    if (articleDraft) {
      dispatch(setDraft(articleDraft));
      updateArticleDraftData({
        summary: articleDraft?.summary || articleDraftDataInitial.summary,
        content: articleDraft?.content || articleDraftDataInitial.content,
        project: articleDraft?.project || articleDraftDataInitial.project,
        visibility: articleDraft.visibility
      });
    } else {
      dispatch(createArticleDraft());
    }
  }, []);

  const debouncedUpdate = useDebouncedCallback(
    (articleDraft: Article) => {
      dispatch(updateArticleDraft(articleDraft));
    },
    350
  );

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
          updateDraft({project});
          hideSelect();
        },
        onCancel: hideSelect
      };

      return (
        <Select {...selectProps}/>
      );
    }
  };

  const closeCreateArticleScreen = () => {
    if (!isProcessing) {
      dispatch(setDraft(null));
      Router.pop(true);
    }
  };

  const renderHeader = () => {
    const isSubmitDisabled: boolean = (
      isProcessing ||
      !articleDraftData.project.id ||
      articleDraftData.summary.length === 0
    );

    return (
      <Header
        style={styles.header}
        title={articleDraft?.idReadable || 'New Article'}
        leftButton={<IconClose size={21} color={isProcessing ? uiThemeColors.$disabled : linkColor}/>}
        onBack={closeCreateArticleScreen}
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
            await dispatch(publishArticleDraft({...articleDraft, ...articleDraftData}));
            if (!error) {
              closeCreateArticleScreen();
            }
          }
        }}/>
    );
  };

  const onAddAttachment = async (attach: Attachment, onAttachingFinish: () => any) => {
    await dispatch(uploadFile(attach));
    onAttachingFinish();
    dispatch(loadAttachments());
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
          dispatch(cancelAddAttach(attachingImage));
          dispatch(hideAddAttachDialog());
        }}
        onAttach={onAddAttachment}
        uiTheme={theme.uiTheme}
      />
    );
  };


  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
  const linkColor: string = uiThemeColors.$link;
  const hasArticleDraft: boolean = articleDraft !== null;

  return (
    <View
      testID="createArticle"
      style={styles.container}
    >
      {renderHeader()}

      {!hasArticleDraft && <SkeletonCreateArticle/>}
      {hasArticleDraft && renderProjectSelect()}

      <ScrollView
        scrollEnabled={hasArticleDraft}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {hasArticleDraft && (
          <PanelWithSeparator>
            <View>
              <CustomField
                active={false}
                disabled={false}
                onPress={() => updateProjectSelectVisibility(true)}
                field={createNullProjectCustomField(articleDraftData.project.name)}
              />
            </View>
            {!!articleDraft.parentArticle && (
              <View>
                <CustomField
                  active={false}
                  disabled={false}
                  onPress={() => {
                    closeCreateArticleScreen();
                    Router.Article({articlePlaceholder: articleDraft.parentArticle, storePrevArticle: true});
                  }}
                  field={createNullProjectCustomField(
                    articleDraft.parentArticle.summary,
                    26,
                    'Parent article'
                  )}
                />
              </View>
            )}
          </PanelWithSeparator>
        )}

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

              {articleDraft.$isUnpublishedDraft && <Badge text='unpublished changes'/>}
            </View>

            <SummaryDescriptionForm
              testID="createIssueSummary"
              showSeparator={true}
              summary={articleDraftData.summary}
              description={articleDraftData.content}
              editable={!isProcessing && !!articleDraft}
              onSummaryChange={(summary: string) => updateDraft({summary})}
              onDescriptionChange={(content: string) => updateDraft({content})}
              uiTheme={theme.uiTheme}
            />
          </View>
        )}

        {hasArticleDraft && (
          <>
            <Separator fitWindow indent/>

            <View style={styles.attachments}>
              <AttachmentAddPanel
                isDisabled={isProcessing}
                showAddAttachDialog={() => dispatch(showAddAttachDialog())}
              />
              <AttachmentsRow
                attachments={articleDraft.attachments}
                attachingImage={attachingImage}
                imageHeaders={getApi().auth.getAuthorizationHeaders()}
                canRemoveAttachment={false}
                onRemoveImage={(attachment: Attachment) => null}
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
