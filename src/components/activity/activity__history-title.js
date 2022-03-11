/* @flow */

import {i18n} from 'components/i18n/i18n';

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
    label = countAllEventEntities(event) > 1 ? i18n('Tags') : i18n('Tag');
    break;
  case eventField.id === 'attachments':
    label = countAllEventEntities(event) > 1 ? i18n('Attachments') : i18n('Attachment');
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
