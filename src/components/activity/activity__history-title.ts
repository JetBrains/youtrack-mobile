import {i18n, i18nPlural} from 'components/i18n/i18n';
import {isActivityCategory} from './activity__category';
import type {Activity} from '../../types/Activity';
export default function getEventTitle(
  activity: Activity,
  omitFormatting?: boolean,
): string | null | undefined {
  const title = getTitle(activity);

  if (omitFormatting) {
    return title;
  }

  return format(title);
}
export function getTitle(activity: Activity) {
  const eventField = activity.field;
  let label;

  const getCount = () =>
    (Array.isArray(activity.added) ? activity.added.length : 0) +
    (Array.isArray(activity.removed) ? activity.removed.length : 0);

  switch (true) {
    case !eventField:
      label = i18n('[Removed field]');
      break;

    case eventField.id === 'description':
      label = isActivityCategory.articleDescription(activity)
        ? i18n('Content revised')
        : i18n('Description changed');
      break;

    case eventField.id === 'summary':
      label = isActivityCategory.articleSummary(activity)
        ? i18n('Title changed')
        : i18n('Summary changed');
      break;

    case eventField.id === 'comment':
      label = i18n('Comment changed');
      break;

    case eventField.id === 'tag':
      label = i18nPlural(getCount(), 'Tag', 'Tags');
      break;

    case eventField.id === 'attachments':
      label = i18nPlural(getCount(), 'Attachment', 'Attachments');
      break;

    case eventField.id === 'attachment name':
      label = i18n('Attachment name');
      break;

    case eventField.id === 'visible to':
      label = i18n('Visibility');
      break;

    default:
      label = eventField.presentation;
  }

  return label;
}

function format(title: string) {
  return title ? `${title}: ` : null;
}
