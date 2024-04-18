import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import * as actions from './helpdesk-feedback-actions';
import AttachFileDialog from 'components/attach-file/attach-file-dialog';
import AttachmentAddPanel from 'components/attachments-row/attachments-add-panel';
import DateTimePicker from 'components/date-picker/date-time-picker';
import FilesPreviewPanel from 'components/attach-file/files-preview-panel';
import FormSelect from 'components/form/form-select-button';
import FormTextInput from 'components/form/form-text-input';
import Header from 'components/header/header';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import SelectWithCustomInput from 'components/select/select-with-custom-input';
import {absDate} from 'components/date/date';
import {ANALYTICS_HD_FEEDBACK_PAGE} from 'components/analytics/analytics-ids';
import {
  FeedbackBlock,
  FeedbackFormBlockCustomField,
  FeedbackFormReporter,
  formBlockType,
} from 'views/helpdesk-feedback';
import {getLocalizedName} from 'components/custom-field/custom-field-helper';
import {HIT_SLOP} from 'components/common-styles';
import {IconBack, IconCheck, IconClose} from 'components/icon/icon';
import {isIOSPlatform} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {onToggleAttachDialogVisibility} from './helpdesk-feedback-actions';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './helpdesk-feedback.styles';

import type {AppState} from 'reducers';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ProjectHelpdesk} from 'types/Project';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {Theme, UIThemeColors} from 'types/Theme';

