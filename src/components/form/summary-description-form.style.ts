import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';
export const summary = {
  fontSize: 20,
  lineHeight: 24,
  letterSpacing: -0.19,
  fontWeight: '500',
};
export default EStyleSheet.create({
  summary: {...summary, padding: 0, paddingTop: 5, color: '$text'},
  descriptionInput: {...mainText, textAlignVertical: 'top', color: '$text'},
  separator: {
    height: 1,
    marginTop: UNIT * 2,
    marginBottom: UNIT,
    marginRight: -UNIT * 2,
    backgroundColor: '$separator',
  },
  placeholder: {
    color: '$icon',
  },
});
