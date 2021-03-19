import {UNIT} from '../variables/variables';
import {formStyles, containerPadding} from './form';

export const loginStylesForm = {
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: containerPadding,
    paddingLeft: containerPadding,
    paddingRight: containerPadding,
  },
  backIconButtonContainer: {
    position: 'absolute',
    top: UNIT * 2,
    left: UNIT,
    width: UNIT * 6,
    height: UNIT * 4,
  },
  backIconButton: {
    flexGrow: 0,
    width: UNIT * 6,
    height: UNIT * 4,
  },
  title: {
    marginTop: UNIT * 2,
    ...formStyles.title,
  },
  formContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: UNIT * 2,
  },
  formContentText: {
    alignItems: 'center',
  },
  hintText: {
    marginTop: UNIT * 2,
    ...formStyles.hintText,
  },
  progressIndicator: {
    position: 'absolute',
    right: UNIT * 2,
    top: 12,
  },
  logoImage: {
    height: UNIT * 10,
    resizeMode: 'contain',
  },
  supportLinkContent: {
    marginTop: UNIT * 2,
    marginBottom: UNIT * 2,
    alignItems: 'center',
  },
};
