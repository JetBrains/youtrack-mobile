import EStyleSheet from 'react-native-extended-stylesheet';

import {articleItemWithChildrenStyles} from 'components/articles/article-item-with-children.styles';
import {clearIcon, inputWrapper, searchInput} from 'components/common-styles/search';
import {elevation1} from 'components/common-styles/shadow';
import {headerTitle, mainText, secondaryText} from 'components/common-styles/typography';
import {Platform} from 'react-native';
import {SELECT_ITEM_HEIGHT} from 'components/select/select.styles';
import {splitViewStyles} from 'components/common-styles/split-view';
import {UNIT} from 'components/variables/variables';

const wrapper = {
  marginHorizontal: UNIT * 2,
  marginVertical: UNIT,
};

export const noProjectsIconSize = 240;

export default EStyleSheet.create({
  ...articleItemWithChildrenStyles,

  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  content: {
    flex: 1,
  },
  ...splitViewStyles,
  header: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: SELECT_ITEM_HEIGHT,
    paddingBottom: UNIT / 4,
    paddingHorizontal: UNIT * 2,
    backgroundColor: '$background',
  },
  headerShadow: elevation1,
  headerTitle: {
    flex: 1,
  },
  headerTitleText: {
    ...headerTitle,
    color: '$text',
  },
  headerButton: {
    flexGrow: 0,
  },
  headerLeftButton: {
    marginLeft: -UNIT,
    marginRight: UNIT,
  },
  headerRightButton: {
    marginLeft: UNIT,
    ...Platform.select({
      android: {
        marginRight: -UNIT / 2,
      },
    }),
  },

  separator: {
    marginLeft: UNIT * 3,
    backgroundColor: '$background',
  },
  itemChild: {
    marginTop: UNIT,
    marginLeft: -UNIT * 3,
    marginBottom: SELECT_ITEM_HEIGHT,
  },
  itemStar: {
    marginRight: UNIT * 0.75,
    paddingHorizontal: UNIT * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemArticleIcon: {
    alignItems: 'flex-end',
    paddingHorizontal: UNIT / 1.5,
  },
  itemProject: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: UNIT * 2,
    alignItems: 'center',
  },
  itemArticle: {
    paddingLeft: UNIT * 5,
  },
  itemNoArticle: {
    justifyContent: 'center',
    height: SELECT_ITEM_HEIGHT,
    backgroundColor: '$background',
  },
  itemNoArticleText: {
    color: '$icon',
  },
  itemDraft: {
    marginRight: UNIT,
    paddingLeft: UNIT * 2,
  },
  itemDraftDisabled: {
    opacity: 0.5,
  },
  itemProjectIcon: {
    width: UNIT * 3,
    marginLeft: -UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    color: '$text',
  },
  itemProjectIconCollapsed: {
    marginTop: -UNIT / 4,
  },

  projectTitleText: {
    paddingLeft: UNIT,
    ...headerTitle,
    fontSize: 19,
    lineHeight: 20,
    color: '$text',
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontWeight: '400',
      },
    }),
  },
  noArticlesIcon: {
    marginBottom: UNIT * 2,
  },
  listFooter: {
    marginVertical: UNIT * 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchPanelContainer: {
    ...wrapper,
    ...inputWrapper,
    marginBottom: 0,
  },
  searchInput: searchInput,
  clearIcon: clearIcon,

  link: {
    color: '$link',
  },
  actionBar: {
    ...wrapper,
    flexDirection: 'row',
    height: UNIT * 4,
    paddingLeft: UNIT / 4,
    paddingRight: UNIT * 0.75,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBarButtonText: {
    position: 'relative',
    top: 1,
    marginRight: UNIT,
    ...secondaryText,
    color: '$link',
  },

  noDrafts: {
    flexGrow: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDraftsButton: {
    marginTop: UNIT * 3,
  },
  noDraftsButtonText: {
    ...mainText,
    color: '$link',
  },
  noProjects: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: UNIT * 4,
  },
  noProjectsIcon: {
    marginTop: -noProjectsIconSize / 2,
    marginLeft: -UNIT * 4,
    marginBottom: UNIT * 2,
  },
  noProjectsMessage: {
    color: '$text',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
  },
  noProjectsButton: {
    marginTop: UNIT * 4,
  },
  noProjectsButtonText: {
    ...mainText,
    color: '$link',
  },
  noArticlesErrorIcon: {
    marginLeft: -UNIT * 4,
    marginBottom: -UNIT * 2,
  },

  manageFavoriteProjectsNote: {
    padding: UNIT * 2,
    textAlign: 'center',
    color: '$icon',
  },
});
