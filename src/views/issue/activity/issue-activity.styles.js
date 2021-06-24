import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE} from '../../../components/common-styles/typography';
import {UNIT} from '../../../components/variables/variables';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },

  activities: {
    flexDirection: 'column',
    flex: 1,
  },
  activitiesContainer: {
    paddingLeft: UNIT,
    paddingBottom: UNIT * 3,
    paddingRight: UNIT,
  },

  settings: {
    margin: UNIT * 1.5,
  },
  settingsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UNIT,
    paddingTop: UNIT,
    paddingBottom: UNIT,
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
    textTransform: 'capitalize',
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
    paddingHorizontal: UNIT / 2
  },
  editCommentPanel: {
    position: 'relative',
  },
  editCommentCloseButton: {
    position: 'absolute',
    marginTop: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    left: UNIT * 1.2,
    width: UNIT * 3,
    height: UNIT * 3,
  },
  link: {
    color: '$link',
  },
});
