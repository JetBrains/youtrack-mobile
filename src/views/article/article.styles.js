import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {summaryTitle} from '../../components/common-styles/issue';
import {UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/typography';
import {elevation1} from '../../components/common-styles/shadow';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  articleDetails: {
    padding: UNIT * 2,
    paddingTop: UNIT * 3
  },
  articleActivities: {
    padding: UNIT * 2,
    paddingLeft: UNIT
  },
  description: {
    ...mainText
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
    padding: UNIT * 2,
    paddingLeft: UNIT * 7
  },
  subArticleItemText: {
    ...mainText
  },
});
