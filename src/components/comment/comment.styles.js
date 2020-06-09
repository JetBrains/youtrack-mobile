import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT, COLOR_FONT_GRAY} from '../variables/variables';

import {mainText} from '../common-styles/typography';
import {link} from '../common-styles/button';

export default StyleSheet.create({
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: UNIT,
    marginTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT
  },

  authorName: {
    color: COLOR_FONT,
    fontWeight: 'bold'
  },
  comment: {
    marginLeft: UNIT,
    flex: 1
  },
  commentWikiContainer: {
    minHeight: UNIT * 3,
  },
  commentText: {
    marginTop: UNIT
  },
  deletedCommentText: {
    ...mainText,
    color: COLOR_FONT_GRAY
  },
  actions: {
    marginTop: UNIT,
  },
  actionLink: {
    ...mainText,
    ...link,
  },

  swipeButton: {
    paddingTop: UNIT,
    flex: 1,
    alignItems: 'center'
  },
  swipeButtonIcon: {
    marginTop: 4,
    width: UNIT * 2,
    height: UNIT * 2
  },
  swipeButtonText: {
    color: '#FFF',
    paddingTop: UNIT/2,
    fontSize: 10,
    fontFamily: 'System'
  }
});
