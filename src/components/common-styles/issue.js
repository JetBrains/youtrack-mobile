import {UNIT} from '../variables/variables';
import {mainText, secondaryText} from './typography';


export const title = {
  fontSize: 18,
  fontWeight: '500',
  lineHeight: 21,
  letterSpacing: -0.22
};

export const issueCard = {
  issueId: {
    flexShrink: 0,
    flexGrow: 0,
    ...secondaryText,
  },

  issueSummary: {
    ...mainText,
    flex: 1,
    marginTop: UNIT,
    fontWeight: '500',
  }
};

export const issueIdResolved = {
  textDecorationLine: 'line-through'
};

