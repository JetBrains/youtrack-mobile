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
import {UNIT} from '../../components/variables/variables';
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
import {ThemeContext} from '../../components/theme/theme-context';

import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';

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

  async loadIssue() {
    await this.props.loadIssue();
    this.props.loadIssueLinks();
  }

  renderDetailsTab(uiTheme: UITheme) {
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
        renderRefreshControl={() => this.renderRefreshControl(() => this.loadIssue(), uiTheme)}

        onVoteToggle={toggleVote}
        onSwitchToActivity={this.switchToActivityTab}

        onRemoveAttachment={removeAttachment}

        onVisibilityChange={updateIssueVisibility}
      />
    );
  }

  renderActivityTab = (uiTheme: UITheme) => {
    const {issue, user, issuePermissions, selectProps, updateUserAppearanceProfile, openNestedIssueView} = this.props;

    return (
      <IssueActivity
        issue={issue}
        user={user}
        openNestedIssueView={openNestedIssueView}
        issuePermissions={issuePermissions}
        selectProps={selectProps}
        updateUserAppearanceProfile={updateUserAppearanceProfile}
        renderRefreshControl={(loadActivities: () => any) => this.renderRefreshControl(loadActivities, uiTheme)}
      />
    );
  };

  renderTabBar(uiTheme: UITheme) {
    const {editMode} = this.props;

    return props => (
      <TabBar
        {...props}
        indicatorStyle={{backgroundColor: editMode ? 'transparent' : uiTheme.colors.$link}}
        style={[styles.tabsBar, editMode ? {height: 1} : null]}
        renderLabel={({route, focused}) => {
          const uiThemeColors: UIThemeColors = uiTheme.colors;
          return (
            <Text style={[
              styles.tabLabel,
              focused ? styles.tabLabelActive : null,
              {color: focused && !editMode ? uiThemeColors.$link : this.isTabChangeEnabled() ? uiThemeColors.$text : uiThemeColors.$disabled}
            ]}>
              {route.title}
            </Text>
          );
        }}
      />
    );
  }

  renderScene = (route, uiTheme: UITheme) => {
    if (route.key === tabRoutes[0].key) {
      return this.renderDetailsTab(uiTheme);
    }
    return this.renderActivityTab(uiTheme);
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

  renderTabs(uiTheme: UITheme) {
    return (
      <TabView
        testID="issueTabs"
        lazy
        swipeEnabled={this.isTabChangeEnabled()}
        navigationState={this.state}
        renderScene={({route}) => this.renderScene(route, uiTheme)}
        initialLayout={{width: initialWindowDimentions.width, height: initialWindowDimentions.height}}
        renderTabBar={this.renderTabBar(uiTheme)}
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

  canStar = (): boolean => {
    const {issue, issuePermissions} = this.props;
    return issue && issuePermissions && issuePermissions.canStar();
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

  renderStar = () => {
    const {issue, toggleStar} = this.props;
    if (this.isIssueLoaded()) {
      return (
        <IssueStar
          style={styles.issueStar}
          canStar={this.canStar()}
          starred={issue.watchers.hasStar}
          onStarToggle={toggleStar}
        />
      );
    }

    return <Skeleton width={24}/>;
  }


  renderHeaderIssueTitle() {
    const {issue, issuePlaceholder, issueLoadingError} = this.props;
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

    return this.isIssueLoaded() ? null : !issueLoadingError && <Skeleton width={120}/> || null;
  }

  _renderHeader(uiTheme: UITheme) {
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
                  canEdit: issuePermissions.canUpdateGeneralInfo(issue),
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
      const saveButton = <IconCheck size={20} color={canSave ? uiTheme.colors.$link : uiTheme.colors.$textSecondary}/>;

      return (
        <Header
          style={{paddingLeft: UNIT * 2, paddingRight: UNIT * 2}}
          leftButton={<IconClose size={21} color={isSavingEditedIssue ? uiTheme.colors.$textSecondary : uiTheme.colors.$link}/>}
          onBack={stopEditingIssue}
          rightButton={saveButton}
          onRightButtonClick={canSave ? saveIssueSummaryAndDescriptionChange : () => {}}
        />
      );
    }
  }

  _renderRefreshControl(onRefresh?: Function, uiTheme: UITheme) {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      tintColor={uiTheme.colors.$link}
      onRefresh={() => {
        if (onRefresh) {
          onRefresh();
        }
      }}
    />;
  }

  _renderCommandDialog(uiTheme: UITheme) {
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
      uiTheme={uiTheme}
    />;
  }

  renderAttachFileDialog(uiTheme: UITheme) {
    const {attachingImage, createAttachActions} = this.props;
    return (
      <AttachFileDialog
        issueId={this.props.issue.id}
        attach={attachingImage}
        actions={createAttachActions()}
        onCancel={this.cancelAddAttach}
        onAttach={this.addAttachment}
        uiTheme={uiTheme}
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
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiTheme: UITheme = theme.uiTheme;
          return (
            <View style={styles.container} testID="issue-view">
              {this._renderHeader(uiTheme)}

              {issueLoadingError && <View style={styles.error}><ErrorMessage error={issueLoadingError}/></View>}


              {!issueLoadingError && this.renderTabs(uiTheme)}

              {this.isIssueLoaded() && showCommandDialog && this._renderCommandDialog(uiTheme)}

              {isAttachFileDialogVisible && this.renderAttachFileDialog(uiTheme)}
            </View>
          );
        }}
      </ThemeContext.Consumer>
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
