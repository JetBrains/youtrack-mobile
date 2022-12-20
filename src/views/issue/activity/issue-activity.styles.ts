import EStyleSheet from 'react-native-extended-stylesheet';
import {MAIN_FONT_SIZE} from 'components/common-styles/typography';
import {UNIT} from 'components/variables/variables';
export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  activities: {
    flexDirection: 'column',
    flex: 1,
  },
  settingsButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: UNIT / 2,
  },
  settingsButtonText: {
    color: '$icon',
  },
  settingsSwitchDisabled: {
    opacity: 0.4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: UNIT,
    marginTop: UNIT,
    marginBottom: UNIT,
  },
  settingsItemLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsName: {
    color: '$text',
    fontSize: MAIN_FONT_SIZE,
    fontWeight: '500',
  },
  reactionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginLeft: -UNIT,
  },
  reactionItem: {
    flex: 1,
    flexBasis: '11.5%',
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: UNIT,
  },
  reactionButton: {
    paddingHorizontal: UNIT / 2,
  },
  editCommentCloseButton: {
    position: 'absolute',
    zIndex: 1,
    left: UNIT / 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: UNIT * 4,
    height: UNIT * 4,
  },
  link: {
    color: '$link',
  },
});
