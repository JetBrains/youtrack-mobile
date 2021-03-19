import {elevation1} from './shadow';
import {mainText} from './typography';
import {UNIT} from '../variables/variables';
import {Platform} from 'react-native';

export const tabsStyles = {
  tabsBar: {
    ...elevation1,
    backgroundColor: '$background',
  },
  tabLabel: {
    ...mainText,
    paddingTop: UNIT,
    paddingBottom: UNIT,
    fontWeight: '500',
    textTransform: 'none',

    ...Platform.select({
      ios: {},
      android: {
        fontSize: 18,
        fontWeight: '400',
      },
    }),
  },
  tabLabelActive: {
    fontWeight: '400',
  },
  tabLazyPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
