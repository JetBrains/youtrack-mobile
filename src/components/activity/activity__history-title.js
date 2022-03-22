/* @flow */

import {i18n, i18nPlural} from 'components/i18n/i18n';

export default function getEventTitle(event: Object, omitFormatting?: boolean): ?string {
  const title = getTitle(event);
  if (omitFormatting) {
    return title;
  }
  return format(title);
}

function getTitle(event) {
  const eventField = event.field;
  let label;

  const eventsCount: number = countAllEventEntities(event);
  switch (true) {
  case !eventField:
    label = i18n('[Removed field]');
    break;
  case eventField.id === 'description':
    label = i18n('Description changed');
    break;
  case eventField.id === 'summary':
    label = i18n('Summary changed');
    break;
  case eventField.id === 'tag':
    label = i18nPlural(
      eventsCount,
      '{{amount}} Tag',
      '{{amount}} Tags',
      {amount: eventsCount}
    );
    break;
  case eventField.id === 'attachments':
    label = i18nPlural(
      eventsCount,
      '{{amount}} Attachment',
      '{{amount}} Attachments',
      {amount: eventsCount}
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

function countAllEventEntities(event): number {
  return (event.added || []).length + (event.removed || []).length;
}
