import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {elevation1, elevationBottom} from 'components/common-styles/shadow';
import {
  headerTitle,
  MAIN_FONT_SIZE,
  mainText,
} from 'components/common-styles/typography';
import {separator} from 'components/common-styles/list';
import {summaryTitle} from 'components/common-styles/issue';
import {UNIT} from 'components/variables/variables';
const INPUT_BORDER_RADIUS = UNIT;
const MIN_INPUT_SIZE = UNIT * 4;
const detailsHorizontalPadding = UNIT * 2;
export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  articleDetails: {
    padding: detailsHorizontalPadding,
    paddingTop: 0,
  },
  articleDetailsHeader: {
    marginTop: UNIT * 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {...mainText, color: '$text'},
  summaryEdit: {
    ...Platform.select({
      ios: {
        marginTop: 3,
      },
      android: {
        marginTop: 1,
      },
    }),
  },
  summaryText: {...summaryTitle, color: '$text'},
  subArticles: {
    marginVertical: UNIT,
    marginTop: UNIT * 2,
    marginRight: -UNIT * 2,
    paddingVertical: UNIT * 2,
    paddingRight: UNIT * 2,
    borderTopWidth: 0.75,
    borderBottomWidth: 0.74,
    borderColor: '$separator',
  },
  subArticlesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subArticlesTitle: {
    color: '$icon',
  },
  subArticlesNavigateIcon: {
    position: 'relative',
    top: -UNIT,
  },
  subArticlesHeader: {...elevation1},
  articlesHeaderText: {...headerTitle, color: '$text'},
  subArticleItem: {
    marginLeft: UNIT * 2,
  },
  subArticleItemText: {...mainText, color: '$text'},
  subArticlesCreate: {
    marginHorizontal: UNIT,
  },
  subArticlesCreateIcon: {
    position: 'absolute',
    top: -UNIT * 2.1,
    padding: UNIT,
    color: '$iconAccent',
  },
  commentContainer: {
    maxHeight: '100%',
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 2,
    ...elevationBottom,
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    flex: 1,
    padding: UNIT / 4,
    marginHorizontal: UNIT,
    borderRadius: INPUT_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '$disabled',
  },
  commentInput: {
    flex: 1,
    minHeight: MIN_INPUT_SIZE,
    padding: 0,
    paddingHorizontal: UNIT,
    backgroundColor: '$background',
    ...mainText,
    color: '$text',
  },
  commentSendButton: {
    width: MIN_INPUT_SIZE,
    height: MIN_INPUT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: INPUT_BORDER_RADIUS - 1,
    backgroundColor: '$link',
  },
  commentSendButtonDisabled: {
    backgroundColor: '$textSecondary',
  },
  commentSendButtonText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$link',
  },
  breadCrumbs: {
    height: UNIT * 7,
    marginHorizontal: -detailsHorizontalPadding,
  },
  breadCrumbsCompact: {
    marginLeft: 0,
  },
  breadCrumbsContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: detailsHorizontalPadding / 2,
  },
  breadCrumbsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadCrumbsItemLast: {
    marginLeft: UNIT,
  },
  breadCrumbsButton: {
    paddingVertical: UNIT,
  },
  breadCrumbsButtonText: {...mainText, marginHorizontal: UNIT, color: '$link'},
  breadCrumbsButtonTextDisabled: {
    color: '$text',
  },
  breadCrumbsButtonTextSeparator: {
    color: '$icon',
  },
  breadCrumbsSeparator: {...separator, borderColor: '$separator'},
  link: {
    color: '$link',
  },
});