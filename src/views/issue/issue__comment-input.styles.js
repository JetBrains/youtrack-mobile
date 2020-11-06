import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../components/variables/variables';
import {mainText, secondaryText} from '../../components/common-styles/typography';

const INPUT_BORDER_RADIUS = UNIT;
const MIN_INPUT_SIZE = UNIT * 4;

export default EStyleSheet.create({
  container: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    paddingLeft: UNIT * 3,
    paddingRight: UNIT * 3,
    backgroundColor: '$background',
    elevation: 5,
    shadowColor: '$text',
    shadowOpacity: 0.2,
    shadowRadius: 0.5,
    shadowOffset: {
      height: -0.5,
      width: 0
    }
  },

  suggestionsContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  suggestionsLoadingMessage: {
    flexGrow: 1,
    alignItems: 'center',
  },
  link: {
    color: '$link'
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT * 2,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    borderBottomWidth: 1,
    borderColor: '$boxBackground'
  },
  suggestionName: {
    flexGrow: 1,
    marginLeft: UNIT,
    color: '$text'
  },
  suggestionLogin: {
    color: '$textSecondary'
  },

  commentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -UNIT * 1.5,
    marginRight: -UNIT * 2,
  },
  commentHeaderContainerEdit: {
    justifyContent: 'space-between',
  },
  commentHeaderContainerCreate: {
    paddingTop: UNIT,
    paddingBottom: UNIT * 1.5,
    justifyContent: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: INPUT_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '$disabled',
  },
  commentInput: {
    flex: 1,
    minHeight: MIN_INPUT_SIZE,
    padding: 0,
    paddingLeft: UNIT,
    marginRight: UNIT,
    backgroundColor: '$background',
    ...mainText,
    color: '$text'
  },
  commentSendButton: {
    width: MIN_INPUT_SIZE,
    height: MIN_INPUT_SIZE,
    borderRadius: INPUT_BORDER_RADIUS - 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$link'
  },
  commentSendButtonDisabled: {
    backgroundColor: '$textSecondary',
  },
  commentSendButtonText: {
    fontSize: 16,
    color: '$link'
  },

  commentListContainer: {
    borderTopWidth: 1,
    borderColor: '$textSecondary',
    paddingTop: UNIT
  },

  visibilityChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  visibilityChangeButtonLockIcon: {
    marginRight: UNIT
  },
  visibilityChangeButtonText: {
    ...secondaryText,
    marginRight: UNIT,
    color: '$icon'
  }
});
