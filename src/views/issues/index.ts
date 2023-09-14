import {i18n} from 'components/i18n/i18n';
import {FilterField} from 'types/CustomFields';


export interface FilterSetting {
  filterField: FilterField[];
  id: string;
  selectedValues: string[];
}

export interface FiltersSetting {
  [name: string]: FilterSetting;
}

export interface IssuesSetting {
  mode: number;
  label: string;
}

export interface IssuesSettingSearch extends IssuesSetting {
  filters: FiltersSetting;
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
};
