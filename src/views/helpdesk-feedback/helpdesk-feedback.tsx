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
import ErrorMessage from 'components/error-message/error-message';
import FilesPreviewPanel from 'components/attach-file/files-preview-panel';
import FormSelect from 'components/form/form-select-button';
import FormTextInput from 'components/form/form-text-input';
import Header from 'components/header/header';
import HelpDeskReCaptcha from 'views/helpdesk-feedback/helpdesk-feedback-recaptcha';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import SelectWithCustomInput from 'components/select/select-with-custom-input';
import usage from 'components/usage/usage';
import {absDate} from 'components/date/date';
import {ANALYTICS_HD_FEEDBACK_PAGE} from 'components/analytics/analytics-ids';
import {
  blockValueToNumber,
  FeedbackBlock,
  FeedbackFormBlockCustomField,
  FeedbackFormReporter,
  formBlockType,
  isDateOrTimeBlock,
  isEmailBlock,
  isNumberFieldBlock,
  isTextFieldBlock,
} from 'views/helpdesk-feedback';
import {getLocalizedName} from 'components/custom-field/custom-field-helper';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconCheck} from 'components/icon/icon';
import {isIOSPlatform} from 'util/util';
import {onToggleAttachDialogVisibility} from './helpdesk-feedback-actions';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './helpdesk-feedback.styles';

import type {AppState} from 'reducers';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ProjectHelpdesk} from 'types/Project';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {Theme, UIThemeColors} from 'types/Theme';

