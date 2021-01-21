import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1, elevationBottom} from '../../components/common-styles/shadow';
import {headerMinHeight} from '../../components/header/header.styles';
import {MAIN_FONT_SIZE, mainText} from '../../components/common-styles/typography';
import {separator} from '../../components/common-styles/list';
import {summaryTitle} from '../../components/common-styles/issue';
import {UNIT} from '../../components/variables/variables';

const INPUT_BORDER_RADIUS = UNIT;
const MIN_INPUT_SIZE = UNIT * 4;
const detailsHorizontalPadding = UNIT * 2;

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  articleDetails: {
    padding: detailsHorizontalPadding,
    paddingTop: 0,
  },
  articleActivities: {
    padding: UNIT * 2,
    paddingLeft: UNIT
  },
  articleDetailsHeader: {
    marginTop: UNIT * 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    ...mainText,
    color: '$text'
  },
  summaryEdit: {
    ...Platform.select({
      ios: {
        marginTop: 3
      },
      android: {
        marginTop: 1
      }
    })
  },
  summaryText: {
    ...summaryTitle,
    color: '$text'
  },
  subArticles: {
    borderTopWidth: 0.4,
    borderBottomWidth: 0.4,
    marginVertical: UNIT,
    marginTop: UNIT * 2,
    marginRight: -UNIT * 2,
    paddingVertical: UNIT * 2,
    paddingRight: UNIT * 2,
    borderColor: '$textSecondary'
  },
  subArticlesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subArticlesTitle: {
    color: '$icon'
  },
  subArticlesIcon: {
    position: 'relative',
    top: -UNIT
  },
  subArticlesHeader: {
    ...elevation1
  },
  subArticleItem: {
    maxWidth: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT * 2,
    paddingLeft: UNIT * 7
  },
  subArticleItemIcon: {
    paddingHorizontal: UNIT / 1.5
  },
  subArticleItemText: {
    ...mainText,
    color: '$text'
  },

  commentContainer: {
    maxHeight: '100%',
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 2,
    ...elevationBottom
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentInputContainer: {
    flexDirection: 'row',
    flex: 1,
    padding: UNIT / 4,
    marginHorizontal: UNIT,
    borderRadius: INPUT_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '$disabled'
  },
  commentInput: {
    flex: 1,
    minHeight: MIN_INPUT_SIZE,
    padding: 0,
    paddingHorizontal: UNIT,
    backgroundColor: '$background',
    ...mainText,
    color: '$text'
  },
  commentSendButton: {
    width: MIN_INPUT_SIZE,
    height: MIN_INPUT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: INPUT_BORDER_RADIUS - 1,
    backgroundColor: '$link'
  },
  commentSendButtonDisabled: {
    backgroundColor: '$textSecondary',
  },
  commentSendButtonText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$link'
  },
  commentEditHeader: {
    ...elevation1
  },
  commentEditContainer: {
    paddingHorizontal: UNIT * 2,
    paddingBottom: UNIT * 2,
    marginBottom: headerMinHeight
  },
  commentEditInput: {
    padding: 0
  },

  breadCrumbs: {
    height: UNIT * 9,
    marginHorizontal: -detailsHorizontalPadding
  },
  breadCrumbsCompact: {
    height: UNIT * 6
  },
  breadCrumbsContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: detailsHorizontalPadding / 2
  },
  breadCrumbsButton: {
    paddingVertical: UNIT
  },
  breadCrumbsButtonText: {
    ...mainText,
    marginHorizontal: UNIT,
    color: '$link'
  },
  breadCrumbsButtonTextSeparator: {
    color: '$icon'
  },
  breadCrumbsSeparator: {
    ...separator,
    borderColor: '$separator'
  }
});
