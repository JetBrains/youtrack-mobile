import React from 'react';
import {FlatList, RefreshControl, Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreatorsExt} from 'util/redux-ext';
import {connect} from 'react-redux';
import {connectActionSheet} from '@expo/react-native-action-sheet';

import createIssueActions, {dispatchActions} from './issue-actions';
import AttachFileDialog from 'components/attach-file/attach-file-dialog';
import ColorField from 'components/color-field/color-field';
import CommandDialog, {CommandDialogModal} from 'components/command-dialog/command-dialog';
import ErrorMessage from 'components/error-message/error-message';
import Header from 'components/header/header';
import IssueActivity from './activity/issue__activity';
import IssueDetails from './issue__details';
import IssueDetailsModal from './modal/issue.modal__details';
import IssueTabbed from 'components/issue-tabbed/issue-tabbed';
import IssueVotes from 'components/issue-actions/issue-votes';
import LinkedIssuesAddLink from 'components/linked-issues/linked-issues-add-link';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Star from 'components/star/star';
import usage from 'components/usage/usage';
import {addListenerGoOnline} from 'components/network/network-events';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {DEFAULT_ISSUE_STATE_FIELD_NAME} from './issue-base-actions-creater';
import {DEFAULT_THEME} from 'components/theme/theme';
import {getApi} from 'components/api/api__instance';
import {getReadableID} from 'components/issue-formatter/issue-formatter';
import {HIT_SLOP} from 'components/common-styles';
import {
  IconBack,
  IconCheck,
  IconClose,
  IconMoreOptions,
} from 'components/icon/icon';
import {isHelpdeskProject} from 'components/helpdesk';
import {isSplitView} from 'components/responsive/responsive-helper';
import {IssueContext} from './issue-context';
import {Select, SelectModal} from 'components/select/select';
import {Skeleton} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issue.styles';

import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {AnyIssue, IssueFull, IssueOnListExtended, IssueSprint, TabRoute} from 'types/Issue';
import type {Attachment, IssueLink, Tag} from 'types/CustomFields';
import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
import type {EventSubscription} from 'react-native';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {RequestHeaders} from 'types/Auth';
import type {RootState} from 'reducers/app-reducer';
import type {ScrollData} from 'types/Markdown';
import type {IssueState} from './issue-base-reducer';
import type {Theme, UITheme} from 'types/Theme';
import type {User, UserCC} from 'types/User';

type AdditionalProps = {
  issuePermissions: IssuePermissions;
  issuePlaceholder: IssueOnListExtended;
  uploadIssueAttach: (files: NormalizedAttachment[]) => void;
  loadAttachments: () => void;
  hideAddAttachDialog: () => void;
  createAttachActions: () => void;
  removeAttachment: (attach: Attachment) => void;
  isTagsSelectVisible: boolean;
  onCommandApply: () => void;
  commentId?: string;
  user: User;
  userCC: Array<UserCC>;
  issueSprints: IssueSprint[]
};

export type IssueProps = IssueState &
  typeof dispatchActions &
  AttachmentActions &
  AdditionalProps;


export class Issue<T extends IssueProps> extends IssueTabbed<IssueProps & T> {
  imageHeaders: RequestHeaders = getApi().auth.getAuthorizationHeaders();
  backendUrl: string = getApi().config.backendUrl;
  renderRefreshControl: (
    ...args: any[]
  ) => any = this._renderRefreshControl.bind(this);
  goOnlineSubscription: EventSubscription | undefined;
  uiTheme: UITheme = DEFAULT_THEME;

  constructor(props: IssueProps) {
    super(props);
    this.onAddIssueLink = this.onAddIssueLink.bind(this);
    this.toggleModalChildren = this.toggleModalChildren.bind(this);
  }

  async init() {
    usage.trackScreenView(ANALYTICS_ISSUE_PAGE);
    await this.props.unloadIssueIfExist();
    await this.props.setIssueId(this.props.issueId || this.props?.issuePlaceholder?.id);
    await this.loadIssue(this.props?.issuePlaceholder);
    if (this.props.navigateToActivity) {
      this.switchToActivityTab();
    }
  }

