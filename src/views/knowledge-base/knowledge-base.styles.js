import EStyleSheet from 'react-native-extended-stylesheet';

import {clearIcon, inputWrapper, searchInput} from '../../components/common-styles/search';
import {elevation1} from '../../components/common-styles/shadow';
import {headerTitle, mainText, secondaryText} from '../../components/common-styles/typography';
import {Platform} from 'react-native';
import {SELECT_ITEM_HEIGHT} from '../../components/select/select.styles';
import {UNIT} from '../../components/variables/variables';

const wrapper = {
  marginHorizontal: UNIT * 2,
  marginVertical: UNIT
};

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  content: {
    flex: 1
  },

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
    flex: 1
  },
  headerTitleText: {
    ...headerTitle,
    color: '$text'
  },
  headerButton: {
    flexGrow: 0
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
      }
    })
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  separator: {
    marginLeft: UNIT * 3
  },
  item: {
    flexDirection: 'row',
    height: SELECT_ITEM_HEIGHT,
    backgroundColor: '$background'
  },
  itemChild: {
    marginTop: UNIT,
    marginLeft: -UNIT * 3
  },
  itemStar: {
    marginRight: UNIT * 0.75,
    paddingHorizontal: UNIT * 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemArticleIcon: {
    alignItems: 'flex-end',
    paddingHorizontal: UNIT / 1.5
  },
  itemButtonContainer: {
    marginLeft: UNIT * 2,
    paddingRight: UNIT * 1.5
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: UNIT * 5,
    height: UNIT * 4,
    paddingHorizontal: UNIT / 1.5,
    borderRadius: UNIT,
    backgroundColor: '$boxBackground'
  },
  itemButtonText: {
    ...mainText,
    paddingRight: UNIT,
    color: '$icon'
  },
  itemButtonIcon: {
    marginTop: -1
  },
  itemProject: {
    flexGrow: 1,
    flexDirection: 'row',
    paddingLeft: UNIT * 2,
    alignItems: 'center'
  },
  itemArticle: {
    paddingLeft: UNIT * 5
  },
  itemDraft: {
    marginRight: UNIT,
    paddingLeft: UNIT * 2
  },
  itemDraftDisabled: {
    opacity: 0.5
  },
  itemProjectIcon: {
    width: UNIT * 3,
    marginLeft: -UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    color: '$text'
  },
  itemProjectIconCollapsed: {
    marginTop: -UNIT / 4
  },

  articleTitleText: {
    ...mainText,
    maxWidth: '87%',
    color: '$text'
  },
  projectTitleText: {
    paddingLeft: UNIT,
    ...headerTitle,
    color: '$text',
    ...Platform.select({
      ios: {
        fontWeight: '600'
      },
      android: {
        fontWeight: '400'
      }
    })
  },
  noArticlesIcon: {
    marginBottom: UNIT * 2
  },
  listFooter: {
    marginVertical: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooterText: {
    color: '$link'
  },

  searchPanelContainer: {
    ...wrapper,
    ...inputWrapper,
    marginBottom: 0
  },
  searchInput: searchInput,
  clearIcon: clearIcon,

  link: {
    color: '$link'
  },
  lockIcon: {
    color: '$iconAccent'
  },
  icon: {
    color: '$icon'
  },
  iconTrash: {
    color: '$iconAccent',
    padding: UNIT
  },
  actionBar: {
    flexDirection: 'row',
    ...wrapper,
    height: UNIT * 4,
    paddingRight: UNIT * 0.75,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBarButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionBarButtonText: {
    position: 'relative',
    top: 1,
    marginRight: UNIT,
    ...secondaryText,
    color: '$icon'
  },

  noDrafts: {
    flexGrow: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noDraftsButton: {
    marginTop: UNIT * 3
  },
  noDraftsButtonText: {
    ...mainText,
    color: '$link'
  },
});
