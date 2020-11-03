import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

import {mainText} from '../common-styles/typography';

export default EStyleSheet.create({
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: UNIT,
    marginTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT
  },

  authorName: {
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
    color: '$icon'
  },
  actions: {
    marginTop: UNIT,
  },
  actionLink: {
    ...mainText,
    color: '$link'
  }
});
