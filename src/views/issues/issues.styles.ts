import EStyleSheet from 'react-native-extended-stylesheet';
import {Platform, StyleSheet} from 'react-native';

import {COLOR_FIELD_SIZE} from 'components/color-field/color-field';
import {
  elevation1,
  headerTitle,
  MAIN_FONT_SIZE,
  mainText,
  monospace,
  SECONDARY_FONT_SIZE,
  secondaryText,
  UNIT,
} from 'components/common-styles';
import {headerTitlePresentation} from 'components/header/header.styles';
import {issueCard, issueIdResolved} from 'components/common-styles/issue';
import {separator} from 'components/common-styles/list';
import {splitViewStyles} from 'components/common-styles/split-view';

const rowLine = {
  flexDirection: 'row',
  alignItems: 'center',
};

const searchContextHeight = UNIT * 7;

export const DUAL_AVATAR_SIZE = 20;


export default EStyleSheet.create({
  issueIdResolved,
  listContainer: {
    flex: 1,
    backgroundColor: '$background',
  },
  ...splitViewStyles,
  list: {
    minHeight: '100%',
    paddingBottom: UNIT * 4,
  },
  listActions: {
    ...rowLine,
    justifyContent: 'space-between',
    position: 'absolute',
    top: UNIT,
    right: 15,
    height: UNIT * 5,
    maxWidth: UNIT * 12,
  },
  listActionsItem: {
    height: UNIT * 4,
    width: UNIT * 4,
    marginLeft: UNIT,
    paddingRight: 2.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT * 2,
  },
  tryAgainText: {
    fontSize: MAIN_FONT_SIZE + 2,
    color: '$link',
  },
  headerText: {
    color: '$text',
    fontSize: MAIN_FONT_SIZE + 1,
  },
  row: {
    flexDirection: 'column',
  },
  priorityPlaceholder: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE,
  },
  priorityWrapper: {
    position: 'relative',
    marginRight: UNIT,
    ...monospace,
    minWidth: COLOR_FIELD_SIZE,
    ...Platform.select({
      android: {
        marginTop: UNIT / 4,
      },
    }),
  },
  priorityWrapperCompact: {
    minWidth: 4,
    paddingHorizontal: 0,
  },
  rowLine,
  issueRow: {
    paddingHorizontal: UNIT * 2,
    paddingVertical: UNIT * 1.5,
  },
  separator: {...separator, borderBottomWidth: 0.75, borderColor: '$separator'},
  secondaryText: {...secondaryText, color: '$textSecondary'},
  mainText: {...mainText, color: '$text'},
  readableId: {
    ...issueCard.issueId,
    color: '$textSecondary',
    marginTop: UNIT / 4,
    marginRight: UNIT,
  },
  readableIdCompact: {
    marginLeft: UNIT / 2,
    fontSize: SECONDARY_FONT_SIZE - 1,
  },
  reporter: {
    ...rowLine,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  reporterCompact: {
    flexGrow: 0,
  },
  summary: {
    ...issueCard.issueSummary,
    marginTop: UNIT,
    color: '$text',
  },
  summaryCompact: {
    marginTop: 0,
  },
  description: {
    marginTop: UNIT / 2,
  },
  subtext: {
    paddingTop: 6,
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
  },
  tags: {
    marginTop: UNIT,
  },
  userSearchQueryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UNIT / 2,
    padding: UNIT / 2,
    paddingRight: UNIT,
    paddingLeft: 0,
  },
  searchContext: {
    height: searchContextHeight,
    backgroundColor: '$background',
  },
  searchContextPinned: {...elevation1},
  searchContextButton: {
    ...rowLine,
    alignSelf: 'flex-start',
    minWidth: 130,
    marginTop: UNIT,
    marginLeft: UNIT * 2,
    paddingVertical: UNIT,
    backgroundColor: '$background',
  },
  contextButtonText: {
    ...headerTitle,
    color: '$text',
    letterSpacing: 0.25,
  },
  contextButtonIcon: {
    marginTop: 1,
    marginLeft: 1,
  },
  searchPanel: {
    paddingHorizontal: UNIT * 2,
  },
  searchPanelFilters: {
    ...rowLine,
    flexGrow: 1,
    alignItems: 'center',
    minHeight: UNIT * 5,
    marginTop: UNIT,
    paddingHorizontal: UNIT * 2,
  },
  searchQueryPreview: {
    marginHorizontal: 0,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: UNIT * 1.5,
    paddingLeft: UNIT * 2,
    marginBottom: UNIT,
  },
  toolbarAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: UNIT * 2,
    height: 17,
  },
  toolbarActionSortBy: {
    marginRight: -1,
  },
  toolbarText: {...secondaryText, color: '$textSecondary'},
  toolbarIcon: {
    paddingLeft: UNIT / 2,
    color: '$icon',
  },
  toolbarItemDisabled: {
    opacity: 0.4,
  },
  toolbarSortByText: {
    textAlign: 'right',
  },
  noIssuesFoundIcon: {
    marginLeft: UNIT * 2,
    marginBottom: -UNIT * 2,
  },
  bookmarkIcon: {
    marginRight: 3,
  },
  resolved: {
    color: '$resolved',
  },
  headerTitle: {...headerTitlePresentation, marginLeft: 0},
  link: {
    color: '$link',
  },
  sortBy: {
    flex: 1,
    backgroundColor: '$background',
    paddingRight: UNIT,
  },
  sortByList: {
    flex: 1,
    paddingTop: UNIT,
    marginLeft: UNIT / 2,
  },
  sortByListAddIcon: {
    paddingRight: UNIT,
  },
  sortByListItem: {
    ...rowLine,
    justifyContent: 'space-between',
    paddingVertical: UNIT * 1.5,
    paddingLeft: 11,
    paddingRight: 5,
  },
  sortByListItemActive: {
    backgroundColor: '$boxBackground',
  },
  sortByListWarning: {
    color: '$textSecondary',
    margin: UNIT * 2.5,
    marginBottom: UNIT,
  },
  sortByListItemText: {
    color: '$text',
    ...mainText,
    textTransform: 'capitalize',
    paddingLeft: UNIT,
  },
  sortIcon: {
    color: '$iconAccent',
  },
  sortIconButton: {
    width: UNIT * 4.5,
    height: UNIT * 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: UNIT * 1.5,
  },
  sortIconBack: {
    paddingLeft: UNIT,
  },
  loadingIndicator: StyleSheet.absoluteFillObject,
  settingsModal: {
    paddingTop: UNIT / 4,
    paddingHorizontal: 0,
  },
  settingsItem: {
    marginTop: UNIT * 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UNIT,
    paddingHorizontal: UNIT * 2,
    paddingVertical: UNIT * 1.1,
  },
  settingsItemTitle: {
    paddingHorizontal: UNIT * 2,
    marginBottom: UNIT * 1.5,
    ...secondaryText,
    fontSize: SECONDARY_FONT_SIZE - 2,
    textTransform: 'uppercase',
    color: '$textSecondary',
    letterSpacing: 1,
  },
  settingsItemText: {
    ...mainText,
    paddingRight: UNIT * 2,
    color: '$text',
    textTransform: 'capitalize',
  },
  settingsItemIcon: {
    color: '$icon',
  },
  settingsSeparator: {
    borderColor: '$separator',
    ...separator,
    marginLeft: -UNIT * 2,
  },
  filters: rowLine,
  filtersButton: {
    ...rowLine,
    minWidth: UNIT * 8,
    maxWidth: UNIT * 24,
    height: UNIT * 4,
    paddingHorizontal: UNIT * 2,
    marginRight: UNIT,
    borderRadius: UNIT,
    backgroundColor: '$boxBackground',
  },
  filtersButtonHighlighted: {
    backgroundColor: '$linkLight',
  },
  filtersButtonAction: {
    borderColor: '$linkLight',
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  filtersButtonText: {
    ...secondaryText,
    marginRight: UNIT / 2,
    color: '$text',
    textTransform: 'capitalize',
  },
  filtersIcon: {
    color: '$icon',
  },
  filtersButtonReset: {
    padding: UNIT / 2,
    paddingRight: UNIT,
    marginLeft: UNIT,
    marginRight: -UNIT,
  },
  draft: {
    ...this.issueRow,
    padding: UNIT * 2,
  },
  draftText: {
    ...mainText,
    color: '$text',
  },
  draftTextId: {
    ...mainText,
    color: '$textSecondary',
    paddingRight: UNIT * 2,
    marginRight: UNIT * 2,
    textTransform: 'uppercase',
  },
  helpDeskIconWrapper: {
    position: 'absolute',
    zIndex: 1,
    bottom: -3,
    marginLeft: COLOR_FIELD_SIZE - UNIT,
    backgroundColor: '$background',
    borderRadius: UNIT * 2,
    color: '$iconAccent',
  },
  helpDeskIcon: {
    marginRight: UNIT,
    color: '$iconAccent',
  },
  dualAvatarWrapper: {
    position: 'relative',
    width: DUAL_AVATAR_SIZE,
    height: DUAL_AVATAR_SIZE,
  },
  leftAvatarWrapper: {
    position: 'absolute',
    bottom: 0,
    width: DUAL_AVATAR_SIZE / 2,
    height: DUAL_AVATAR_SIZE,
    overflow: 'hidden',
  },
  rightAvatarWrapper: {
    position: 'absolute',
    zIndex: 1,
    right: -1,
    bottom: 0,
    width: DUAL_AVATAR_SIZE / 2,
    height: DUAL_AVATAR_SIZE,
    overflow: 'hidden',
  },
  rightAvatar: {
    left: -DUAL_AVATAR_SIZE / 2,
  },
  slaFields: {
    flexDirection: 'row',
    marginTop: UNIT / 2,
  },
  slaFieldsCompact: {
    marginTop: 0,
  },
  slaFieldsItem: {
    marginRight: UNIT / 2,
  },
  slaField: {
    color: '$textButton',
    backgroundColor: '$greenColor',
  },
  slaFieldOverdue: {
    backgroundColor: '$redColor',
  },
  slaFieldPaused: {
    backgroundColor: '$greyColor',
    color: '$text',
  },
  slaFieldPausedIcon: {
    color: '$textSecondary',
  },
  slaFieldTag: {
    marginTop: -UNIT / 2,
    marginRight: UNIT / 1.5,
    fontSize: SECONDARY_FONT_SIZE - 3,
  },
  slaFieldPausedCompact: {
    marginTop: -UNIT / 2,
    marginRight: UNIT / 2,
    marginLeft: -UNIT / 2,
  },
});
