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
import DateTimePicker from 'components/date-picker/date-time-picker';
import FormSelect from 'components/form/form-select-button';
import FormTextInput from 'components/form/form-text-input';
import Header from 'components/header/header';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import Select from 'components/select/select';
import {FeedbackBlock, FeedbackFormBlockCustomField, formBlockType} from 'views/helpdesk-feedback';
import {getLocalizedName} from 'components/custom-field/custom-field-helper';
import {HIT_SLOP} from 'components/common-styles';
import {IconBack, IconCheck, IconClose} from 'components/icon/icon';
import {isIOSPlatform} from 'util/util';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './helpdesk-feedback.styles';

import {AppState} from 'reducers';
import {ProjectHelpdesk} from 'types/Project';
import {ReduxThunkDispatch} from 'types/Redux';
import {Theme, UIThemeColors} from 'types/Theme';
import {isSplitView} from 'components/responsive/responsive-helper';
import {absDate} from 'components/date/date';

const HelpDeskFeedback = ({project}: {project: ProjectHelpdesk}) => {
  const theme: Theme = React.useContext(ThemeContext);
  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;

  const dispatch: ReduxThunkDispatch = useDispatch();

  const form = useSelector((state: AppState) => state.helpDeskFeedbackForm.form);
  const blocks = useSelector((state: AppState) => state.helpDeskFeedbackForm.formBlocks);
  const selectProps = useSelector((state: AppState) => state.helpDeskFeedbackForm.selectProps);
  const inProgress = useSelector((state: AppState) => state.app.isInProgress);

  const [formBlocks, setFormBlocks] = React.useState<FeedbackBlock[]>([]);
  const [dateTimeBlock, setDateTimeBlock] = React.useState<FeedbackBlock | null>(null);

  React.useEffect(() => {
    setFormBlocks(blocks || []);
  }, [blocks]);

  React.useEffect(() => {
    dispatch(actions.loadFeedbackForm(project));
  }, [dispatch, project]);

  const onBack = () => Router.pop();

  const onSubmit = async () => {
    try {
      await dispatch(actions.submitForm(formBlocks));
      onBack();
    } catch (e) {}
  };

  const updateBlock = (b: FeedbackBlock, value: FeedbackFormBlockCustomField) => {
    setFormBlocks(fb => {
      return fb.map(i => {
        return b.id === i.id
          ? {
              ...i,
              field: {...i.field!, value},
              value: new Array().concat(value).map(getLocalizedName).join(', '),
            }
          : i;
      });
    });
  };

  const isDateTimeType = (b: FeedbackBlock) => {
    return b.type === formBlockType.date || b.type === formBlockType.dateTime;
  };

  const isSelectType = (b: FeedbackBlock) => b.type === formBlockType.field || isDateTimeType(b);

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
            const isEmail = b.type === formBlockType.email;
            const label = `${b.label}${b.required ? '*' : ''}`;
            return (
              <View style={styles.block} key={b.id}>
                {(isEmail || b.type === formBlockType.input) && (
                  <FormTextInput
                    value={b.value}
                    onChange={text => {
                      setFormBlocks(fb => {
                        return fb.map(it => (b.id === it.id ? {...b, value: text} : it));
                      });
                    }}
                    multiline={b.multiline}
                    label={label}
                  />
                )}
                {b.type === formBlockType.text && (
                  <View style={styles.block}>
                    <Text style={[styles.block, styles.text]}>{b.label}</Text>
                  </View>
                )}
                {isSelectType(b) && (
                  <FormSelect
                    value={b.value}
                    label={label}
                    onPress={() => {
                      const isDateType = isDateTimeType(b);
                      if (!isDateType) {
                        dispatch(actions.setSelect(b, (value: FeedbackFormBlockCustomField) => updateBlock(b, value)));
                      } else {
                        setDateTimeBlock(b);
                      }
                    }}
                  />
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
                dateTimeBlock.value = timestamp
                  ? absDate(timestamp, dateTimeBlock.type === formBlockType.date)
                  : '';
              }
              setDateTimeBlock(null);
            }}
          />
        </ModalView>
      )}

      {!!selectProps && <Select {...selectProps} />}
    </View>
  );
};

export default HelpDeskFeedback;
