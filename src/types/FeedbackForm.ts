import {EntityBase} from 'types/Entity';
import {ProjectEntity} from 'types/Project';
import {User} from 'types/User';

export interface FeedbackFormBlockBase extends EntityBase {
  author: User;
  description: string | null;
  ordinal: number;
  parent: FeedbackForm | null;
  required: boolean;
}

export interface EmailFeedbackBlock extends FeedbackFormBlockBase {
  $type: 'EmailFeedbackBlock';
}

export interface SummaryFeedbackBlock extends FeedbackFormBlockBase {
  $type: 'SummaryFeedbackBlock';
}

export interface DescriptionFeedbackBlock extends FeedbackFormBlockBase {
  $type: 'DescriptionFeedbackBlock';
  multiline: true;
}

export interface CustomFieldFeedbackBlock extends FeedbackFormBlockBase {
  $type: 'CustomFieldFeedbackBlock';
  periodFieldPattern: string;
  projectField: {
    $type: string;
    id: string;
    emptyFieldText: string;
    field: {
      id: string;
      localizedName: string | null;
      name: string;
      fieldType: {
        isMultiValue: boolean;
      }
    };
    defaultValues?: Array<{
      $type: string;
      id: string;
      localizedName: string | null;
      name: string;
    }>
  };
}

export interface AttachmentFeedbackBlock extends FeedbackFormBlockBase {
  $type: 'AttachmentsFeedbackBlock';
}

export interface TextFeedbackBlock extends FeedbackFormBlockBase {
  $type: 'TextFeedbackBlock';
  text: string;
}

export type FeedbackFormBlock =
  | AttachmentFeedbackBlock
  | CustomFieldFeedbackBlock
  | DescriptionFeedbackBlock
  | EmailFeedbackBlock
  | SummaryFeedbackBlock
  | TextFeedbackBlock;

export interface FeedbackFormProject extends ProjectEntity {
  restricted: boolean;
}

export interface FeedbackForm extends EntityBase {
  author: User;
  blocks: Array<FeedbackFormBlock> | null;
  captchaPublicKey: string | null;
  confirmationText: string | null;
  disabled: boolean;
  errors: Array<string> | null;
  id: string;
  isDefault: boolean;
  name: string;
  parent: {
    project: FeedbackFormProject;
  } | null;
  title: string;
  useCaptcha: boolean;
  uuid: string;
}