  async componentDidMount() {
    super.componentDidMount();
    await this.init();
    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.loadIssue(this.props?.issuePlaceholder);
    });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.goOnlineSubscription?.remove?.();
  }

  async UNSAFE_componentWillUpdate(nextProps: IssueProps) {
    if (nextProps.issueId !== this.props.issueId && this.props.issuePlaceholder?.idReadable !== nextProps.issueId) {
      this.switchToDetailsTab();
      this.props.resetActivityPage();
      await this.init();
    }
  }

  componentDidUpdate(prevProps: IssueProps): void {
    if (
      prevProps.navigateToActivity !== this.props.navigateToActivity ||
      ((this.props.commentId || prevProps.commentId) &&
        this.props.commentId !== prevProps.commentId)
    ) {
      if (this.props.navigateToActivity || this.props.commentId) {
        this.switchToActivityTab();
      } else {
        this.switchToDetailsTab();
      }
    }

    if (
      this.props.editMode === true &&
      !prevProps.editMode &&
      this.isActivityTabEnabled()
    ) {
      this.switchToDetailsTab();
    }
  }

  getRouteBadge(route: TabRoute) {
    return super.getRouteBadge(route.title === this.tabRoutes[1].title, this.props?.commentsCounter);
  }

  isReporter(): boolean {
    return this.props.issuePermissions.helpdesk.isReporter(this.props.issue);
  }

  isAgent(): boolean {
    return this.props.issuePermissions.helpdesk.isAgent(this.props.issue);
  }

  loadIssueSprints() {
    this.props.loadIssueSprints(this.props.issueId);
  }

  async loadIssue(issuePlaceholder?: Partial<IssueFull> | null) {
    const issueId: string = this.props.issueId || this.props?.issuePlaceholder?.id || this.props.issue?.id;
    await this.props.loadIssue(issuePlaceholder);
    if (isHelpdeskProject(this.props.issue)) {
      this.props.loadUsersCC(issueId);
    }
    this.loadIssueSprints();
  }

  createIssueDetails: (
    uiTheme: UITheme,
    scrollData: ScrollData,
  ) => React.ReactElement<React.ComponentProps<any>, any> = (
    uiTheme: UITheme,
    scrollData: ScrollData,
  ) => {
    const {isSplitView} = this.state;
    const {
      loadIssue,
      openNestedIssueView,
      attachingImage,
      refreshIssue,
      issuePermissions,
      updateIssueFieldValue,
      updateProject,
      isSavingEditedIssue,
      summaryCopy,
      descriptionCopy,
      openIssueListWithSearch,
      setIssueSummaryCopy,
      setIssueDescriptionCopy,
      issue,
      issuePlaceholder,
      issueLoaded,
      editMode,
      toggleVote,
      removeAttachment,
      updateIssueVisibility,
      toggleVisibleAddAttachDialog,
      onTagRemove,
      onCheckboxUpdate,
      onShowCopyTextContextActions,
      getIssueLinksTitle,
      setCustomFieldValue,

    } = this.props;
    const Component: any = isSplitView ? IssueDetailsModal : IssueDetails;
    return (
      <Component
        isReporter={this.isReporter()}
        isAgent={this.isAgent()}
        canEditVisibility={!this.isAgent() && this.canEdit()}
        loadIssue={loadIssue}
        openNestedIssueView={openNestedIssueView}
        attachingImage={attachingImage}
        refreshIssue={refreshIssue}
        issuePermissions={issuePermissions}
        updateIssueFieldValue={updateIssueFieldValue}
        updateProject={updateProject}
        onUpdateSprints={() => this.loadIssueSprints()}
        issue={issue}
        issuePlaceholder={issuePlaceholder}
        issueLoaded={issueLoaded}
        editMode={editMode}
        openIssueListWithSearch={openIssueListWithSearch}
        isSavingEditedIssue={isSavingEditedIssue}
        summaryCopy={summaryCopy}
        descriptionCopy={descriptionCopy}
        setIssueSummaryCopy={setIssueSummaryCopy}
        setIssueDescriptionCopy={setIssueDescriptionCopy}
        analyticCategory={ANALYTICS_ISSUE_PAGE}
        renderRefreshControl={() =>
          this.renderRefreshControl(() => this.loadIssue(), uiTheme)
        }
        onVoteToggle={toggleVote}
        onSwitchToActivity={this.switchToActivityTab}
        onRemoveAttachment={removeAttachment}
        onVisibilityChange={updateIssueVisibility}
        onAttach={toggleVisibleAddAttachDialog}
        onTagRemove={onTagRemove}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          description: string,
        ) => onCheckboxUpdate(checked, position, description)}
        onLongPress={(text: string, title?: string) => {
          onShowCopyTextContextActions(this.props.showActionSheetWithOptions, text, title);
        }}
        getIssueLinksTitle={getIssueLinksTitle}
        issuesGetter={this.props.loadIssuesXShort}
        linksGetter={this.props.loadLinkedIssues}
        onUnlink={this.props.onUnlinkIssue}
        onLinkIssue={this.props.onLinkIssue}
        setCustomFieldValue={setCustomFieldValue}
        isSplitView={isSplitView}
        scrollData={scrollData}
      />
    );
  };
  renderDetails = (uiTheme: UITheme) => {
    const scrollData: ScrollData = {
      loadMore: () => null,
    };
    return (
      <FlatList
        data={[0]}
        removeClippedSubviews={false}
        refreshControl={this.renderRefreshControl(
          () => this.loadIssue(),
          uiTheme,
        )}
        keyExtractor={() => 'issue-details'}
        renderItem={() => this.createIssueDetails(uiTheme, scrollData)}
        onEndReached={() => scrollData.loadMore && scrollData.loadMore()}
        onEndReachedThreshold={5}
      />
    );
  };

  getActivityStateFieldName(): string {
    return DEFAULT_ISSUE_STATE_FIELD_NAME;
  }

  renderActivity = (uiTheme: UITheme) => {
    const {
      issue,
      user,
      issuePermissions,
      selectProps,
      updateUserAppearanceProfile,
      openNestedIssueView,
      issuePlaceholder,
      navigateToActivity,
      commentId,
    } = this.props;
    return (
      <IssueActivity
        stateFieldName={this.getActivityStateFieldName()}
        issue={issue}
        issuePlaceholder={issuePlaceholder}
        user={user}
        openNestedIssueView={openNestedIssueView}
        issuePermissions={issuePermissions}
        selectProps={selectProps}
        updateUserAppearanceProfile={updateUserAppearanceProfile}
        renderRefreshControl={(loadActivities: () => any) =>
          this.renderRefreshControl(loadActivities, uiTheme)
        }
        highlight={{
          activityId: navigateToActivity,
          commentId,
        }}
      />
    );
  };

  isTabChangeEnabled = (): boolean => {
    const {
      editMode,
      isSavingEditedIssue,
      isRefreshing,
      attachingImage,
    } = this.props;
    return (
      !editMode && !isSavingEditedIssue && !isRefreshing && !attachingImage
    );
  };

  handleOnBack = () => {
    const hasParentRoute: boolean = Router.pop(false, {issueId: this.props.issueId || this.props?.issue?.id});

    if (!hasParentRoute) {
      Router.Issues();
    }
  };

  renderBackIcon = () => {
    return isSplitView() ? null : (
      <IconBack color={this.uiTheme.colors.$link} />
    );
  };

  canStar = (): boolean => {
    const {issue, issuePermissions} = this.props;
    return !!issue && issuePermissions?.canStar?.();
  };

  canEdit = (): boolean => {
    const {issue, issuePermissions} = this.props;
    return (
      issuePermissions.canUpdateGeneralInfo(issue) &&
      (!this.isHelpdeskTicket() || issuePermissions.helpdesk.isAgent(issue))
    );
  };

  createIssueActionsPermissionsMap() {
    const {issue, issuePermissions} = this.props;
    return {
      canAttach: issuePermissions.canAddAttachmentTo(issue),
      canEdit: this.canEdit(),
      canApplyCommand: !this.isReporter() && issuePermissions.canRunCommand(issue),
      canTag: issuePermissions.canTag(issue),
      canDeleteIssue: issuePermissions.canDeleteIssue(issue),
    };
  }

  renderActions() {
    if (!this.isIssueLoaded()) {
      return <Skeleton width={24} />;
    }

    const {issue, showIssueActions, issuePermissions} = this.props;
    return (
      <TouchableOpacity
        style={styles.issueActions}
        testID="test:id/header-menu-button"
        accessibilityLabel="header-menu-button"
        accessible={true}
        hitSlop={HIT_SLOP}
        onPress={() => {
          if (this.isIssueLoaded()) {
            showIssueActions(
              this.props.showActionSheetWithOptions,
              this.createIssueActionsPermissionsMap(),
              this.switchToDetailsTab,
              issuePermissions.canLink(issue) ? this.onAddIssueLink : null,
            );
          }
        }}
      >
        <IconMoreOptions color={styles.link.color} />
      </TouchableOpacity>
    );
  }

  isHelpdeskTicket() {
    return !!this.props.issue && isHelpdeskProject(this.props.issue);
  }

  renderIssueVotes() {
    const {issue, issuePermissions, toggleVote} = this.props;
    if (this.isHelpdeskTicket()) {
      return null;
    }
    return this.isHelpdeskTicket() ? null : (
      <IssueVotes
        canVote={issuePermissions.canVote(issue)}
        votes={issue?.votes}
        voted={issue?.voters?.hasVote}
        onVoteToggle={toggleVote}
        style={styles.issueVote}
      />
    );
  }

  renderStar = () => {
    const {issue, toggleStar} = this.props;
    if (this.isHelpdeskTicket()) {
      return null;
    }
    if (issue && this.isIssueLoaded()) {
      return (
        <Star
          size={22}
          style={styles.issueStar}
          canStar={this.canStar()}
          hasStar={issue.watchers?.hasStar}
          onStarToggle={toggleStar}
        />
      );
    }

    return <Skeleton width={24} />;
  };

  renderHeaderIssueTitle(): React.ReactNode {
    const {issue, issuePlaceholder, issueLoadingError} = this.props;

    const _issue: IssueFull = issue || issuePlaceholder;

    const readableID: string | undefined = getReadableID(_issue);

    if (readableID) {
      return (
        <Text
          style={[
            styles.headerText,
            _issue?.resolved ? styles.headerTextResolved : null,
          ]}
          selectable={true}
          testID="issue-id"
        >
          {readableID}
        </Text>
      );
    }

    return this.isIssueLoaded()
      ? null
      : (!issueLoadingError && <Skeleton width={120} />) || null;
  }

  toggleModalChildren(modalChildren?: React.ReactNode): void {
    this.setState({
      modalChildren,
    });
  }

  onAddIssueLink(): any {
    const {getIssueLinksTitle, onLinkIssue, loadIssuesXShort} = this.props;

    const render = (onHide: () => any, closeIcon?: any) => (
      <LinkedIssuesAddLink
        onLinkIssue={onLinkIssue}
        issuesGetter={loadIssuesXShort}
        onUpdate={(issues?: IssueLink[]) => {
          getIssueLinksTitle(issues);
        }}
        onHide={onHide}
        closeIcon={closeIcon}
      />
    );

    if (this.state.isSplitView) {
      this.toggleModalChildren(
        render(
          this.toggleModalChildren,
          <IconClose color={styles.link.color} />,
        ),
      );
    } else {
      return Router.Page({
        children: render(() => Router.pop()),
      });
    }
  }

  _renderHeader() {
    const {
      editMode,
      summaryCopy,
      isSavingEditedIssue,
      saveIssueSummaryAndDescriptionChange,
      stopEditingIssue,
    } = this.props;
    const issueTitle: React.ReactNode = this.renderHeaderIssueTitle();
    if (!editMode) {
      const isIssueLoaded: boolean = this.isIssueLoaded();
      return (
        <Header
          leftButton={this.renderBackIcon()}
          extra={
            isIssueLoaded ? (
              <View style={styles.headerExtraContainer}>
                {this.renderIssueVotes()}
                {this.renderStar()}
                {this.renderActions()}
              </View>
            ) : null
          }
          onBack={this.handleOnBack}
        >
          {issueTitle}
        </Header>
      );
    } else {
      const canSave: boolean = Boolean(summaryCopy) && !isSavingEditedIssue;
      const linkColor: string = this.uiTheme.colors.$link;
      const textSecondaryColor: string = this.uiTheme.colors.$textSecondary;
      return (
        <Header
          style={styles.header}
          leftButton={
            <IconClose
              color={isSavingEditedIssue ? textSecondaryColor : linkColor}
            />
          }
          onBack={stopEditingIssue}
          rightButton={
            <IconCheck
              color={canSave ? linkColor : textSecondaryColor}
            />
          }
          onRightButtonClick={
            canSave ? saveIssueSummaryAndDescriptionChange : () => {}
          }
        >
          {issueTitle}
        </Header>
      );
    }
  }

  _renderRefreshControl(
    onRefresh?: (...args: any[]) => any,
  ) {
    return (
      <RefreshControl
        testID="refresh-control"
        accessibilityLabel="refresh-control"
        accessible={true}
        refreshing={this.props.isRefreshing}
        tintColor={this.uiTheme.colors.$link}
        onRefresh={() => {
          if (onRefresh) {
            onRefresh();
          }
        }}
      />
    );
  }

  _renderCommandDialog() {
    const {
      closeCommandDialog,
      commandSuggestions,
      getCommandSuggestions,
      applyCommand,
      commandIsApplying,
      initialCommand,
    } = this.props;
    const Component: any = this.state.isSplitView
      ? CommandDialogModal
      : CommandDialog;
    return (
      <Component
        suggestions={commandSuggestions}
        onCancel={closeCommandDialog}
        onChange={getCommandSuggestions}
        onApply={async (command: string) => {
          await applyCommand(command);

          if (this.props.onCommandApply) {
            this.props.onCommandApply();
          }
        }}
        isApplying={commandIsApplying}
        initialCommand={initialCommand}
        uiTheme={this.uiTheme}
      />
    );
  }

  renderAttachFileDialog: () => React.ReactElement<
    React.ComponentProps<any>,
    any
  > = (): React.ReactElement<
    React.ComponentProps<typeof AttachFileDialog>,
    typeof AttachFileDialog
  > => (
    <AttachFileDialog
      analyticsId={ANALYTICS_ISSUE_PAGE}
      hideVisibility={false}
      getVisibilityOptions={() =>
        getApi().issue.getVisibilityOptions(this.props.issueId)
      }
      actions={{
        onAttach: async (
          files: NormalizedAttachment[],
          onAttachingFinish: () => any,
        ) => {
          await this.addAttachment(files, onAttachingFinish);
          this.setState({
            isAttachFileDialogVisible: false,
          });
        },
        onCancel: () => {
          this.cancelAddAttach();
          this.setState({
            isAttachFileDialogVisible: false,
          });
        },
      }}
    />
  );
  cancelAddAttach: () => void = (): void => {
    const {
      cancelAddAttach,
      toggleVisibleAddAttachDialog,
      attachingImage,
    } = this.props;
    cancelAddAttach(attachingImage);
    toggleVisibleAddAttachDialog(false);
  };
  addAttachment: (
    files: NormalizedAttachment[],
    onAttachingFinish: () => any,
  ) => void = async (
    files: NormalizedAttachment[],
    onAttachingFinish: () => any,
  ) => {
    const {uploadIssueAttach, loadAttachments} = this.props;
    await uploadIssueAttach(files);
    onAttachingFinish();
    loadAttachments();
  };
  isIssueLoaded: () => boolean = (): boolean => {
    const {issueLoaded, issueLoadingError} = this.props;
    return Boolean(issueLoaded && !issueLoadingError);
  };

  renderTagsSelect() {
    const {selectProps} = this.props;
    const Component: React.ElementType = this.state.isSplitView ? SelectModal : Select;
    return (
      <Component
        {...selectProps}
        titleRenderer={(tag: Tag) => {
          return (
            <ColorField
              fullText={true}
              text={tag.name}
              color={tag.color}
              style={styles.issueTagSelectItem}
            />
          );
        }}
      />
    );
  }

  render(): any {
    const {
      issue,
      issueLoadingError,
      showCommandDialog,
      isAttachFileDialogVisible,
      isTagsSelectVisible,
      issuePermissions,
      dispatcher,
      isConnected,
    } = this.props;
    return (
      <IssueContext.Provider
        value={{
          issue,
          issuePermissions,
          dispatcher,
          isConnected,
        }}
      >
        <ThemeContext.Consumer>
          {(theme: Theme) => {
            this.uiTheme = theme.uiTheme;
            return (
              <View style={styles.container} testID="issue-view">
                {this._renderHeader()}

                {issueLoadingError && (
                  <View style={styles.error}>
                    <ErrorMessage error={issueLoadingError} />
                  </View>
                )}

                {!issueLoadingError && this.renderTabs(this.uiTheme)}

                {this.isIssueLoaded() &&
                  showCommandDialog &&
                  this._renderCommandDialog()}

                {isAttachFileDialogVisible && this.renderAttachFileDialog()}

                {isTagsSelectVisible && this.renderTagsSelect()}

                {this.state.isSplitView && (
                  <ModalPortal onHide={() => this.toggleModalChildren()}>
                    {this.state.modalChildren}
                  </ModalPortal>
                )}
              </View>
            );
          }}
        </ThemeContext.Consumer>
      </IssueContext.Provider>
    );
  }
}
export type OwnProps = {
  issuePermissions: IssuePermissions;
  issuePlaceholder: Partial<AnyIssue>;
  issueId: string;
  user: User | null;
  navigateToActivity: string | undefined;
};

