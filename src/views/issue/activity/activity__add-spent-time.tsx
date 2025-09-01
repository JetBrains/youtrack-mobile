import React, {memo, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Text, TextInput, TouchableOpacity, View} from 'react-native';

import InputScrollView from 'react-native-input-scroll-view';
import {useSelector} from 'react-redux';
import {useDispatch} from 'hooks/use-dispatch';

import DatePicker from 'components/date-picker/date-picker';
import Header from 'components/header/header';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import Select from 'components/select/select';
import usage from 'components/usage/usage';
import {absDate} from 'components/date/date';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {ColorBullet} from 'components/color-field/color-field';
import {confirmation} from 'components/confirmation/confirmation';
import {createIssueActivityActions} from './issue-activity__actions';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {hasType} from 'components/api/api__resource-types';
import {HIT_SLOP, HIT_SLOP2} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight, IconCheck, IconClose} from 'components/icon/icon';
import {logEvent} from 'components/log/log-helper';
import {sortByOrdinal} from 'components/search/sorting';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './activity__add-spent-time.styles';

import type {AppState} from 'reducers';
import type {ISelectProps} from 'components/select/select';
import type {IssueFull} from 'types/Issue';
import type {Theme} from 'types/Theme';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';
import type {
  DraftWorkItem,
  ProjectTimeTrackingSettings,
  WorkItem,
  WorkItemAttribute,
  WorkItemAttributeValue,
  WorkItemType,
} from 'types/Work';

interface Props {
  issue: IssueFull;
  workItem?: WorkItem;
  onAdd: () => void;
  onHide: () => void;
  canCreateNotOwn: boolean;
}

type SelectPropsType = {ringId: string; name: string} | WorkItemType | WorkItemAttributeValue;

