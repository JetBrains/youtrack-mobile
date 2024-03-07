import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  slaField: {
    marginRight: UNIT / 2,
  },
  slaDefaultStyle: {
    color: '$textButton',
    backgroundColor: '$greenColor',
  },
  slaOverdue: {
    backgroundColor: '$redColor',
  },
  slaPaused: {
    backgroundColor: '$greyColor',
    color: '$text',
  },
  slaPausedIcon: {
    color: '$textSecondary',
  },
  preview: {
    padding: UNIT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewLabel: {
    marginRight: UNIT,
  },
});