const HelpDeskFeedback = ({project, uuid}: {project: ProjectHelpdesk, uuid?: string}) => {
  const theme: Theme = React.useContext(ThemeContext);
  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;

  const dispatch: ReduxThunkDispatch = useDispatch();

  const form = useSelector((state: AppState) => state.helpDeskFeedbackForm.form);
  const error = useSelector((state: AppState) => state.helpDeskFeedbackForm.error);
  const blocks = useSelector((state: AppState) => state.helpDeskFeedbackForm.formBlocks);
  const selectProps = useSelector((state: AppState) => state.helpDeskFeedbackForm.selectProps);
  const inProgress = useSelector((state: AppState) => state.app.isInProgress);
  const isAttachDialogVisible = useSelector((state: AppState) => state.helpDeskFeedbackForm.isAttachDialogVisible);
  const language = useSelector((state: AppState) => state.app.user?.profiles.general.locale.language);
  const captchaURL = useSelector((state: AppState) => state.app.auth?.config.backendUrl!);

  const [formBlocks, setFormBlocks] = React.useState<FeedbackBlock[]>([]);
  const [dateTimeBlock, setDateTimeBlock] = React.useState<FeedbackBlock | null>(null);
  const [files, setFiles] = React.useState<Array<NormalizedAttachment>>([]);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFormBlocks(blocks || []);
  }, [blocks]);

  React.useEffect(() => {
    usage.trackScreenView(ANALYTICS_HD_FEEDBACK_PAGE);
    dispatch(actions.loadFeedbackForm(project, uuid));
    setCaptchaToken(null);
  }, [dispatch, project, uuid]);

  const onBack = () => Router.pop();

  const onSubmit = async () => {
    usage.trackEvent(ANALYTICS_HD_FEEDBACK_PAGE, 'Submit form');
    try {
      await dispatch(actions.submitForm(formBlocks, files, captchaToken));
      onBack();
    } catch (e) {}
  };

  const onBlockChange = (b: FeedbackBlock, data: (i: FeedbackBlock) => Partial<FeedbackBlock>) => {
    setFormBlocks(fb => fb.map(i => (b.id === i.id ? {...i, ...data(i)} : i)));
  };

  const onTextValueChange = (b: FeedbackBlock, text?: string) => {
    onBlockChange(b, (i: FeedbackBlock) => ({value: text}));
  };

  const hasNoValue = formBlocks.some(b => b.type && b.required && !b.value?.trim());
  const disabled = inProgress || (form?.useCaptcha && !captchaToken) || hasNoValue;
  const iconColor = disabled ? uiThemeColors.$disabled : uiThemeColors.$link;
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
        leftButton={<IconBack color={uiThemeColors.$link} />}
        onBack={() => !inProgress && onBack()}
        extraButton={
          !error && <TouchableOpacity hitSlop={HIT_SLOP} disabled={disabled} onPress={onSubmit}>
            {inProgress ? <ActivityIndicator color={uiThemeColors.$link} /> : <IconCheck size={26} color={iconColor} />}
          </TouchableOpacity>
        }
      />

      {!!error && <ErrorMessage error={error}/>}

      {!error && (
        <>
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
                const emailBlock = isEmailBlock(b);
                return (
                  <View key={b.id}>
                    {b.type === formBlockType.text && (
                      <View style={styles.block}>
                        <Text style={[styles.block, styles.text]}>{b.label}</Text>
                      </View>
                    )}

                    {b.type === formBlockType.input && (
                      <FormTextInput
                        style={styles.formBlock}
                        value={b.value}
                        onChange={text => onTextValueChange(b, text)}
                        onClear={() => onTextValueChange(b, '')}
                        multiline={b.multiline}
                        placeholder={label}
                        required={b.required}
                      />
                    )}

                    {isNumberFieldBlock(b) && (
                      <FormTextInput
                        style={styles.formBlock}
                        value={b.value}
                        placeholder={label}
                        onChange={text => {
                          const value = text.replace(/,/, '.');
                          const data = (i: FeedbackBlock) => ({
                            field: {
                              ...i.field!,
                              value: blockValueToNumber(b, value),
                            },
                            value,
                          });
                          onBlockChange(b, data);
                        }}
                        multiline={b.multiline}
                        onClear={() => onTextValueChange(b, '')}
                        inputMode={b.type === formBlockType.integer ? 'numeric' : 'decimal'}
                        required={b.required}
                        validator={(v: string) => !Number.isNaN(blockValueToNumber(b, v))}
                      />
                    )}

                    {isTextFieldBlock(b) && (
                      <FormTextInput
                        style={styles.formBlock}
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
                        required={b.required}
                        validator={b.field?.periodPattern}
                      />
                    )}

                    {(emailBlock || b.type === formBlockType.field) && (
                      <FormSelect
                        style={styles.formBlock}
                        value={b.value}
                        label={label}
                        placeholder={emailBlock ? i18n('Select a reporter or enter a new email address') : ''}
                        onPress={() => {
                          dispatch(
                            emailBlock
                              ? actions.setUserSelect(
                                b.value,
                                ({reporter, email}: {reporter?: FeedbackFormReporter; email?: string}) => {
                                  onBlockChange(b, (i: FeedbackBlock) => ({
                                    reporter,
                                    email,
                                    value: email || reporter?.name || '',
                                  }));
                                },
                                project || form?.parent.project,
                                b?.reporter,
                              )
                              : actions.setSelect(b, (value: FeedbackFormBlockCustomField) => {
                                const data = (i: FeedbackBlock) => ({
                                  field: {...i.field!, value},
                                  value: new Array().concat(value).map(getLocalizedName).join(', '),
                                });
                                onBlockChange(b, data);
                              })
                          );
                        }}
                        required={b.required}
                      />
                    )}

                    {isDateOrTimeBlock(b) && (
                      <FormSelect style={styles.formBlock} value={b.value} label={label} onPress={() => setDateTimeBlock(b)} />
                    )}

                    {b.type === formBlockType.attachment && (
                      <View style={[styles.formBlock, files ? styles.attachments : null]}>
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

              {form?.useCaptcha && form?.captchaPublicKey && (
                <HelpDeskReCaptcha
                  style={[styles.formBlock, styles.box]}
                  lang={language}
                  captchaPublicKey={form.captchaPublicKey}
                  captchaURL={captchaURL}
                  onSubmit={(token: string) => {
                    setCaptchaToken(token);
                  }}
                />
              )}

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
                    const data = (i: FeedbackBlock) => ({
                      value: timestamp ? absDate(timestamp, dateTimeBlock.type === formBlockType.date) : '',
                      field: {...i.field!, value: timestamp},
                    });
                    onBlockChange(dateTimeBlock, data);
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
        </>
      )}
    </View>
  );
};

export default HelpDeskFeedback;
