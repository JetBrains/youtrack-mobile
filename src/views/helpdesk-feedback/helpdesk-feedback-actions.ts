import HelpDeskFeedbackReporterOption from 'views/helpdesk-feedback/helpdesk-feedback-reporter-option';
import {
  createFormBlocks,
  FeedbackBlock,
  FeedbackFormBlockCustomField,
  FeedbackFormData,
  FeedbackFormBlockFieldValue,
  FeedbackFormReporter,
} from 'views/helpdesk-feedback/index';
import {emailRegexp} from 'components/form/validate';
import {getLocalizedName, projectCustomFieldTypeToFieldType} from 'components/custom-field/custom-field-helper';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from 'components/notification/notification';
import {SET_PROGRESS} from 'actions/action-types';
import {setError, setSelectProps, setFormData, setProject, setAttachDialogVisibile} from './helpdesk-feedback-reducers';
import {until} from 'util/util';

import type {CustomError} from 'types/Error';
import type {FeedbackForm} from 'types/FeedbackForm';
import type {ProjectHelpdesk} from 'types/Project';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import type {User} from 'types/User';
import type {NormalizedAttachment} from 'types/Attachment';

const loadFeedbackForm = (project: ProjectHelpdesk, uuid?: string): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    dispatch(setError(null));
    dispatch(setProject(project));
    const state = getState();
    const id = uuid || project.plugins.helpDeskSettings.defaultForm.uuid;
    const [error, form] = await until<FeedbackForm>(getApi().helpDesk.getForm(id));
    if (error) {
      dispatch(setError(error));
    } else {
      const currentUser = getState().app.user as User;
      dispatch(setFormData({form, formBlocks: createFormBlocks(form, state.app.issuePermissions, currentUser)}));
    }
  };
};

const resetSelectProps = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => dispatch(setSelectProps(null));
};

const setSelect = (b: FeedbackBlock, onSelect: (s: FeedbackFormBlockCustomField) => void): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const form = getState().helpDeskFeedbackForm.form!;
    const [error, values] = await until<Array<FeedbackFormBlockFieldValue>>(
      getApi().helpDesk.getFieldValues(form?.uuid, b.id)
    );
    if (error) {
      notifyError(error);
    }
    const field = b.field!;
    const multi = field.isMultiValue;
    const selectedItems = field.value ? ((multi ? field.value : [field.value]) as FeedbackFormBlockFieldValue[]) : [];
    dispatch(
      error
        ? null
        : setSelectProps({
            multi,
            getTitle: getLocalizedName,
            dataSource: () => Promise.resolve(values),
            selectedItems,
            onSelect: (selected: FeedbackFormBlockCustomField) => {
              onSelect(selected);
              dispatch(resetSelectProps());
            },
            onCancel: () => dispatch(resetSelectProps()),
          })
    );
  };
};

const setUserSelect = (
  value: string = '',
  onSelect: ({reporter, email}: {reporter?: FeedbackFormReporter; email?: string}) => void,
  project: ProjectHelpdesk,
  reporter?: FeedbackFormReporter,
): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const dataSource = async (query: string = '') => {
      const _q = query.trim();
      const restriction = project.restricted ? `and access(project: {${project.name}}, with: {Create Issue})` : '';
      const q = encodeURIComponent(`not is:banned and type:Reporter${_q ? ` and ${_q}` : ''} ${restriction}`);
      const [error, users] = await until<FeedbackFormReporter[]>(
        getApi().user.getHubUsers(q, 'id,name,login,guest,profile(avatar(url),email(email)),userType(id)')
      );
      return error ? [] : users.filter(u => !u.guest);
    };

    dispatch(
      setSelectProps({
        getTitle: getLocalizedName,
        titleRenderer: (user: FeedbackFormReporter) => HelpDeskFeedbackReporterOption({user}),
        dataSource,
        selectedItems: [],
        customInput: project.restricted ? undefined : reporter ? '' : value,
        customInputPlaceholder: i18n('Email address'),
        customInputValidator: emailRegexp,
        onSelect: (v: FeedbackFormReporter | string) => {
          onSelect(typeof v === 'string' ? {email: v} : {reporter: v});
          dispatch(resetSelectProps());
        },
        onCancel: () => dispatch(resetSelectProps()),
        filterItems: (users: FeedbackFormReporter[]) => users,
      })
    );
  };
};

const setInProgress = (isInProgress: boolean = false): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) =>
    dispatch({
      type: SET_PROGRESS,
      isInProgress,
    });
};

const submitForm = (
  formBlocks: FeedbackBlock[],
  files: NormalizedAttachment[] | null,
  captchaToken: string | null,
): ReduxAction<Promise<CustomError | void>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const state = getState().helpDeskFeedbackForm;
    const form = state.form!;
    const formData = formBlocks
      .filter((b: FeedbackBlock) => b.value && b.name)
      .reduce(
        (akk: FeedbackFormData, b) => {
          if (b.field) {
            akk.fields.push({
              ...b.field,
              $type: projectCustomFieldTypeToFieldType(b.field.$type, b.field.isMultiValue),
            });
          } else if (b.reporter) {
            akk.reporter = {ringId: b.reporter.id};
          } else if (b.name !== null) {
            akk[b.name] = b.value;
          }
          return akk;
        },
        {fields: []}
      );
    if (captchaToken) {
      formData.captchaToken = captchaToken;
    }
    dispatch(setInProgress(true));
    const [error] = await until<{
      id: string;
    }>(getApi().helpDesk.submitForm(form.uuid, formData, files));
    dispatch(setInProgress(false));
    if (error) {
      notifyError(error);
      return Promise.reject(error);
    }
    if (form.confirmationText) {
      notify(form.confirmationText);
    }
    return Promise.resolve();
  };
};

const onRefresh = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const state = getState().helpDeskFeedbackForm;
    dispatch(loadFeedbackForm(state.project!));
  };
};

const onToggleAttachDialogVisibility = (isVisible: boolean): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(setAttachDialogVisibile(isVisible));
  };
};

export {loadFeedbackForm, onRefresh, onToggleAttachDialogVisibility, setSelect, setUserSelect, submitForm};
