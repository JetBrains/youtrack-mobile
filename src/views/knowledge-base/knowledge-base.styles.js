import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../../components/common-styles/shadow';
import {headerTitle, mainText} from '../../components/common-styles/typography';
import {UNIT} from '../../components/variables/variables';
import {Platform} from 'react-native';

const headerHeight = UNIT * 7;

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  content: {
    flexGrow: 1,
    paddingBottom: headerHeight + UNIT
  },

  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: headerHeight,
    marginBottom: UNIT / 4,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 4,
    backgroundColor: '$background'
  },
  headerTitleShadow: elevation1,
  headerTitleButton: {
    marginLeft: -UNIT * 2,
    marginRight: UNIT * 1.5,
  },
  headerTitleText: {
    ...headerTitle,
    color: '$text'
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  separator: {
    marginLeft: UNIT * 3.5
  },
  item: {
    padding: UNIT,
    paddingLeft: UNIT * 1.5,
    backgroundColor: '$background'
  },
  itemArticle: {
    paddingLeft: 0,
  },
  itemButton: {
    alignItems: 'center',
    width: UNIT * 7,
    marginRight: -UNIT,
    marginLeft: UNIT * 2,
    paddingVertical: UNIT,
    borderLeftWidth: 1,
    borderColor: '$boxBackground'
  },
  itemProject: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: UNIT * 2,
  },

  articleTitle: {
    ...mainText,
    marginLeft: UNIT * 4,
    color: '$text'
  },
  projectTitle: {
    marginLeft: UNIT,
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
  }
});
