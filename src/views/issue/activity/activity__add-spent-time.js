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
import type {WorkItem, TimeTracking, WorkItemTemplate, WorkItemType} from '../../../flow/Work';

type Props = {
  onAdd: () => any
}

const AddSpentTimeForm = (props: Props) => {
  const workItemTemplateDefault: WorkItemTemplate = {
    date: new Date(),
    type: {
      name: '-'
    },
    text: null
  };

  const timeTrackingDefault: TimeTracking = {
    enabled: true,
    draftWorkItem: workItemTemplateDefault,
    workItemTemplate: null
  };

  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();
  const currentUser: User = useSelector((state: AppState) => state.issueState.user);

  const [isProgress, updateProgress] = useState(false);
  const [isSelectVisible, updateSelectVisibility] = useState(false);
  const [timeTracking, updateTimeTracking] = useState(timeTrackingDefault);
  const [selectProps, updateSelectProps] = useState(null);

  const updateDraft = (draft: WorkItem) => dispatch(issueActivityItems.updateWorkItemDraft(draft));
  const debouncedUpdate = throttle(updateDraft, 350);

  useEffect(() => {
    async function loadTimeTracking() {
      const tt: TimeTracking = await dispatch(issueActivityItems.getTimeTracking());
      tt.draftWorkItem = {...tt.workItemTemplate, ...tt.draftWorkItem};
      updateTimeTracking(tt);
    }
    loadTimeTracking();
  }, []);


  const createDraft = (draft: WorkItem): WorkItem => ({
    author: {id: draft.author ? draft.author.id : currentUser.id},
    creator: {id: draft.creator ? draft.creator.id : draft.author.id},
    date: draft.date,
    text: draft.text,
    type: {id: draft.type.id},
    duration: draft.duration,
    usesMarkdown: true
  });

  const update = (data: $Shape<TimeTracking>) => {
    const updatedTimeTracking: TimeTracking = {
      ...timeTracking,
      ...data
    };
    updateTimeTracking(updatedTimeTracking);
    debouncedUpdate(createDraft(updatedTimeTracking.draftWorkItem));
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
      onSelect: (user: User) => {
        update({
          draftWorkItem: {
            ...draftWorkItem,
            author: user
          }
        });
        updateSelectVisibility(false);
      }
    };
  };

  const getWorkTypeSelectProps = (): $Shape<SelectProps> => {
    return {
      dataSource: async () => await dispatch(issueActivityItems.getWorkItemTypes()),
      onSelect: async (type: WorkItemType) => {
        update({
          draftWorkItem: {
            ...draftWorkItem,
            ...{type}
          }
        });
        updateSelectVisibility(false);
      }
    };
  };

  const closeForm = () => {
    dispatch(issueActivityItems.deleteWorkItemDraft());
    Router.pop(true);
  };

  const renderHeader = () => {
    const {onAdd = () => {}} = props;
    return (
      <Header
        style={styles.elevation1}
        title="Spent time"
        leftButton={<IconClose size={21} color={isProgress ? styles.disabled.color : styles.link.color}/>}
        onBack={() => {
          if (isProgress) {
            return;
          }
          if (timeTracking.draftWorkItem.text) {
            confirmation('Discard draft and close?', 'Discard and close')
              .then(closeForm).catch(() => null);
          } else {
            closeForm();
          }
        }}
        extraButton={(
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={isSubmitDisabled}
            onPress={async () => {
              updateProgress(true);
              await dispatch(issueActivityItems.createWorkItem(createDraft(timeTracking.draftWorkItem)));
              onAdd();
              updateProgress(false);
              Router.pop(true);
            }}
          >
            {submitIcon}
          </TouchableOpacity>
        )}
      />
    );
  };

  const buttonStyle: Array<ViewStyleProp> = [styles.feedbackFormInput, styles.feedbackFormType];
  const iconAngleRight = <IconAngleRight size={20} color={styles.icon.color}/>;
  const draftWorkItem: WorkItem = timeTracking.draftWorkItem;
  const author: ?User = draftWorkItem.author || currentUser || {name: '-'};
  const isSubmitDisabled: boolean = (
    !draftWorkItem.date ||
    !draftWorkItem.duration ||
    !draftWorkItem.author
  );
  const submitIcon = (isProgress
    ? <ActivityIndicator color={styles.link.color}/>
    : <IconCheck size={20} color={isSubmitDisabled ? styles.disabled.color : styles.link.color}/>);

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
                  update({
                    draftWorkItem: {
                      ...draftWorkItem,
                      date: date.getTime()
                    }
                  });
                  Router.pop(true);
                }}
                />
              })
            }
          >
            <Text style={styles.feedbackFormTextSup}>Date</Text>
            <Text
              style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
            >
              {ytDate(draftWorkItem.date, true)}
            </Text>
            {iconAngleRight}
          </TouchableOpacity>

          <TextInput
            {...commonInputProps}
            style={styles.feedbackFormInput}
            placeholder="Spent time"
            value={draftWorkItem?.duration?.presentation}
            onChangeText={(periodValue: string) => update({
              draftWorkItem: {
                ...draftWorkItem,
                duration: {presentation: periodValue}
              }
            })}
          />

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
            >{draftWorkItem?.type?.name}</Text>
            {iconAngleRight}
          </TouchableOpacity>

          <TextInput
            {...commonInputProps}
            multiline
            textAlignVertical="top"
            style={[styles.feedbackFormInputDescription]}
            placeholder={commentPlaceholderText}
            value={draftWorkItem.text}
            onChangeText={(comment: string) => update({
              draftWorkItem: {
                ...draftWorkItem,
                text: comment
              }
            })}
          />

          <View style={styles.feedbackFormBottomIndent}/>
        </View>
      </InputScrollView>
      {isSelectVisible && !!selectProps && renderSelect(selectProps)}
    </View>
  );
};

export default memo<Props>(AddSpentTimeForm);
