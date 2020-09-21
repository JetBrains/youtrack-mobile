import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK} from '../../components/variables/variables';
import {headerTitle, monospace, SECONDARY_FONT_SIZE} from '../../components/common-styles/typography';


export default StyleSheet.create({
  headerTitle: {
    ...headerTitle
  },
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  scrollContent: {
    flexGrow: 1
  },
  wiki: {
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 2
  },
  plainText: {
    color: COLOR_BLACK,
    fontSize: SECONDARY_FONT_SIZE,
    ...monospace
  }
});
