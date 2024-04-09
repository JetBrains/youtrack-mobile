import log from 'components/log/log';
import {getLocalizedName, getSimpleCustomFieldType} from 'components/custom-field/custom-field-helper';
import {i18n} from 'components/i18n/i18n';
import {sortByOrdinal} from 'components/search/sorting';

import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {FeedbackForm, FeedbackFormBlock, FeedbackFormProject} from 'types/FeedbackForm';
import {User} from 'types/User';
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
  text: 'text',
  field: 'field',
  period: 'period',
  input: 'input',
  email: 'email',
  date: 'date',
  dateTime: 'dateTime',
};

interface FeedbackFormRecord {
  [key: string]: any;
}

export interface FeedbackFormData extends FeedbackFormRecord {
  fields: Array<EntityBase>;
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
  | number
  | string;

export interface FeedbackFormField {
  $type: string;
  id: string;
  value?: FeedbackFormFieldValue;
  isMultiValue: boolean;
}

export interface FeedbackBlock {
  $type: (typeof FeedbackFormPredefinedBlock)[keyof typeof FeedbackFormPredefinedBlock];
  description: string | null;
  field: FeedbackFormField | null;
  id: string;
  label: string | null;
  name: string | null;
  value?: string | undefined;
  multiline: boolean;
  required: boolean;
  type: string;
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
  author: User,
  issuePermissions: IssuePermissions,
  parentProject?: FeedbackFormProject
): FeedbackBlock | null => {
  const defaultBlock = createDefaultBlock(b);
  const blockType = b.$type;
  switch (blockType) {
    case FeedbackFormPredefinedBlock.email:
      const isAgent =
        author.userType.id === 'AGENT' && !!parentProject && issuePermissions.isAgentInProject(parentProject);
      let label: string;
      if (isAgent) {
        const isAdmin = !!parentProject && issuePermissions.canUpdateProject(parentProject.ringId);
        const isRestrictedProject = parentProject.restricted;
        label = (isAdmin && isRestrictedProject) || !isRestrictedProject ? 'Reporter or email address' : 'Reporter';
      } else {
        label = i18n('Email address');
      }
      return {
        ...defaultBlock,
        type: formBlockType.email,
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
      const isMultiValue = b.projectField.field.fieldType.isMultiValue;
      if (b.projectField.defaultValues) {
        value = isMultiValue ? b.projectField.defaultValues : b.projectField.defaultValues[0];
      }
      const ft = getSimpleCustomFieldType(b.projectField) || '';
      let type;
      if (ft === DATE_AND_TIME_FIELD_VALUE_TYPE) {
        type = formBlockType.dateTime;
      } else {
        type = formBlockType[ft] || formBlockType.field;
      }
      return {
        ...defaultBlock,
        label: getLocalizedName(b.projectField.field),
        name: 'fields',
        type,
        field: {
          $type: b.projectField.$type,
          id: b.projectField.id,
          value,
          isMultiValue,
        },
        value: b.projectField.defaultValues
          ? b.projectField.defaultValues.map(getLocalizedName).join(', ')
          : b.projectField.emptyFieldText,
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
    default:
      log.warn(`Unsupported feedback form block [${blockType}]`);
      return null;
  }
};

export const createFormBlocks = (ff: FeedbackForm, issuePermissions: IssuePermissions): FeedbackBlock[] => {
  return (ff.blocks || [])
    .sort(sortByOrdinal)
    .map(b => createFormBlock(b, ff.author, issuePermissions, ff.parent?.project))
    .filter((b): b is FeedbackBlock => b != null);
};

export const projectCustomFieldTypeToFieldType = ($type: string, isMultiValue: boolean): string => {
  const prefix = isMultiValue ? 'Multi' : 'Single';
  const map: {
    [k: string]: string | undefined;
  } = {
    BuildProjectCustomField: `${prefix}BuildIssueCustomField`,
    StateProjectCustomField: 'StateMachineIssueCustomField',
    VersionProjectCustomField: `${prefix}VersionIssueCustomField`,
    EnumProjectCustomField: `${prefix}EnumIssueCustomField`,
    UserProjectCustomField: `${prefix}UserIssueCustomField`,
    GroupProjectCustomField: `${prefix}GroupIssueCustomField`,
    OwnedProjectCustomField: `${prefix}OwnedIssueCustomField`,
    PeriodProjectCustomField: 'PeriodIssueCustomField',
    SimpleProjectCustomField: 'SimpleIssueCustomField',
    SlaIssueCustomField: 'SlaIssueCustomField',
    TextProjectCustomField: 'TextIssueCustomField',
  };
  return map[$type] || $type;
};
