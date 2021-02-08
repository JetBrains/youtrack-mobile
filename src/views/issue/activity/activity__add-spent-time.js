/* @flow */

import React, {memo, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Text, TextInput, TouchableOpacity, View} from 'react-native';

import throttle from 'lodash.throttle';
import InputScrollView from 'react-native-input-scroll-view';

import * as issueActivityItems from './issue-activity__actions';
import DatePicker from '../../../components/date-picker/date-picker';
import Header from '../../../components/header/header';
import Router from '../../../components/router/router';
import Select from '../../../components/select/select';
import {confirmation} from '../../../components/confirmation/confirmation';
import {getEntityPresentation, ytDate} from '../../../components/issue-formatter/issue-formatter';
import {HIT_SLOP} from '../../../components/common-styles/button';
import {IconAngleRight, IconCheck, IconClose} from '../../../components/icon/icon';
import {commentPlaceholderText} from '../../../app-text';
import {ThemeContext} from '../../../components/theme/theme-context';
import {useDispatch, useSelector} from 'react-redux';

import styles from './activity__add-spent-time.styles';

import type {AppState} from '../../../reducers';
import type {SelectProps} from '../../../components/select/select';
import type {Theme} from '../../../flow/Theme';
import type {User} from '../../../flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {WorkItem, TimeTracking, WorkItemType} from '../../../flow/Work';

type Props = {
  onAdd: () => any
}

