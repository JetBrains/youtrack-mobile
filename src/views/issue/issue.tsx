import React from 'react';
import {FlatList, RefreshControl, Text, View} from 'react-native';

import {bindActionCreatorsExt} from 'util/redux-ext';
import {connect} from 'react-redux';

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
import {attachmentActions} from './issue__attachment-actions-and-types';
import {DEFAULT_ISSUE_STATE_FIELD_NAME} from './issue-base-actions-creater';
import {DEFAULT_THEME} from 'components/theme/theme';
import {getApi} from 'components/api/api__instance';
import {getReadableID} from 'components/issue-formatter/issue-formatter';
import {
  IconBack,
  IconCheck,
  IconClose,
  IconDrag,
  IconMoreOptions,
} from 'components/icon/icon';
import {isIOSPlatform} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {IssueContext} from './issue-context';
import {Select, SelectModal} from 'components/select/select';
import {Skeleton} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issue.styles';

import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {AnyIssue, IssueFull, TabRoute} from 'types/Issue';
import type {Attachment, IssueLink, Tag} from 'types/CustomFields';
import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
import type {EventSubscription} from 'react-native';
import type {IssueTabbedState} from 'components/issue-tabbed/issue-tabbed';
import type {NormalizedAttachment} from 'types/Attachment';
import type {RequestHeaders} from 'types/Auth';
import type {RootState} from 'reducers/app-reducer';
import type {ScrollData} from 'types/Markdown';
import type {State as IssueState} from './issue-reducers';
import type {Theme, UITheme} from 'types/Theme';
import type {User} from 'types/User';

const isIOS: boolean = isIOSPlatform();


type AdditionalProps = {
  issuePermissions: IssuePermissions;
  issuePlaceholder: Record<string, any>;
  uploadIssueAttach: (files: NormalizedAttachment[]) => any;
  loadAttachments: () => any;
  hideAddAttachDialog: () => any;
  createAttachActions: () => any;
  removeAttachment: (attach: Attachment) => any;
  isTagsSelectVisible: boolean;
  onCommandApply: () => any;
  commentId?: string;
};

export type IssueProps = IssueState &
  typeof dispatchActions &
  AttachmentActions &
  AdditionalProps;


export class Issue extends IssueTabbed<IssueProps, IssueTabbedState> {
  static contextTypes: {
    actionSheet: (...args: any[]) => any;
  } = {
    actionSheet: Function,
  };
  CATEGORY_NAME: string = 'Issue';
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
    usage.trackScreenView(this.CATEGORY_NAME);
    await this.props.unloadIssueIfExist();
    await this.props.setIssueId(
      this.props.issueId || this.props?.issuePlaceholder?.id,
    );

