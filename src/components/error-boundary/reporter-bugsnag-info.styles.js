import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_PINK,
  COLOR_ICON_MEDIUM_GREY
} from '../../components/variables/variables';

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
  extendedReportModal: {
    ...alignCenter
  },
  extendedReportModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    ...alignCenter
  },
  extendedReportModalContent: {
    margin: UNIT * 5,
    padding: UNIT * 3,
    paddingBottom: UNIT,
    backgroundColor: COLOR_FONT_ON_BLACK,
    borderRadius: 6,
    shadowOffset: {width: 0, height: 0},
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowOpacity: 0.6,
    shadowRadius: 16
  },
  extendedReportModalButtons: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: UNIT,
    marginRight: -UNIT,
  },
  extendedReportButton: {
    marginLeft: UNIT,
    padding: UNIT,
    paddingRight: UNIT * 2,
    paddingLeft: UNIT * 2,
    alignItems: 'center',
  },
  extendedReportButtonText: {
    fontSize: 16,
    color: COLOR_PINK
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
  }
});
