/* @flow */
import {
  Text,
  View,
  RefreshControl,
  Dimensions
} from 'react-native';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getApi} from '../../components/api/api__instance';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import {
  COLOR_DARK,
  COLOR_FONT_GRAY,
  COLOR_GRAY,
  COLOR_PINK,
  UNIT
} from '../../components/variables/variables';
import usage from '../../components/usage/usage';
import CommandDialog from '../../components/command-dialog/command-dialog';
import ErrorMessage from '../../components/error-message/error-message';
import styles from './single-issue.styles';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import * as issueActions from './single-issue-actions';
import {attachmentActions} from './single-issue__attachment-actions-and-types';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {AnyIssue, TabRoute} from '../../flow/Issue';
import type {Attachment} from '../../flow/CustomFields';

// $FlowFixMe: module throws on type check
import {TabView, TabBar} from 'react-native-tab-view';
import IssueDetails from './single-issue__details';

import {IconBack, IconCheck, IconClose, IconMoreOptions, IconDrag} from '../../components/icon/icon';
import IssueActivity from './activity/single-issue__activity';
import IssueStar from '../../components/issue-actions/issue-star';
import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import {isIOSPlatform} from '../../util/util';
import {Skeleton} from '../../components/skeleton/skeleton';

const CATEGORY_NAME = 'Issue';
const initialWindowDimentions = Dimensions.get('window');

const tabRoutes: Array<TabRoute> = [
  {key: 'details', title: 'Details'},
  {key: 'activity', title: 'Activity'}
];


type AdditionalProps = {
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,

  uploadAttach: (attach: Attachment) => any,
  loadAttachments: () => any,
  hideAddAttachDialog: () => any,
  createAttachActions: () => any,
  removeAttachment: (attach: Attachment) => any
};

type SingleIssueProps = SingleIssueState & typeof issueActions & AdditionalProps;
type TabsState = {
  index: number,
  routes: Array<TabRoute>,
  isTransitionInProgress: boolean
};

