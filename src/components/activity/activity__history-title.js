/* @flow */

import {i18n, i18nPlural} from 'components/i18n/i18n';
import {isActivityCategory} from './activity__category';

export default function getEventTitle(event: Object, omitFormatting?: boolean): ?string {
  const title = getTitle(event);
  if (omitFormatting) {
    return title;
  }
  return format(title);
}

export function getTitle(event) {
  const eventField = event.field;
  let label;

  const eventsCount: number = (event.added || []).length + (event.removed || []).length;
  switch (true) {
  case !eventField:
    label = i18n('[Removed field]');
    break;
  case eventField.id === 'description':
    label = isActivityCategory.articleDescription ? i18n('Content changed') : i18n('Description changed');
    break;
  case eventField.id === 'summary':
    label = i18n('Summary changed');
    break;
  case eventField.id === 'comment':
    label = i18n('Comment changed');
    break;
  case eventField.id === 'tag':
    label = i18nPlural(
      eventsCount,
      'Tag',
      'Tags',
    );
    break;
  case eventField.id === 'attachments':
    label = i18nPlural(
      eventsCount,
      'Attachment',
      'Attachments',
    );
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
