/* @flow */

import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, ScrollView, View} from 'react-native';

import {useDebouncedCallback} from 'use-debounce';
import {useDispatch, useSelector} from 'react-redux';

import Header from '../../components/header/header';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import SummaryDescriptionForm from '../../components/form/summary-description-form';
import VisibilityControl from '../../components/visibility/visibility-control';
import {createArticleDraft, publishArticleDraft, setDraft, updateArticleDraft} from './arcticle-create-actions';
import {getApi} from '../../components/api/api__instance';
import {getStorageState} from '../../components/storage/storage';
import {IconAngleDown, IconCheck, IconClose} from '../../components/icon/icon';
import {SkeletonCreateArticle} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './article-create.styles';

import type {AppState} from '../../reducers';
import type {ArticleCreateState} from './article-create-reducers';
import type {Article} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';
import type {IssueProject} from '../../flow/CustomFields';
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

  const articleDraft: Article = useSelector((state: AppState) => state.articleCreate.articleDraft);
  const error: CustomError | null = useSelector((state: AppState) => state.articleCreate.error);
  const isProcessing: boolean = useSelector((state: AppState) => state.articleCreate.isProcessing);

  const [isProjectSelectVisible, updateProjectSelectVisibility] = useState(false);
  const [articleDraftData, updateArticleDraftData] = useState(articleDraftDataInitial);

  useEffect(() => {
    if (props.articleDraft) {
      dispatch(setDraft(props.articleDraft));
      updateArticleDraftData({
        ...articleDraftDataInitial,
        ...props.articleDraft
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
        dataSource: () => Promise.resolve(getStorageState().projects),
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

  const renderHeader = () => {
    const isSubmitDisabled: boolean = (
      isProcessing ||
      !articleDraftData.project.id ||
      articleDraftData.summary.length === 0 ||
      articleDraftData.content.length === 0
    );
    const closeCreateArticleScreen = () => {
      if (!isProcessing) {
        dispatch(setDraft(null));
        Router.pop(true);
      }
    };

    return (
      <Header
        style={styles.header}
        title="New Article"
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


  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
  const linkColor: string = uiThemeColors.$link;
  const hasArticleDraft: boolean = articleDraft !== null;

  return (
    <View
      testID="createArticle"
      style={styles.container}
    >
      {renderHeader()}

      <View style={styles.content}>
        {!hasArticleDraft && <SkeletonCreateArticle/>}

        {hasArticleDraft && <>
          {renderProjectSelect()}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <TouchableOpacity
              style={styles.projectSelector}
              disabled={isProcessing}
              onPress={() => updateProjectSelectVisibility(true)}
            >
              <Text style={styles.projectSelectorText}>{articleDraftData.project.name}</Text>
              <IconAngleDown size={20} color={linkColor}/>
            </TouchableOpacity>

            <VisibilityControl
              visibility={articleDraftData.visibility}
              onSubmit={(visibility: Visibility) => updateDraft({visibility})}
              uiTheme={theme.uiTheme}
              getOptions={() => getApi().articles.getDraftVisibilityOptions(articleDraft.id)}
            />

            <SummaryDescriptionForm
              testID="createIssueSummary"
              style={styles.form}
              showSeparator={true}
              summary={articleDraftData.summary}
              description={articleDraftData.content}
              editable={!isProcessing && !!articleDraft}
              onSummaryChange={(summary: string) => {
                updateDraft({summary});
              }}
              onDescriptionChange={(content: string) => {
                updateDraft({content});
              }}
              uiTheme={theme.uiTheme}
            />
          </ScrollView>
        </>
        }
      </View>
    </View>
  );

};

export default React.memo<ArticleCreateState>(ArticleCreate);
