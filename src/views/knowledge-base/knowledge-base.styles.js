import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../../components/common-styles/shadow';
import {headerTitle, mainText} from '../../components/common-styles/typography';
import {UNIT} from '../../components/variables/variables';
import {Platform} from 'react-native';
import {SELECT_ITEM_HEIGHT} from '../../components/select/select.styles';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  content: {
    flex: 1
  },
  headerTitle: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: SELECT_ITEM_HEIGHT,
    paddingBottom: UNIT / 4,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 4,
    backgroundColor: '$background',
  },
  headerTitleShadow: elevation1,
  headerTitleButton: {
    marginLeft: -UNIT,
  },
  headerTitleText: {
    ...headerTitle,
    color: '$text'
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  separator: {
    marginLeft: UNIT * 3.5
  },
  item: {
    height: SELECT_ITEM_HEIGHT,
    paddingLeft: UNIT * 1.5,
    backgroundColor: '$background'
  },
  itemArticle: {
    justifyContent: 'space-between'
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
    paddingHorizontal: UNIT,
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
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemProjectIcon: {
    width: UNIT * 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemProjectIconCollapsed: {
    marginTop: -UNIT / 4
  },

  articleTitle: {
    ...mainText,
    marginLeft: UNIT * 2.5,
    maxWidth: '87%',
    color: '$text'
  },
  projectTitle: {
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
  }
});
