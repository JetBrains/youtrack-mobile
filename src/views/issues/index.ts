import {i18n} from 'components/i18n/i18n';

export interface IssueSetting {
  mode: number,
  label: string,
}

export interface IssuesSettings {
  view: IssueSetting;
  search: IssueSetting;
}

enum issuesViewSetting {
  S = 0,
  M = 1,
  L = 2,
}

enum issuesSearchSetting {
  query = 0,
  filter = 1,
}

const issuesSettingsIssueSizes: IssueSetting[] = [
  {
    label: i18n('Small'),
    mode: issuesViewSetting.S,
  },
  {
    label: i18n('Medium'),
    mode: issuesViewSetting.M,
  },
  {
    label: i18n('Large'),
    mode: issuesViewSetting.L,
  },
];

const issuesSettingsSearch: IssueSetting[] = [
  {
    label: i18n('Filters'),
    mode: issuesSearchSetting.filter,
  },
  {
    label: i18n('Query'),
    mode: issuesSearchSetting.query,
  },
];

const issuesSettingsDefault: IssuesSettings = {
  view: issuesSettingsIssueSizes[1],
  search: issuesSettingsSearch[0],
};


export {
  issuesSearchSetting,
  issuesSettingsDefault,
  issuesSettingsIssueSizes,
  issuesSettingsSearch,
  issuesViewSetting,
};
