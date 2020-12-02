import EStyleSheet from 'react-native-extended-stylesheet';

import {HEADER_FONT_SIZE, headerTitle, mainText} from '../../components/common-styles/typography';
import {UNIT} from '../../components/variables/variables';
import {elevation1} from '../../components/common-styles/shadow';

const headerHeight = UNIT * 7;

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  articlesContainer: {
    flexGrow: 1,
    paddingBottom: headerHeight + UNIT
  },
  headerTitle: {
    height: headerHeight,
    paddingLeft: UNIT * 2,
    alignItems: 'flex-start',
    justifyContent: 'center',

    marginBottom: UNIT,
    ...elevation1,
    backgroundColor: '$background',
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
  item: {
    padding: UNIT * 2,
    paddingHorizontal: UNIT * 2,
    backgroundColor: '$background',
  },
  itemContent: {
    paddingRight: 0,
    backgroundColor: 'pink',
  },
  itemButton: {
    alignItems: 'center',
    width: UNIT * 6,
    marginRight: -UNIT * 2,
    paddingVertical: UNIT
  },
  itemProject: {
    backgroundColor: '$boxBackground'
  },
  articleTitle: {
    ...mainText,
    color: '$text'
  },
  projectTitle: {
    fontSize: HEADER_FONT_SIZE,
    color: '$text'
  },
  iconHasChildren: {
    color: '$mask',
  },
  iconNavigate: {
    color: '$icon',
  }
});
