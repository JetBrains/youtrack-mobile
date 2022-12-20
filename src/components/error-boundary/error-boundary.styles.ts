import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {HEADER_FONT_SIZE} from '../common-styles/typography';
const alignCenter = {
  justifyContent: 'center',
  alignItems: 'center',
};
const extendedReportModalText = {
  letterSpacing: 0.08,
  fontSize: 16,
  lineHeight: 26,
};
export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: UNIT * 2,
    backgroundColor: '$background',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flexGrow: 3,
    ...alignCenter,
  },
  sendReport: {...alignCenter, flexGrow: 1},
  title: {
    color: '$text',
    fontSize: 18,
    fontWeight: '500',
    marginTop: UNIT * 2,
  },
  button: {
    margin: UNIT / 2,
    padding: UNIT * 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    color: '$link',
  },
  buttonSendReport: {
    alignSelf: 'stretch',
    marginBottom: UNIT * 2,
    backgroundColor: '$link',
  },
  buttonSendReportText: {
    color: '$textButton',
  },
  sendReportText: {
    marginRight: UNIT * 1.5,
    marginLeft: UNIT * 1.5,
    color: '$icon',
  },
  extendedReportModalTitle: {
    ...extendedReportModalText,
    fontWeight: '500',
    marginBottom: UNIT / 2,
    color: '$text',
  },
  extendedReportModalText: extendedReportModalText,
  extendedReportModalTextInfo: {
    marginTop: UNIT,
    marginBottom: UNIT * 2,
    color: '$text',
  },
  extendedReportModalTextLink: {
    color: '$link',
    marginBottom: UNIT * 2,
  },
  restartLink: {
    color: '$link',
    ...HEADER_FONT_SIZE,
    marginTop: UNIT * 5,
  },
});