    if (this.props.navigateToActivity) {
      await this.loadIssue(this.props?.issuePlaceholder);
      this.switchToActivityTab();
    } else {
      await this.loadIssue(this.props?.issuePlaceholder);
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

  async UNSAFE_componentWillReceiveProps(nextProps: IssueProps): Promise<void> {
    if (nextProps.issueId !== this.props.issueId) {
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

  getRouteBadge(
    route: TabRoute,
  ): React.ReactElement<React.ComponentProps<typeof View>, typeof View> | null {
    return super.getRouteBadge(route.title === this.tabRoutes[1].title, this.props?.commentsCounter);
  }

  async loadIssue(issuePlaceholder: Partial<IssueFull> | null | undefined) {
    await this.props.loadIssue(issuePlaceholder);
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
        loadIssue={loadIssue}
        openNestedIssueView={openNestedIssueView}
        attachingImage={attachingImage}
        refreshIssue={refreshIssue}
        issuePermissions={issuePermissions}
        updateIssueFieldValue={updateIssueFieldValue}
        updateProject={updateProject}
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
        analyticCategory={this.CATEGORY_NAME}
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
          onShowCopyTextContextActions(this.context.actionSheet(), text, title);
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
  renderDetails: (
    uiTheme: UITheme,
  ) => React.ReactElement<React.ComponentProps<any>, any> = (
    uiTheme: UITheme,
  ) => {
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

  renderActivity: (
    uiTheme: UITheme,
  ) => React.ReactElement<React.ComponentProps<any>, any> = (
    uiTheme: UITheme,
  ): React.ReactElement<
    React.ComponentProps<typeof IssueActivity>,
    typeof IssueActivity
  > => {
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

  isTabChangeEnabled(): boolean {
    const {
      editMode,
      isSavingEditedIssue,
      isRefreshing,
      attachingImage,
    } = this.props;
    return (
      !editMode && !isSavingEditedIssue && !isRefreshing && !attachingImage
    );
  }

  handleOnBack() {
    const hasParentRoute: boolean = Router.pop();

    if (!hasParentRoute) {
      Router.Issues();
    }
  }

  renderBackIcon: () => React.ReactNode = () => {
    return isSplitView() ? null : (
      <IconBack color={this.uiTheme.colors.$link} />
    );
  };
  canStar: () => boolean = (): boolean => {
    const {issue, issuePermissions} = this.props;
    return issue && issuePermissions && issuePermissions.canStar();
  };

  renderActionsIcon(uiTheme: UITheme): React.ReactNode {
    if (!this.isIssueLoaded()) {
      return <Skeleton width={24} />;
    }

    return (
      <Text style={styles.iconMore}>
        {isIOS ? (
          <IconMoreOptions size={18} color={uiTheme.colors.$link} />
        ) : (
          <Text>
            <IconDrag size={18} color={uiTheme.colors.$link} />
          </Text>
        )}
        <Text> </Text>
      </Text>
    );
  }

  renderIssueVotes(): React.ReactNode {
    const {issue, issuePermissions, toggleVote} = this.props;
    return (
      <View style={styles.issueVote}>
        <IssueVotes
          canVote={issuePermissions.canVote(issue)}
          votes={issue?.votes}
          voted={issue?.voters?.hasVote}
          onVoteToggle={toggleVote}
        />
      </View>
    );
  }

  renderStar = (): React.ReactNode => {
    const {issue, toggleStar} = this.props;

    if (issue && this.isIssueLoaded()) {
      return (
        <Star
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

    const _issue: AnyIssue = issue || issuePlaceholder;

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

  toggleModalChildren(modalChildren?: any): void {
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
          <IconClose size={21} color={styles.link.color} />,
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
      issue,
      editMode,
      summaryCopy,
      isSavingEditedIssue,
      saveIssueSummaryAndDescriptionChange,
      showIssueActions,
      stopEditingIssue,
      issuePermissions,
    } = this.props;
    if (!editMode) {
      const isIssueLoaded: boolean = this.isIssueLoaded();
      return (
        <Header
          leftButton={this.renderBackIcon()}
          rightButton={
            isIssueLoaded ? this.renderActionsIcon(this.uiTheme) : null
          }
          extra={(
            isIssueLoaded
              ? <View style={styles.headerExtraContainer}>{this.renderIssueVotes()}{this.renderStar()}</View>
              : null
          )}
          onRightButtonClick={() => {
            if (isIssueLoaded) {
              showIssueActions(
                this.context.actionSheet(),
                {
                  canAttach: issuePermissions.canAddAttachmentTo(issue),
                  canEdit: issuePermissions.canUpdateGeneralInfo(issue),
                  canApplyCommand: issuePermissions.canRunCommand(issue),
                  canTag: issuePermissions.canTag(issue),
                  canDeleteIssue: issuePermissions.canDeleteIssue(issue),
                },
                this.switchToDetailsTab,
                issuePermissions.canLink(issue) ? this.onAddIssueLink : null,
              );
            }
          }}
          onBack={this.handleOnBack}
        >
          {this.renderHeaderIssueTitle()}
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
              size={21}
              color={isSavingEditedIssue ? textSecondaryColor : linkColor}
            />
          }
          onBack={stopEditingIssue}
          rightButton={
            <IconCheck
              size={20}
              color={canSave ? linkColor : textSecondaryColor}
            />
          }
          onRightButtonClick={
            canSave ? saveIssueSummaryAndDescriptionChange : () => {}
          }
        >
          {issueIdReadable}
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

  renderTagsSelect(): any {
    const {selectProps} = this.props;
    const Component: any = this.state.isSplitView ? SelectModal : Select;
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
  issuePlaceholder: Partial<IssueFull>;
  issueId: string;
  user: User;
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
    user: state.app.user,
    isConnected,
    navigateToActivity: isConnected === true || isConnected === undefined ? ownProps.navigateToActivity : undefined,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreatorsExt(createIssueActions(), dispatch),
    createAttachActions: () => attachmentActions.createAttachActions(dispatch),
    dispatcher: dispatch,
    setIssueId: issueId => dispatch(dispatchActions.setIssueId(issueId)),
    setIssueSummaryCopy: summary => dispatch(dispatchActions.setIssueSummaryCopy(summary)),
    setIssueDescriptionCopy: description => dispatch(dispatchActions.setIssueDescriptionCopy(description)),
    stopEditingIssue: () => dispatch(dispatchActions.stopEditingIssue()),
    closeCommandDialog: () => dispatch(dispatchActions.closeCommandDialog()),
  };
};

export function connectIssue(Component: any): any {
  return connect(mapStateToProps, mapDispatchToProps)(Component);
}


export default connectIssue(Issue);
