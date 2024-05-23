import type {Folder} from 'types/User';
import {i18n} from 'components/i18n/i18n';

export const EVERYTHING_SEARCH_CONTEXT: Folder = {
  id: null,
  name: i18n('Everything'),
  query: '',
} as unknown as Folder;
