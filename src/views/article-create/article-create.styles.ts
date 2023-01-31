import EStyleSheet from 'react-native-extended-stylesheet';
import {elevation1} from 'components/common-styles/shadow';
import {UNIT} from 'components/variables';
import {mainText} from 'components/common-styles/typography';
export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  header: {...elevation1, paddingHorizontal: UNIT * 2},
  content: {
    flex: 1,
    paddingHorizontal: UNIT * 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: UNIT * 2.5,
    marginBottom: UNIT * 1.5,
  },
  attachments: {
    marginTop: UNIT * 3,
    paddingHorizontal: UNIT * 2,
  },
  projectPanel: {
    alignItems: 'center',
    height: 'auto',
    minHeight: UNIT * 7,
    marginLeft: UNIT,
    padding: UNIT,
  },
  projectContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  projectSelector: {
    minHeight: UNIT * 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectSelectorText: {...mainText, marginRight: UNIT / 2, color: '$link'},
  discard: {
    marginTop: UNIT * 2,
    marginLeft: UNIT * 2,
  },
  discardButton: {
    marginRight: UNIT * 2,
    marginBottom: UNIT * 2,
    padding: UNIT * 2,
    borderColor: '$separator',
    borderRadius: UNIT,
    borderWidth: 1,
  },
  discardButtonText: {...mainText, color: '$link', textAlign: 'center'},
  discardButtonTextDisabled: {
    color: '$disabled',
  },
});
