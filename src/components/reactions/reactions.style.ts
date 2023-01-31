import EStyleSheet from 'react-native-extended-stylesheet';
import {secondaryText} from 'components/common-styles/typography';
import {UNIT} from 'components/variables';

export const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: UNIT / 2.5,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
    height: 24,
    marginBottom: UNIT,
    marginRight: UNIT,
    paddingVertical: UNIT / 2,
    paddingHorizontal: UNIT / 2,
    borderRadius: UNIT / 2,
    backgroundColor: '$boxBackground',
  },
  reactionCount: {...secondaryText, marginLeft: UNIT / 2, color: '$icon'},
});
