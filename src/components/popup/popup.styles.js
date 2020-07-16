import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_PINK,
} from '../variables/variables';
import {mask} from '../common-styles/app';

const extendedReportModalText = {
  letterSpacing: 0.08,
  fontSize: 16,
  lineHeight: 26,
};

const alignCenter = {
  justifyContent: 'center',
  alignItems: 'center'
};

export default StyleSheet.create({
  link: {
    marginTop: UNIT,
    marginBottom: UNIT,
    color: COLOR_PINK
  },
  modal: {
    ...alignCenter
  },
  container: {
    flex: 1,
    ...mask,
    ...alignCenter
  },
  content: {
    margin: UNIT * 5,
    padding: UNIT * 3,
    paddingBottom: UNIT,
    backgroundColor: COLOR_FONT_ON_BLACK,
    shadowOpacity: 0.6,
    borderRadius: 6,
    shadowOffset: {width: 0, height: 0},
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowRadius: UNIT * 2
  },
  title: {
    ...extendedReportModalText,
    fontWeight: '500',
    marginBottom: UNIT / 2
  },
  buttons: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: UNIT,
    marginBottom: UNIT,
    marginRight: -UNIT,
  },
  button: {
    marginLeft: UNIT,
    padding: UNIT,
    paddingRight: UNIT * 2,
    paddingLeft: UNIT * 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: COLOR_PINK
  }
});