class SingeIssueView extends PureComponent<SingleIssueProps, TabsState> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  imageHeaders = getApi().auth.getAuthorizationHeaders();
  backendUrl = getApi().config.backendUrl;
  state = {
    index: 0,
    routes: tabRoutes,
    isTransitionInProgress: false
  };
  renderRefreshControl = this._renderRefreshControl.bind(this);


  async componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    await this.props.unloadIssueIfExist();
    await this.props.setIssueId(this.props.issueId);
    this.loadIssue();
  }

  componentDidUpdate(prevProps: $Shape<SingleIssueProps>): void {
    if (this.props.editMode === true && !prevProps.editMode && this.state.index === 1) {
      this.switchToDetailsTab();
    }
  }

  loadIssue() {
    this.props.loadIssue();
  }

  renderDetailsTab() {
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

      issue, issuePlaceholder, issueLoaded, editMode,
      toggleVote,

      removeAttachment,
      updateIssueVisibility
    } = this.props;

    return (
      <IssueDetails
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

        analyticCategory={CATEGORY_NAME}
        renderRefreshControl={() => this.renderRefreshControl(() => this.loadIssue())}

        onVoteToggle={toggleVote}
        onSwitchToActivity={this.switchToActivityTab}

        onRemoveAttachment={removeAttachment}

        onVisibilityChange={updateIssueVisibility}
      />
    );
  }

  renderActivityTab = () => {
    const {issue, user, issuePermissions, selectProps, updateUserAppearanceProfile, openNestedIssueView} = this.props;

    return (
      <IssueActivity
        issue={issue}
        user={user}
        openNestedIssueView={openNestedIssueView}
        issuePermissions={issuePermissions}
        selectProps={selectProps}
        updateUserAppearanceProfile={updateUserAppearanceProfile}
        renderRefreshControl={(loadActivities: () => any) => this.renderRefreshControl(loadActivities)}
      />
    );
  };

  renderTabBar() {
    const {editMode} = this.props;

    return props => (
      <TabBar
        {...props}
        indicatorStyle={{backgroundColor: editMode ? 'transparent' : COLOR_PINK}}
        style={[styles.tabsBar, editMode ? {height: 1} : null]}
        renderLabel={({route, focused}) => (
          <Text style={[
            styles.tabLabel,
            focused ? styles.tabLabelActive : null,
            {color: focused && !editMode ? COLOR_PINK : this.isTabChangeEnabled() ? COLOR_DARK : COLOR_FONT_GRAY}
          ]}>
            {route.title}
          </Text>
        )}
      />
    );
  }

  renderScene = ({route}) => {
    if (route.key === tabRoutes[0].key) {
      return this.renderDetailsTab();
    }
    return this.renderActivityTab();
  };

  isTabChangeEnabled() {
    const {editMode, isSavingEditedIssue, isRefreshing, attachingImage} = this.props;
    return (
      !editMode && !isSavingEditedIssue && !isRefreshing && !attachingImage
    );
  }

  switchToActivityTab = () => {
    this.setState({index: 1});
  };

  switchToDetailsTab = () => {
    this.setState({index: 0});
  };

  renderTabs() {
    return (
      <TabView
        testID="issueTabs"
        lazy
        swipeEnabled={this.isTabChangeEnabled()}
        navigationState={this.state}
        renderScene={this.renderScene}
        initialLayout={{width: initialWindowDimentions.width, height: initialWindowDimentions.height}}
        renderTabBar={this.renderTabBar()}
        onIndexChange={index => {
          if (this.isTabChangeEnabled()) {
            this.setState({index});
          }
        }}
      />
    );
  }


  handleOnBack = () => {
    this.setState({isTransitionInProgress: true});
    const returned = Router.pop();
    if (!returned) {
      Router.IssueList();
    }
  };

  renderBackIcon() {
    if (!this.state.isTransitionInProgress) {
      return <IconBack/>;
    }
  }

  canUpdateGeneralInfo = (): boolean => {
    const {issue, issuePermissions} = this.props;
    return !!issue && !!issuePermissions && issuePermissions.canUpdateGeneralInfo(issue);
  };

  renderActionsIcon() {
    if (!this.isIssueLoaded()) {
      return <Skeleton width={24}/>;
    }

    if (!this.state.isTransitionInProgress) {
      return (
        <Text>
          {isIOSPlatform()
            ? <IconMoreOptions size={24}/>
            : <IconDrag size={22}/>}
          <Text>{' '}</Text>
        </Text>
      );
    }
  }

  renderStar() {
    const {issue, toggleStar} = this.props;
    if (this.isIssueLoaded()) {
      return (
        <IssueStar
          style={styles.issueStar}
          canStar={this.canUpdateGeneralInfo()}
          starred={issue.watchers.hasStar}
          onStarToggle={toggleStar}
        />
      );
    }

    return <Skeleton width={24}/>;
  }


  renderHeaderIssueTitle() {
    const {issue, issuePlaceholder} = this.props;
    const _issue: AnyIssue = issue || issuePlaceholder;
    const readableID: ?string = getReadableID(_issue);
    if (readableID) {
      return (
        <Text
          style={[styles.headerText, _issue?.resolved ? styles.headerTextResolved : null]}
          selectable={true}
          testID="issue-id"
        >
          {readableID}
        </Text>
      );
    }

    return this.isIssueLoaded() ? null : <Skeleton width={120}/>;
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
      issuePermissions
    } = this.props;

    if (!editMode) {
      const isIssueLoaded: boolean = this.isIssueLoaded();
      return (
        <Header
          leftButton={this.renderBackIcon()}
          rightButton={isIssueLoaded ? this.renderActionsIcon() : null}
          extraButton={isIssueLoaded ? this.renderStar() : null}
          onRightButtonClick={() => {
            if (isIssueLoaded) {
              showIssueActions(
                this.context.actionSheet(),
                {
                  canAttach: issuePermissions.canAddAttachmentTo(issue),
                  canEdit: this.canUpdateGeneralInfo(),
                  canApplyCommand: issuePermissions.canRunCommand(issue)
                },
                this.switchToDetailsTab,
              );
            }
          }
          }
          onBack={this.handleOnBack}
        >
          {this.renderHeaderIssueTitle()}
        </Header>
      );
    } else {
      const canSave = Boolean(summaryCopy) && !isSavingEditedIssue;
      const saveButton = <IconCheck size={20} color={canSave ? COLOR_PINK : COLOR_GRAY}/>;

      return (
        <Header
          style={{paddingLeft: UNIT * 2, paddingRight: UNIT * 2}}
          leftButton={<IconClose size={21} color={isSavingEditedIssue ? COLOR_GRAY : COLOR_PINK}/>}
          onBack={stopEditingIssue}
          rightButton={saveButton}
          onRightButtonClick={canSave ? saveIssueSummaryAndDescriptionChange : () => {}}
        />
      );
    }
  }

  _renderRefreshControl(onRefresh?: Function) {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      tintColor={COLOR_PINK}
      onRefresh={() => {
        if (onRefresh) {
          onRefresh();
        }
      }}
    />;
  }

  _renderCommandDialog() {
    const {
      issue,
      closeCommandDialog,
      commandSuggestions,
      loadCommandSuggestions,
      applyCommand,
      commandIsApplying,
      initialCommand,
    } = this.props;

    return <CommandDialog
      headerContent={getReadableID(issue)}
      suggestions={commandSuggestions}
      onCancel={closeCommandDialog}
      onChange={loadCommandSuggestions}
      onApply={applyCommand}
      isApplying={commandIsApplying}
      initialCommand={initialCommand}
    />;
  }

  renderAttachFileDialog() {
    const {attachingImage, createAttachActions} = this.props;
    return (
      <AttachFileDialog
        issueId={this.props.issue.id}
        attach={attachingImage}
        actions={createAttachActions()}
        onCancel={this.cancelAddAttach}
        onAttach={this.addAttachment}
      />
    );
  }

  cancelAddAttach = () => {
    const {cancelAddAttach, hideAddAttachDialog, attachingImage} = this.props;
    cancelAddAttach(attachingImage);
    hideAddAttachDialog();
  };

  addAttachment = async (attach: Attachment) => {
    const {uploadAttach, loadAttachments} = this.props;
    await uploadAttach(attach);
    loadAttachments();
  };

  isIssueLoaded = (): boolean => {
    const {issueLoaded, issueLoadingError} = this.props;
    return Boolean(issueLoaded && !issueLoadingError);
  };

  render() {
    const {
      issueLoadingError,
      showCommandDialog,
      isAttachFileDialogVisible
    } = this.props;

    return (
      <View style={styles.container} testID="issue-view">
        {this._renderHeader()}

        {issueLoadingError && <View style={styles.error}><ErrorMessage error={issueLoadingError}/></View>}


        {!issueLoadingError && this.renderTabs()}

        {this.isIssueLoaded() && showCommandDialog && this._renderCommandDialog()}

        {isAttachFileDialogVisible && this.renderAttachFileDialog()}
      </View>
    );
  }
}

const mapStateToProps = (state: { app: Object, singleIssue: SingleIssueState }, ownProps): SingleIssueState => {
  return {
    issuePermissions: state.app.issuePermissions,
    ...state.singleIssue,
    issuePlaceholder: ownProps.issuePlaceholder,
    issueId: ownProps.issueId,
    user: state.app.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    createAttachActions: () => attachmentActions.createAttachActions(dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SingeIssueView);