const mapStateToProps = (
  state: {
    app: RootState;
    issueState: IssueState;
  },
  ownProps: OwnProps,
): Partial<IssueState & OwnProps> => {
  const isConnected: boolean = !!state.app?.networkState?.isConnected;
  return {
    issuePermissions: state.app.issuePermissions,
    ...state.issueState,
    issuePlaceholder: ownProps.issuePlaceholder,
    issueId: ownProps.issueId,
    user: state.app.user!,
    isConnected,
    navigateToActivity: isConnected ? ownProps.navigateToActivity : undefined,
  };
};

export const issueActions = createIssueActions();

const mapDispatchToProps = (dispatch: ReduxThunkDispatch) => {
  return {
    ...bindActionCreatorsExt(issueActions, dispatch),
    dispatcher: dispatch,
    setIssueId: (issueId: string) => dispatch(dispatchActions.setIssueId(issueId)),
    setIssueSummaryCopy: (summary: string) => dispatch(dispatchActions.setIssueSummaryCopy(summary)),
    setIssueDescriptionCopy: (description: string) => dispatch(dispatchActions.setIssueDescriptionCopy(description)),
    stopEditingIssue: () => dispatch(dispatchActions.stopEditingIssue()),
    closeCommandDialog: () => dispatch(dispatchActions.closeCommandDialog()),
  };
};

export function connectIssue(Component: any) {
  return connect(mapStateToProps, mapDispatchToProps)(Component);
}


export default connectActionSheet(connectIssue(Issue));
