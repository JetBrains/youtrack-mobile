import EStyleSheet from 'react-native-extended-stylesheet';
import {elevation1, elevationBottom, MAIN_FONT_SIZE} from 'components/common-styles';
import {mainText, secondaryText} from 'components/common-styles/typography';
import {UNIT} from 'components/variables';
import {Platform} from 'react-native';
import {separatorTopBorder} from '../common-styles/list';
const INPUT_BORDER_RADIUS = UNIT;
export const MIN_INPUT_SIZE = UNIT * 4;
export default EStyleSheet.create({
  container: {
    maxHeight: '100%',
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 3,
    ...elevationBottom,
    ...Platform.select({
      android: {
        borderTopWidth: 0.5,
        borderTopColor: '$separator',
      },
    }),
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
    color: '$link',
  },
  disabled: {
    color: '$disabled',
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT * 2,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    borderBottomWidth: 1,
    borderColor: '$boxBackground',
  },
  suggestionName: {
    flexGrow: 1,
    marginLeft: UNIT,
    color: '$text',
  },
  suggestionLogin: {
    color: '$textSecondary',
  },
  commentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -UNIT * 1.5,
    marginRight: -UNIT * 2,
  },
  commentHeaderContainerCreate: {
    paddingTop: UNIT,
    paddingBottom: UNIT * 1.5,
    justifyContent: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: UNIT / 2,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: UNIT / 4,
    borderRadius: INPUT_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '$disabled',
  },
  commentInput: {
    flex: 1,
    maxHeight: 106,
    padding: 0,
    backgroundColor: '$background',
    ...mainText,
    color: '$text',
  },
  commentInputPlaceholder: {
    color: '$icon',
  },
  mainText: mainText,
  commentSendButton: {
    width: MIN_INPUT_SIZE,
    height: MIN_INPUT_SIZE,
    borderRadius: INPUT_BORDER_RADIUS - 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$link',
  },
  commentSendButtonIcon: {
    color: '$textButton',
    backgroundColor: '$background',
  },
  commentSendButtonDisabled: {
    backgroundColor: '$textSecondary',
  },
  commentSendButtonText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$link',
  },
  commentListContainer: {
    borderTopWidth: 1,
    borderColor: '$textSecondary',
    paddingTop: UNIT,
  },
  visibilityChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityChangeButtonLockIcon: {
    marginRight: UNIT,
  },
  visibilityChangeButtonText: {
    ...secondaryText,
    marginRight: UNIT,
    color: '$textSecondary',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UNIT,
  },
  actionsContainerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UNIT / 2,
    paddingHorizontal: UNIT / 2,
    color: '$iconAccent',
  },
  actionsContainerButtonDisabled: {
    color: '$disabled',
  },
  actionsContainerButtonText: {
    marginLeft: UNIT,
    ...mainText,
    fontWeight: '500',
  },
  floatContextButton: {
    margin: UNIT,
  },
  floatContextButtonText: {
    paddingLeft: UNIT * 1.5,
    color: '$text',
  },
  attachmentsContainer: {
    paddingLeft: 0,
    marginLeft: -UNIT,
    marginVertical: UNIT,
  },
  commentEditContainer: {
    flex: 1,
  },
  commentEditHeader: {...elevation1},
  commentEditContentTopOffset: {
    marginTop: UNIT * 9,
  },
  commentEditContent: {
    padding: UNIT * 2,
    paddingTop: UNIT,
  },
  commentEditInput: {
    padding: 0,
    ...separatorTopBorder,
    borderColor: '$separator',
  },
  commentEditVisibility: {
    marginTop: UNIT * 2.5,
    marginBottom: UNIT,
  },
  commentEditAttachments: {
    marginTop: UNIT * 2,
    marginBottom: UNIT,
  },
  commentEditAttachmentsAttachButton: {
    marginTop: UNIT * 2,
    borderBottomWidth: 0.5,
    borderColor: '$separator',
  },
  mentions: {
    marginLeft: UNIT * 2,
  },
  mentionsEdit: {
    marginHorizontal: UNIT * 2,
    marginBottom: -UNIT,
    maxHeight: '50%',
    borderColor: '$disabled',
    borderWidth: 0.5,
    borderBottomWidth: 0,
  },
});
