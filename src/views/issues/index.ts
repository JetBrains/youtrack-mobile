export interface IssuesViewMode {
  mode: number;
  label: string;
}

enum issuesViewMode {
  S = 0,
  M = 1,
  L = 2,
}

const issuesViewModes: IssuesViewMode[] = [
  {
    label: 'S',
    mode: issuesViewMode.S,
  },
  {
    label: 'M',
    mode: issuesViewMode.M,
  },
  {
    label: 'L',
    mode: issuesViewMode.L,
  },
];


export {
  issuesViewMode,
  issuesViewModes,
};
