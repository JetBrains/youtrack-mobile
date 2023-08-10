import {i18n} from 'components/i18n/i18n';
import {FilterField} from 'types/CustomFields';

export interface FilterSetting {
  filterField: FilterField[];
  key: string;
  selectedValues: string[];
}

export interface FiltersSetting {
  [name: string]: FilterSetting | undefined;
}

export interface IssueSetting {
  mode: number;
  label: string;
  filters?: FiltersSetting;
}

export interface IssuesSettings {
  view: IssueSetting;
  search: IssueSetting;
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

const issuesSettingsIssueSizes: IssueSetting[] = [
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

const issuesSettingsSearch: IssueSetting[] = [
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
}

const defaultHelpdeskFilterFieldConfig = {
  ...defaultIssuesFilterFieldConfig,
  type: 'type',
};


export {
  issuesSearchSettingMode,
  issuesSettingsDefault,
  issuesSettingsIssueSizes,
  issuesSettingsSearch,
  issuesViewSettingMode,
  defaultIssuesFilterFieldConfig,
  defaultHelpdeskFilterFieldConfig,
};
