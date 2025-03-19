import {i18n} from 'components/i18n/i18n';
import {getStorageState} from 'components/storage/storage';

import type {FilterField} from 'types/Sorting';
import type {IssueOnList} from 'types/Issue';


export interface FilterFieldSetting {
  filterField: FilterField[];
  id: string;
  name: string;
  selectedValues: string[];
}

export interface FilterFiledSettingMap {
  [name: string]: FilterFieldSetting;
}

export interface IssuesSetting {
  mode: number;
  label: string;
}

export interface IssuesSettingSearch extends IssuesSetting {
  filters?: FilterFiledSettingMap;
}

export interface IssuesSettings {
  view: IssuesSetting;
  search: IssuesSettingSearch;
}

enum issuesViewSettingMode {
  S = 0,
  M = 1,
  L = 2,
}

enum issuesSearchSettingMode {
  query = 0,
  filter = 1,
}

const issuesSettingsIssueSizes: IssuesSetting[] = [
  {
    label: i18n('Small'),
    mode: issuesViewSettingMode.S,
  },
  {
    label: i18n('Medium'),
    mode: issuesViewSettingMode.M,
  },
  {
    label: i18n('Large'),
    mode: issuesViewSettingMode.L,
  },
];

const issuesSettingsSearch: (IssuesSetting | IssuesSettingSearch)[] = [
  {
    label: i18n('Query'),
    mode: issuesSearchSettingMode.query,
  },
  {
    label: i18n('Filters'),
    mode: issuesSearchSettingMode.filter,
    filters: {},
  },
];

const issuesSettingsDefault: IssuesSettings = {
  view: issuesSettingsIssueSizes[1],
  search: {
    ...issuesSettingsSearch[1],
    filters: {},
  },
};

const getIssueFromCache = (issueId: string): IssueOnList | null => {
  const cachedIssues: IssueOnList[] = getStorageState().issuesCache || [];
  return cachedIssues.find((it: IssueOnList) => it.id === issueId || it.idReadable === issueId) || null;
};


enum defaultIssuesFilterFieldConfig {
  project = 'project',
  state = 'state',
  assignee = 'assignee',
  type = 'type',
}


export {
  defaultIssuesFilterFieldConfig,
  issuesSearchSettingMode,
  issuesSettingsDefault,
  issuesSettingsIssueSizes,
  issuesSettingsSearch,
  issuesViewSettingMode,
  getIssueFromCache,
};