const AddSpentTimeForm = (props: Props) => {
  const draftDefault: WorkItem = {
    date: new Date(),
    author: {
      name: 'Select author'
    },
    type: {
      name: 'Select type'
    },
    text: null
  };

  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();
  const currentUser: User = useSelector((state: AppState) => state.issueState.user);

  const [isProgress, updateProgress] = useState(false);
  const [isSelectVisible, updateSelectVisibility] = useState(false);
  const [draft, updateDraftWorkItem] = useState(draftDefault);
  const [selectProps, updateSelectProps] = useState(null);

  const updateDraft = async (draft: WorkItem) => {
    const updatedDraft: WorkItem = await dispatch(issueActivityItems.updateWorkItemDraft(draft));
    if (updatedDraft) {
      updateDraftWorkItem({
        ...updatedDraft,
        duration: draft.duration,
        date: draft.date,
        $type: undefined
      });
    }
  };

  const debouncedUpdate = throttle(updateDraft, 350);

  useEffect(() => {
    async function loadTimeTracking() {
      const timeTracking: TimeTracking = await dispatch(issueActivityItems.getTimeTracking());
      const {author, date, duration} = timeTracking.workItemTemplate;
      updateDraftWorkItem({
        ...{author},
        ...{date},
        ...{duration},
        ...timeTracking.draftWorkItem,
        usesMarkdown: true
      });
    }
    loadTimeTracking();
  }, []);


  const update = (data: $Shape<TimeTracking>) => {
    const updatedDraft: WorkItem = {
      ...draft,
      ...data
    };
    updateDraftWorkItem(updatedDraft);
    debouncedUpdate(updatedDraft);
  };

  const renderSelect = (selectProps: SelectProps) => {
    const defaultSelectProps: SelectProps = {
      placeholder: 'Filter items',
      multi: false,
      dataSource: () => Promise.resolve([]),
      selectedItems: [],
      getTitle: (it: Object) => getEntityPresentation(it),
      onCancel: () => updateSelectVisibility(false),
      onChangeSelection: () => null,
      onSelect: () => updateSelectVisibility(false)
    };
    return <Select {...Object.assign({}, defaultSelectProps, selectProps)}/>;
  };

  const getUserSelectProps = (): $Shape<SelectProps> => {
    return {
      dataSource: async () => await dispatch(issueActivityItems.getWorkItemAuthors()),
      onSelect: (author: User) => {
        update({author});
        updateSelectVisibility(false);
      }
    };
  };

  const getWorkTypeSelectProps = (): $Shape<SelectProps> => {
    return {
      dataSource: async () => await dispatch(issueActivityItems.getWorkItemTypes()),
      onSelect: async (type: WorkItemType) => {
        update({type});
        updateSelectVisibility(false);
      }
    };
  };

  const close = () => Router.pop(true);

  const onClose = () => {
    dispatch(issueActivityItems.deleteWorkItemDraft());
    close();
  };

  const onCreate = async () => {
    const {onAdd = () => {}} = props;
    updateProgress(true);
    await dispatch(issueActivityItems.createWorkItem(draft));
    onAdd();
    updateProgress(false);
    close();
  };

  const renderHeader = () => {
    const isSubmitDisabled: boolean = (
      !draft.date ||
      !draft.duration ||
      !draft.author
    );
    const submitIcon = (isProgress
      ? <ActivityIndicator color={styles.link.color}/>
      : <IconCheck size={20} color={isSubmitDisabled ? styles.disabled.color : styles.link.color}/>);

    return (
      <Header
        style={styles.elevation1}
        title="Spent time"
        leftButton={<IconClose size={21} color={isProgress ? styles.disabled.color : styles.link.color}/>}
        onBack={() => {
          if (isProgress) {
            return;
          }
          if (draft.text) {
            confirmation('Discard draft and close?', 'Discard and close')
              .then(onClose).catch(() => null);
          } else {
            onClose();
          }
        }}
        extraButton={(
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={isSubmitDisabled}
            onPress={onCreate}
          >
            {submitIcon}
          </TouchableOpacity>
        )}
      />
    );
  };

  const buttonStyle: Array<ViewStyleProp> = [styles.feedbackFormInput, styles.feedbackFormType];
  const iconAngleRight = <IconAngleRight size={20} color={styles.icon.color}/>;
  const author: ?User = draft.author || currentUser;

  const commonInputProps: Object = {
    autoCapitalize: 'none',
    selectTextOnFocus: true,
    autoCorrect: false,
    placeholderTextColor: styles.icon.color,
    keyboardAppearance: theme.uiTheme.name
  };
  return (
    <View style={styles.container}>
      {renderHeader()}

      <InputScrollView
        topOffset={styles.feedbackFormBottomIndent.height}
        multilineInputStyle={styles.feedbackFormText}
        style={styles.feedbackContainer}
      >
        <View style={styles.feedbackForm}>
          <TouchableOpacity
            style={buttonStyle}
            onPress={() => {
              updateSelectProps(getUserSelectProps());
              updateSelectVisibility(true);
            }}
          >
            <Text style={styles.feedbackFormTextSup}>Author</Text>
            <Text
              style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
            >
              {getEntityPresentation(author)}
            </Text>
            {iconAngleRight}
          </TouchableOpacity>

          <TouchableOpacity
            style={buttonStyle}
            onPress={
              () => Router.PageModal({
                children: <DatePicker onDateSelect={(date: Date) => {
                  update({date: date.getTime()});
                  close();
                }}
                />
              })
            }
          >
            <Text style={styles.feedbackFormTextSup}>Date</Text>
            <Text
              style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
            >
              {ytDate(draft.date, true)}
            </Text>
            {iconAngleRight}
          </TouchableOpacity>

          <View style={buttonStyle}>
            <Text style={styles.feedbackFormTextSup}>Date</Text>
            <TextInput
              {...commonInputProps}
              style={[styles.feedbackInput, styles.feedbackFormTextMain]}
              placeholder="Spent time"
              value={draft?.duration?.presentation}
              onChangeText={(periodValue: string) => update({duration: {presentation: periodValue}})}
            />
          </View>

          <TouchableOpacity
            style={buttonStyle}
            onPress={() => {
              updateSelectProps(getWorkTypeSelectProps());
              updateSelectVisibility(true);
            }}
          >
            <Text style={styles.feedbackFormTextSup}>Type</Text>
            <Text
              style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
            >{draft?.type?.name || draftDefault.type.name}</Text>
            {iconAngleRight}
          </TouchableOpacity>

          <TextInput
            {...commonInputProps}
            multiline
            textAlignVertical="top"
            style={[styles.feedbackFormInputDescription]}
            placeholder={commentPlaceholderText}
            value={draft.text}
            onChangeText={(comment: string) => update({text: comment})}
          />

          <View style={styles.feedbackFormBottomIndent}/>
        </View>
      </InputScrollView>
      {isSelectVisible && !!selectProps && renderSelect(selectProps)}
    </View>
  );
};

export default memo<Props>(AddSpentTimeForm);
