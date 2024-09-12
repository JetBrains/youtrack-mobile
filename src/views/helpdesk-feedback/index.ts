import log from 'components/log/log';
import {getFieldType, getLocalizedName} from 'components/custom-field/custom-field-helper';
import {i18n} from 'components/i18n/i18n';
import {sortByOrdinal} from 'components/search/sorting';

import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {FeedbackForm, FeedbackFormBlock, FeedbackFormProject} from 'types/FeedbackForm';
import {User, UserTypeId} from 'types/User';
import {EntityBase} from 'types/Entity';

import {DATE_AND_TIME_FIELD_VALUE_TYPE} from 'components/custom-fields-panel';

export const FeedbackFormPredefinedBlock = {
  attachment: 'AttachmentsFeedbackBlock',
  customField: 'CustomFieldFeedbackBlock',
  description: 'DescriptionFeedbackBlock',
  email: 'EmailFeedbackBlock',
  summary: 'SummaryFeedbackBlock',
  text: 'TextFeedbackBlock',
} as const;

export const formBlockType: {[key: string]: string} = {
  date: 'date',
  dateTime: 'dateTime',
  email: 'email',
  field: 'field',
  float: 'float',
  input: 'input',
  integer: 'integer',
  period: 'period',
  string: 'string',
  text: 'text',
};

interface FeedbackFormRecord {
  [key: string]: any;
}

export interface FeedbackFormData extends FeedbackFormRecord {
  fields: Array<EntityBase | {captchaToken: string}>;
}

export interface FeedbackFormBlockFieldValue {
  $type: string;
  id: string;
  localizedName: string | null;
  name: string;
}

interface FeedbackFormBlockFieldPresentation {
  presentation: string;
}

export type FeedbackFormBlockCustomField = FeedbackFormBlockFieldValue | FeedbackFormBlockFieldValue[];

export type FeedbackFormFieldValue =
  | FeedbackFormBlockCustomField
  | FeedbackFormBlockFieldPresentation
  | FeedbackFormReporter[]
  | number
  | string;

export interface FeedbackFormField {
  $type: string;
  id: string;
  isMultiValue: boolean;
  periodPattern?: RegExp;
  value?: FeedbackFormFieldValue;
}

export interface FeedbackBlock {
  $type: (typeof FeedbackFormPredefinedBlock)[keyof typeof FeedbackFormPredefinedBlock];
  description: string | null;
  field: FeedbackFormField | null;
  id: string;
  label: string | null;
  name: string | null;
  value?: string;
  multiline: boolean;
  required: boolean;
  type: string | null;
  reporter?: FeedbackFormReporter;
}

export interface FeedbackFormReporter {
  id: string;
  name: string;
  login: string;
  guest: boolean;
  userType: {
    id: string;
  };
  profile: {
    avatar: {
      url: string;
    };
    email: {
      email: string;
    };
  };
}

const createDefaultBlock = (b: FeedbackFormBlock): FeedbackBlock => ({
  $type: b.$type,
  description: b.description,
  field: null,
  id: b.id,
  label: null,
  multiline: false,
  name: null,
  required: b.required,
  type: formBlockType.input,
});

export const createFormBlock = (
  b: FeedbackFormBlock,
  currentUser: User,
  issuePermissions: IssuePermissions,
  project: FeedbackFormProject
): FeedbackBlock | null => {
  const defaultBlock = createDefaultBlock(b);
  const blockType = b.$type;
  let label: string = '';
  switch (blockType) {
    case FeedbackFormPredefinedBlock.email:
      const isAdmin = issuePermissions.isAgentInProject(project);
      const userTypeId = currentUser.userType.id;
      const isAgent = userTypeId === UserTypeId.AGENT && isAdmin;
      const isRestrictedProject = project.restricted;
      if (isAgent) {
        label = (isAdmin && isRestrictedProject) || !isRestrictedProject ? 'Reporter or email address' : 'Reporter';
      } else {
        label = i18n('Email address');
      }
      return {
        ...defaultBlock,
        type:
          userTypeId !== UserTypeId.REPORTER && userTypeId !== UserTypeId.STANDARD_USER
            ? formBlockType.email
            : null,
        label,
        name: 'email',
      };
    case FeedbackFormPredefinedBlock.text:
      return {
        ...defaultBlock,
        label: b.text,
        type: formBlockType.text,
        name: null,
      };
    case FeedbackFormPredefinedBlock.customField:
      let value;
      let periodPattern;
      const pf = b.projectField;
      const isMultiValue = pf.field.fieldType.isMultiValue;
      if (pf.defaultValues) {
        value = isMultiValue ? pf.defaultValues : pf.defaultValues[0];
      }
      const ft = getFieldType(pf.field) || '';
      let type = formBlockType[ft];
      let presentation = '';
      const emptyFieldText = pf.emptyFieldText;
      switch (true) {
        case (ft === formBlockType.float || ft === formBlockType.integer || ft === formBlockType.string):
          label = `${pf.field.name}${
            emptyFieldText ? ` (${emptyFieldText})` : ''
          }`;
          break;
        case ft === formBlockType.period:
          periodPattern = new RegExp(`^${b.periodFieldPattern}$`, 'i');
          label = `${pf.field.name} (${i18n('1w 1d 1h 1m')})`;
          break;
        case (ft === DATE_AND_TIME_FIELD_VALUE_TYPE):
          type = formBlockType.dateTime;
          presentation = i18n('Set date and time');
          break;
        case (ft === formBlockType.date):
          presentation = i18n('Set a date');
          break;
        default:
          type = formBlockType.field;
          presentation = pf.defaultValues
            ? pf.defaultValues.map(getLocalizedName).join(', ')
            : emptyFieldText || '';
      }
      if (!presentation && pf.canBeEmpty && emptyFieldText) {
        presentation = emptyFieldText;
      }
      return {
        ...defaultBlock,
        label: label || getLocalizedName(pf.field),
        name: 'fields',
        type,
        field: {
          $type: pf.$type!,
          id: pf.id,
          value,
          isMultiValue,
          periodPattern,
        },
        value: presentation,
      };
    case FeedbackFormPredefinedBlock.description:
      return {
        ...defaultBlock,
        multiline: true,
        label: i18n('Description'),
        name: 'description',
      };
    case FeedbackFormPredefinedBlock.summary:
      return {
        ...defaultBlock,
        label: i18n('Summary'),
        name: 'summary',
      };
    case FeedbackFormPredefinedBlock.attachment:
      return {
        ...defaultBlock,
        type: formBlockType.attachment,
      };
    default:
      log.warn(`Unsupported feedback form block [${blockType}]`);
      return null;
  }
};

export const createFormBlocks = (
  ff: FeedbackForm,
  issuePermissions: IssuePermissions,
  currentUser: User
): FeedbackBlock[] => {
  return (ff.blocks || [])
    .sort(sortByOrdinal)
    .map(b => createFormBlock(b, currentUser, issuePermissions, ff.parent.project))
    .filter((b): b is FeedbackBlock => b != null);
};

export const isDateOrTimeBlock = (b: FeedbackBlock) => b.type === formBlockType.date || b.type === formBlockType.dateTime;

export const isEmailBlock = (b: FeedbackBlock) => b.type === formBlockType.email;

export const isTextFieldBlock = (b: FeedbackBlock) => b.type === formBlockType.period || b.type === formBlockType.string;

export const isNumberFieldBlock = (b: FeedbackBlock) => b.type === formBlockType.integer || b.type === formBlockType.float;

export const blockValueToNumber = (b: FeedbackBlock, value: string) =>
  b.type === formBlockType.float ? parseFloat(value) : parseInt(value, 10);
