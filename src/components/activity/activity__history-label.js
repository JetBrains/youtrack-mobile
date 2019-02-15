/* @flow */

export default function getHistoryLabel(event: Object) {
  return formatLabel(getEventPresentation(event));
}

function getEventPresentation(event) {
  const eventField = event.field;
  let label = '';

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

function formatLabel(label: string) {
  return label ? `${label}: ` : null;
}

function countAllEventEntities(event): number {
  return (event.added || []).length + (event.removed || []).length;
}
