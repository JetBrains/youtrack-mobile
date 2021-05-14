import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../common-styles/shadow';
import {headerMinHeight} from '../header/header.styles';
import {mainText, secondaryText} from '../common-styles/typography';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: UNIT,
    marginTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT,
  },

  authorName: {
    fontWeight: 'bold',
  },
  comment: {
    marginLeft: UNIT,
    flex: 1,
  },
  commentWikiContainer: {
    minHeight: UNIT * 3,
  },
  commentText: {
    marginTop: UNIT,
  },
  deletedCommentText: {
    ...mainText,
    color: '$icon',
  },
  actions: {
    marginTop: UNIT,
  },
  actionLink: {
    ...mainText,
    color: '$link',
  },

  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: UNIT / 2.5,
  },
  reactionsReaction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
    height: 24,
    marginTop: UNIT,
    marginRight: UNIT,
    paddingVertical: UNIT / 2,
    paddingHorizontal: UNIT / 2,
    borderRadius: UNIT / 2,
    backgroundColor: '$boxBackground',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionsReactionSelected: {
    borderColor: '$iconAccent',
  },
  reactionsReactionCount: {
    ...secondaryText,
    marginLeft: UNIT / 2,
    color: '$icon',
  },
  reactionAuthor: {
    marginLeft: UNIT,
  },
  reactionAuthorText: {
    color: '$text',
  },
  reactionTitle: {
    textTransform: 'capitalize'
  },

  commentEditContainer: {
    flex: 1,
    backgroundColor: '$background'
  },
  commentEditHeader: {
    ...elevation1
  },
  commentEditContent: {
    paddingHorizontal: UNIT * 2,
    paddingBottom: UNIT * 2,
    marginBottom: headerMinHeight
  },
  commentEditInput: {
    padding: 0
  },
  link: {
    color: '$link'
  },
  disabled: {
    color: '$disabled'
  },

});
