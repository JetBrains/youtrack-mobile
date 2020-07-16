import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_PINK,
  COLOR_BLACK,
  COLOR_ICON_MEDIUM_GREY
} from '../variables/variables';
import {link} from '../common-styles/button';

const alignCenter = {
  justifyContent: 'center',
  alignItems: 'center'
};

const extendedReportModalText = {
  letterSpacing: 0.08,
  fontSize: 16,
  lineHeight: 26,
};

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: UNIT * 2,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  header: {
    alignItems: 'flex-end'
  },
  message: {
    flexGrow: 3,
    ...alignCenter
  },
  sendReport: {
    ...alignCenter,
    flexGrow: 1
  },

  title: {
    color: COLOR_BLACK,
    fontSize: 18,
    fontWeight: '500',
    marginTop: UNIT * 2
  },
  button: {
    margin: UNIT/2,
    padding: UNIT * 2,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    color: COLOR_PINK
  },

  buttonSendReport: {
    alignSelf: 'stretch',
    marginBottom: UNIT * 2,
    backgroundColor: COLOR_PINK
  },
  buttonSendReportText: {
    color: COLOR_FONT_ON_BLACK
  },
  sendReportText: {
    marginRight: UNIT * 1.5,
    marginLeft: UNIT * 1.5,
    color: COLOR_ICON_MEDIUM_GREY
  },
  extendedReportModalTitle: {
    ...extendedReportModalText,
    fontWeight: '500',
    marginBottom: UNIT / 2
  },
  extendedReportModalText: extendedReportModalText,
  extendedReportModalTextInfo: {
    marginTop: UNIT,
    marginBottom: UNIT * 2,
    color: COLOR_ICON_MEDIUM_GREY
  },
  extendedReportModalTextLink: {
    ...link,
    marginBottom: UNIT * 2
  }
});
