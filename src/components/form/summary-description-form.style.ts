import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {HEADER_FONT_SIZE, mainText} from 'components/common-styles/typography';
export const summary = {
  fontSize: HEADER_FONT_SIZE,
  lineHeight: HEADER_FONT_SIZE + 4,
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