const AddSpentTimeForm = (props: Props) => {
  const currentUser = useSelector((state: AppState) => state.app.user!);
  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();
  const issueActivityActions = createIssueActivityActions();

  const [isProgress, updateProgress] = useState(false);
  const [isSelectVisible, updateSelectVisibility] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [draft, updateDraftWorkItem] = useState<WorkItem | DraftWorkItem>(
    props.workItem || createDraftWorkItem(props.issue, currentUser)
  );
  const [selectProps, updateSelectProps] = useState<ISelectProps<SelectPropsType> | null>(null);
  const [hasError, setHasError] = useState(false);
  const [spentTime, setSpentTime] = useState(props.workItem?.duration.presentation || '');

  const doHide = () => {
    if (props.onHide) {
      props.onHide();
    } else {
      Router.pop(true);
    }
  };

  const getIssueId = (): string => ((props.issue || props.workItem?.issue) as IssueFull).id;

  useEffect(() => {
    if (props.workItem) {
      updateDraftWorkItem(props.workItem);
    } else {
      createDraft();
    }

    async function createDraft() {
      const issueId = getIssueId();
      const timeTracking = await dispatch(issueActivityActions.getTimeTracking(issueId));
      const draftData = {...draft, ...timeTracking?.draftWorkItem, type: null};
      updateProgress(true);
      const _draft = await dispatch(issueActivityActions.updateWorkItemDraft(draftData, issueId));
      updateProgress(false);
      if (_draft) {
        updateDraftWorkItem({...draftData, ..._draft});
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.workItem, dispatch]);

  const update = (data: Partial<WorkItem>) => {
    setHasError(false);
    updateDraftWorkItem({...draft, ...data});
  };

  const renderSelect = (p: ISelectProps<SelectPropsType>) => {
    const defaultSelectProps: ISelectProps<SelectPropsType> = {
      multi: false,
      dataSource: () => Promise.resolve([]),
      selectedItems: [],
      getTitle: (it: Record<string, any>) => getEntityPresentation(it),
      onCancel: () => updateSelectVisibility(false),
      onChangeSelection: () => null,
      onSelect: () => {
        usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'SpentTime: visibility update');
        updateSelectVisibility(false);
      },
    };
    return <Select {...Object.assign({}, defaultSelectProps, p)} />;
  };

  const getUserSelectProps = (user: {ringId: string}): ISelectProps<SelectPropsType> => {
    return {
      selectedItems: [],
      dataSource: async () => {
        const project = props?.issue?.project || props.workItem?.issue?.project;
        const users = await dispatch(issueActivityActions.getWorkItemAuthors(project.ringId));
        return users.filter(u => u.ringId !== user.ringId);
      },
      onSelect: (author: User) => {
        logEvent({
          message: 'SpentTime: form:set-author',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        update({author});
        updateSelectVisibility(false);
      },
    };
  };

  const getProjectTimeSettings = async (): Promise<ProjectTimeTrackingSettings> =>
    await dispatch(issueActivityActions.getTimeTrackingSettings(draft.issue.project.id));

  const getProjectTimeTrackingSettingsWorkTypes = (): ISelectProps<SelectPropsType> => {
    return {
      selectedItems: [],
      dataSource: async () => {
        const settings: ProjectTimeTrackingSettings = await getProjectTimeSettings();
        return [getDefaultType(), ...settings.workItemTypes.sort(sortByOrdinal)];
      },
      onSelect: async (value: WorkItemType) => {
        logEvent({
          message: 'SpentTime: form:set-work-type',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        update({type: value});
        updateSelectVisibility(false);
      },
    };
  };

  const getProjectTimeTrackingSettingsAttributes = (attributeId: string): ISelectProps<SelectPropsType> => {
    return {
      selectedItems: [],
      dataSource: async () => {
        const settings: ProjectTimeTrackingSettings = await getProjectTimeSettings();
        return settings.attributes.find(a => a.id === attributeId)?.values || [];
      },
      onSelect: async (value: WorkItemAttributeValue) => {
        logEvent({
          message: 'SpentTime: form:set-custom-attribute',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const attributes = draft.attributes!.reduce((akk: WorkItemAttribute[], a) => {
          if (a.id === attributeId) {
            a.value = value;
          }
          akk.push(a);
          return akk;
        }, []);
        update({attributes});
        updateSelectVisibility(false);
      },
    };
  };

  const onClose = () => {
    confirmation(i18n('Discard draft and close?'), i18n('Discard and close'))
      .then(() => {
        logEvent({
          message: 'SpentTime: form:cancel',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        dispatch(issueActivityActions.deleteWorkItemDraft(getIssueId()));
        doHide();
      })
      .catch(() => null);
  };

  const onCreate = async () => {
    const {onAdd = () => {}} = props;
    logEvent({
      message: 'SpentTime: form:submit',
      analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
    });
    updateProgress(true);
    const item = await dispatch(
      issueActivityActions.submitWorkItem(
        {
          ...draft,
          $type: props.workItem ? draft.$type : undefined,
          type: draft.type?.id ? draft.type : null,
        },
        getIssueId()
      )
    );
    updateProgress(false);
    if (item && hasType.work({$type: item.$type!})) {
      onAdd();
      doHide();
    } else {
      setHasError(true);
    }
  };

  const renderHeader = () => {
    const isSubmitDisabled: boolean = !draft.duration || !draft.author || !draft?.duration?.presentation || !spentTime;
    const submitIcon = isProgress ? (
      <ActivityIndicator color={styles.link.color} />
    ) : (
      <IconCheck color={isSubmitDisabled ? styles.disabled.color : styles.link.color} />
    );
    return (
      <Header
        style={styles.elevation1}
        title={i18n('Spent time')}
        leftButton={<IconClose color={isProgress ? styles.disabled.color : styles.link.color} />}
        onBack={() => !isProgress && onClose()}
        extraButton={
          <TouchableOpacity hitSlop={HIT_SLOP} disabled={isSubmitDisabled} onPress={onCreate}>
            {submitIcon}
          </TouchableOpacity>
        }
      />
    );
  };

  const buttonStyle: ViewStyleProp[] = [styles.feedbackFormInput, styles.feedbackFormType];
  const iconAngleRight = <IconAngleRight size={20} color={styles.icon.color} />;
  const author: User | null | undefined = draft?.author || currentUser;
  const commonInputProps: Record<string, any> = {
    autoCapitalize: 'none',
    selectTextOnFocus: true,
    autoCorrect: false,
    placeholderTextColor: styles.icon.color,
    keyboardAppearance: theme.uiTheme.name,
  };

  const renderDatePicker = () => {
    return (
      <DatePicker
        date={draft.date ? new Date(draft.date) : new Date(Date.now())}
        onDateSelect={(timestamp: number) => {
          update({date: timestamp});
          setDatePickerVisibility(false);
        }}
      />
    );
  };

  const renderResetButton = (onPress: () => void) => (
    <TouchableOpacity hitSlop={HIT_SLOP2} onPress={onPress} style={styles.resetIcon}>
      <IconClose size={21} color={styles.icon.color} />
    </TouchableOpacity>
  );

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
            disabled={!props.canCreateNotOwn}
            onPress={() => {
              updateSelectProps(getUserSelectProps(author));
              updateSelectVisibility(true);
            }}
          >
            <Text style={styles.feedbackFormTextSup}>{i18n('Author')}</Text>
            <Text style={[styles.feedbackFormText, styles.feedbackFormTextMain]}>{getEntityPresentation(author)}</Text>
            {props.canCreateNotOwn && iconAngleRight}
          </TouchableOpacity>

          <TouchableOpacity style={buttonStyle} onPress={() => setDatePickerVisibility(true)}>
            <Text style={styles.feedbackFormTextSup}>{i18n('Date')}</Text>
            <Text style={[styles.feedbackFormText, styles.feedbackFormTextMain]}>{absDate(draft.date, true)}</Text>
            {iconAngleRight}
          </TouchableOpacity>

          <View style={buttonStyle}>
            <Text style={[styles.feedbackFormTextSup, hasError && styles.feedbackFormTextError]}>
              {i18n('Spent time')}
            </Text>
            <TextInput
              {...commonInputProps}
              style={[styles.feedbackInput, styles.feedbackFormTextMain]}
              placeholder={i18n('1w 1d 1h 1m')}
              value={spentTime}
              onChangeText={(periodValue: string) => {
                setHasError(false);
                setSpentTime(periodValue);
                updateDraftWorkItem({
                  ...draft,
                  duration: {
                    presentation: periodValue,
                  },
                });
              }}
            />
          </View>
          {hasError && <Text style={styles.feedbackInputErrorHint}>{i18n('1w 1d 1h 1m')}</Text>}

          <TouchableOpacity
            style={buttonStyle}
            onPress={() => {
              updateSelectProps(getProjectTimeTrackingSettingsWorkTypes());
              updateSelectVisibility(true);
            }}
          >
            <Text style={styles.feedbackFormTextSup}>{i18n('Type')}</Text>
            <Text style={[styles.feedbackFormText, styles.feedbackFormTextMain]} numberOfLines={1}>
              {!!draft?.type?.color && <ColorBullet color={draft.type.color} />}
              {draft.type?.name || <Text style={styles.placeholderText}>{getDefaultType().name}</Text>}
            </Text>
            {!!draft.type?.name && renderResetButton(() => {
              update({type: null});
            })}
            {iconAngleRight}
          </TouchableOpacity>

          {!!draft.attributes?.length && (
            <>
              {draft.attributes.map(attr => (
                <TouchableOpacity
                  key={attr.id}
                  style={buttonStyle}
                  onPress={() => {
                    updateSelectProps(getProjectTimeTrackingSettingsAttributes(attr.id));
                    updateSelectVisibility(true);
                  }}
                >
                  <Text style={styles.feedbackFormTextSup}>{attr.name}</Text>
                  <Text style={[styles.feedbackFormText, styles.feedbackFormTextMain]} numberOfLines={1}>
                    {attr?.value?.color && <ColorBullet color={attr.value.color} />}
                    {attr?.value?.name || <Text style={styles.placeholderText}>{i18n('Select an option')}</Text>}
                  </Text>
                  <>
                    {!!attr?.value?.name &&
                      renderResetButton(() => {
                        update({
                          attributes: draft.attributes!.reduce((akk: WorkItemAttribute[], a) => {
                            akk.push(a.id === attr.id ? {...a, value: null} : a);
                            return akk;
                          }, []),
                        });
                      })}
                    {iconAngleRight}
                  </>
                </TouchableOpacity>
              ))}
            </>
          )}

          <TextInput
            {...commonInputProps}
            multiline
            textAlignVertical="top"
            style={[styles.feedbackFormInputMultiline, styles.commentInput]}
            placeholder={i18n('Write a comment, @mention people')}
            value={draft?.text || undefined}
            onChangeText={(comment: string) => updateDraftWorkItem({...draft, text: comment})}
          />

          <View style={styles.feedbackFormBottomIndent} />
        </View>
      </InputScrollView>
      {isSelectVisible && !!selectProps && renderSelect(selectProps)}
      {isDatePickerVisible && <ModalView>{renderDatePicker()}</ModalView>}
    </View>
  );
};

export default memo<Props>(AddSpentTimeForm);

function createDraftWorkItem(issue: IssueFull, user: User): DraftWorkItem {
  return {
    date: Date.now(),
    author: user,
    creator: user,
    duration: {
      presentation: '1d',
    },
    type: getDefaultType(),
    text: null,
    usesMarkdown: true,
    issue: {
      id: issue.id,
      project: {
        id: issue.project.id,
        ringId: issue.project.ringId,
      },
    },
  };
}

function getDefaultType() {
  return {
    id: null,
    name: i18n('No type'),
    ordinal: 0,
  };
}
