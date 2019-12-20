/* @flow */

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

  switch(true) {
  case !eventField:
    label = '[Removed field]';
    break;
  case eventField.id === 'description':
    label = 'Description changed';
    break;
  case eventField.id === 'summary':
    label = 'Summary changed';
    break;
  case eventField.id === 'tag':
    label = countAllEventEntities(event) > 1 ? 'Tags' : 'Tag';
    break;
  case eventField.id === 'attachments':
    label = countAllEventEntities(event) > 1 ? 'Attachments' : 'Attachment';
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
