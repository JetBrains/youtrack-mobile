import {UNIT} from '../variables/variables';
import {formStyles, containerPadding} from '../common-styles/form';

export const loginStylesForm = {
  scrollContainer: {
    flexGrow: 1
  },
  container: {
    ...formStyles.container
  },
  backIconButton: {
    flexGrow: 0,
    width: UNIT * 9,
    padding: UNIT * 2,
    marginLeft: -containerPadding
  },
  title: {
    marginTop: UNIT * 2,
    ...formStyles.title
  },
  formContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UNIT * 2
  },
  hintText: {
    marginTop: UNIT * 2,
    ...formStyles.hintText
  },
  progressIndicator: {
    position: 'absolute',
    right: UNIT * 2,
    top: 12
  },
  logoImage: {
    height: UNIT * 10,
    resizeMode: 'contain'
  },
  supportLinkContent: {
    marginTop: UNIT * 2,
    marginBottom: UNIT * 2,
    alignItems: 'center'
  }
};
