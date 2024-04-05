import React from 'react';
import {ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import * as actions from './helpdesk-feedback-actions';
import FormSelect from 'components/form/form-select-button';
import FormTextInput from 'components/form/form-text-input';
import Header from 'components/header/header';
import Router from 'components/router/router';
import Select from 'components/select/select';
import {FeedbackBlock, formBlockType} from 'views/helpdesk-feedback';
import {getLocalizedName} from 'components/custom-field/custom-field-helper';
import {HIT_SLOP} from 'components/common-styles';
import {IconCheck, IconClose} from 'components/icon/icon';
import {isIOSPlatform} from 'util/util';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './helpdesk-feedback.styles';

import {AppState} from 'reducers';
import {ProjectHelpdesk} from 'types/Project';
import {ReduxThunkDispatch} from 'types/Redux';
import {Theme, UIThemeColors} from 'types/Theme';

const HelpDeskFeedback = ({project}: {project: ProjectHelpdesk}) => {
  const theme: Theme = React.useContext(ThemeContext);
  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;

  const dispatch: ReduxThunkDispatch = useDispatch();

  const form = useSelector((state: AppState) => state.helpDeskFeedbackForm.form);
  const blocks = useSelector((state: AppState) => state.helpDeskFeedbackForm.formBlocks);
  const selectProps = useSelector((state: AppState) => state.helpDeskFeedbackForm.selectProps);
  const inProgress = useSelector((state: AppState) => state.app.isInProgress);

  const [formBlocks, setFormBlocks] = React.useState<FeedbackBlock[]>([]);

  React.useEffect(() => {
    setFormBlocks(blocks || []);
  }, [blocks]);

  React.useEffect(() => {
    dispatch(actions.loadFeedbackForm(project));
  }, [dispatch, project]);

  const onBack = () => Router.Tickets();

  const onSubmit = async () => {
    try {
      await dispatch(actions.submitForm(formBlocks));
      onBack();
    } catch (e) {}
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
        leftButton={<IconClose color={iconColor} />}
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
        <ScrollView contentContainerStyle={styles.formContainer}>
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
                {b.type === formBlockType.field && (
                  <FormSelect
                    value={b.value}
                    label={label}
                    onPress={() => {
                      dispatch(
                        actions.setSelect(b, value => {
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
                        })
                      );
                    }}
                  />
                )}
              </View>
            );
          })}
          <View style={styles.separator} />
        </ScrollView>
      </KeyboardAvoidingView>
      {!!selectProps && <Select {...selectProps} />}
    </View>
  );
};

export default HelpDeskFeedback;
