import EStyleSheet from 'react-native-extended-stylesheet';

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
    fontStyle: 'italic',
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
    lineHeight: secondaryText.fontSize + 2,
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
    textTransform: 'capitalize',
  },

  commentVisibility: {
    paddingVertical: UNIT / 2,
    marginTop: UNIT,
    marginBottom: UNIT / 2,
  },
  commentAttachments: {
    marginBottom: UNIT * 2,
  },
  link: {
    color: '$link',
  },
  disabled: {
    color: '$disabled',
  },
  iconAccent: {
    color: '$iconAccent',
  },
  text: {
    color: '$text',
  },

});