const HelpDeskFeedback = ({project}: {project: ProjectHelpdesk}) => {
  const theme: Theme = React.useContext(ThemeContext);
  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;

  const dispatch: ReduxThunkDispatch = useDispatch();

  const form = useSelector((state: AppState) => state.helpDeskFeedbackForm.form);
  const blocks = useSelector((state: AppState) => state.helpDeskFeedbackForm.formBlocks);
  const selectProps = useSelector((state: AppState) => state.helpDeskFeedbackForm.selectProps);
  const inProgress = useSelector((state: AppState) => state.app.isInProgress);
  const isAttachDialogVisible = useSelector((state: AppState) => state.helpDeskFeedbackForm.isAttachDialogVisible);

  const [formBlocks, setFormBlocks] = React.useState<FeedbackBlock[]>([]);
  const [dateTimeBlock, setDateTimeBlock] = React.useState<FeedbackBlock | null>(null);
  const [files, setFiles] = React.useState<Array<NormalizedAttachment>>([]);

  React.useEffect(() => {
    setFormBlocks(blocks || []);
  }, [blocks]);

  React.useEffect(() => {
    dispatch(actions.loadFeedbackForm(project));
  }, [dispatch, project]);

  const onBack = () => Router.pop();

  const onSubmit = async () => {
    try {
      await dispatch(actions.submitForm(formBlocks, files));
      onBack();
    } catch (e) {}
  };

  const onBlockChange = (b: FeedbackBlock, data: (i: FeedbackBlock) => Partial<FeedbackBlock>) => {
    setFormBlocks(fb => fb.map(i => (b.id === i.id ? {...i, ...data(i)} : i)));
  };

  const onTextValueChange = (b: FeedbackBlock, text?: string) => {
    onBlockChange(b, (i: FeedbackBlock) => ({value: text}));
  };

  const isEmailBlock = (b: FeedbackBlock) => b.type === formBlockType.email;

  const onUserSelectOpen = (b: FeedbackBlock) => {
    dispatch(
      actions.setUserSelect(
        b.value,
        ({reporter, email}: {reporter?: FeedbackFormReporter; email?: string}) => {
          onBlockChange(b, (i: FeedbackBlock) => ({reporter, email, value: email || reporter?.name || ''}));
        }
      )
    );
  };

  const iconColor = inProgress ? uiThemeColors.$disabled : uiThemeColors.$link;
  return (
    <View
      testID="test:id/helpDeskFeedback"
      accessibilityLabel="helpDeskFeedback"
      accessible={false}
      style={styles.flexContainer}
    >
      <Header
        showShadow
        title={form?.title || ''}
        leftButton={isSplitView() ? <IconClose color={iconColor} /> : <IconBack color={iconColor} />}
        onBack={() => !inProgress && onBack()}
        extraButton={
          <TouchableOpacity hitSlop={HIT_SLOP} disabled={inProgress} onPress={onSubmit}>
            {inProgress ? <ActivityIndicator color={uiThemeColors.$link} /> : <IconCheck color={iconColor} />}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.flexContainer}
        keyboardVerticalOffset={styles.verticalOffset.marginBottom}
        behavior={isIOSPlatform() ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          refreshControl={
            <RefreshControl
              tintColor={styles.link.color}
              refreshing={false}
              onRefresh={() => dispatch(actions.onRefresh())}
            />
          }
        >
          {formBlocks.map(b => {
            const label = `${b.label}${b.required ? '*' : ''}`;
            return (
              <View style={styles.block} key={b.id}>
                {b.type === formBlockType.text && (
                  <View style={styles.block}>
                    <Text style={[styles.block, styles.text]}>{b.label}</Text>
                  </View>
                )}

                {(isEmailBlock(b) || b.type === formBlockType.input) && (
                  <FormTextInput
                    value={b.value}
                    onChange={text => onTextValueChange(b, text)}
                    onFocus={() => {
                      if (isEmailBlock(b)) {
                        onUserSelectOpen(b);
                      }
                    }}
                    onClear={() => {
                      onTextValueChange(b, '');
                      if (isEmailBlock(b)) {
                        onUserSelectOpen(b);
                      }
                    }}
                    multiline={b.multiline}
                    label={label}
                  />
                )}

                {(b.type === formBlockType.integer || b.type === formBlockType.float) && (
                  <FormTextInput
                    value={b.value}
                    placeholder={label}
                    onChange={text => {
                      const value = text.replace(/,/, '.');
                      const data = (i: FeedbackBlock) => ({
                        field: {
                          ...i.field!,
                          value: b.type === formBlockType.float ? parseFloat(value) : parseInt(value, 10),
                        },
                        value,
                      });
                      onBlockChange(b, data);
                    }}
                    multiline={b.multiline}
                    onClear={() => onTextValueChange(b, '')}
                    inputMode={b.type === formBlockType.integer ? 'numeric' : 'decimal'}
                  />
                )}

                {(b.type === formBlockType.period || b.type === formBlockType.string) && (
                  <FormTextInput
                    value={b.value}
                    onChange={presentation => {
                      const value = b.type === formBlockType.string ? presentation : {presentation};
                      const data = (i: FeedbackBlock) => ({
                        field: {...i.field!, value},
                        value: presentation,
                      });
                      onBlockChange(b, data);
                    }}
                    multiline={b.multiline}
                    placeholder={label}
                    onClear={() => onTextValueChange(b, '')}
                  />
                )}

                {b.type === formBlockType.field && (
                  <FormSelect
                    value={b.value}
                    label={label}
                    onPress={() => {
                      dispatch(
                        actions.setSelect(b, (value: FeedbackFormBlockCustomField) => {
                          const data = (i: FeedbackBlock) => ({
                            field: {...i.field!, value},
                            value: new Array().concat(value).map(getLocalizedName).join(', '),
                          });
                          onBlockChange(b, data);
                        })
                      );
                    }}
                  />
                )}

                {(b.type === formBlockType.date || b.type === formBlockType.dateTime) && (
                  <FormSelect value={b.value} label={label} onPress={() => setDateTimeBlock(b)} />
                )}

                {b.type === formBlockType.attachment && (
                  <View style={styles.block}>
                    <AttachmentAddPanel
                      showAddAttachDialog={() => {
                        dispatch(onToggleAttachDialogVisibility(true));
                      }}
                    />
                    <FilesPreviewPanel
                      files={files}
                      onRemove={f => {
                        setFiles(files.filter(it => it.url !== f.url));
                      }}
                    />
                  </View>
                )}
              </View>
            );
          })}
          <View style={styles.separator} />
        </ScrollView>
      </KeyboardAvoidingView>

      {!!dateTimeBlock && (
        <ModalView>
          <DateTimePicker
            onHide={() => setDateTimeBlock(null)}
            current={null}
            emptyValueName={dateTimeBlock?.label}
            withTime={dateTimeBlock.type === formBlockType.dateTime}
            onApply={(date: Date | null) => {
              if (dateTimeBlock.field) {
                const timestamp = date ? date.valueOf() : undefined;
                dateTimeBlock.field.value = timestamp;
                dateTimeBlock.value = timestamp ? absDate(timestamp, dateTimeBlock.type === formBlockType.date) : '';
              }
              setDateTimeBlock(null);
            }}
          />
        </ModalView>
      )}

      {!!selectProps && <SelectWithCustomInput {...selectProps} />}

      {isAttachDialogVisible && (
        <AttachFileDialog
          analyticsId={ANALYTICS_HD_FEEDBACK_PAGE}
          hideVisibility={true}
          actions={{
            onAttach: async (fls: NormalizedAttachment[], onAttachingFinish: (f: NormalizedAttachment[]) => void) => {
              const fils = new Array<NormalizedAttachment>().concat(files).concat(fls);
              setFiles(fils);
              onAttachingFinish(fls);
              dispatch(onToggleAttachDialogVisibility(false));
            },
            onCancel: () => dispatch(onToggleAttachDialogVisibility(false)),
          }}
        />
      )}
    </View>
  );
};

export default HelpDeskFeedback;
