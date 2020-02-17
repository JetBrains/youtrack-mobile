/* @flow */
import {
  Text,
  View,
  RefreshControl,
  Dimensions
} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getApi} from '../../components/api/api__instance';
import IssueToolbar from '../../components/issue-toolbar/issue-toolbar';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import {COLOR_DARK, COLOR_FONT_GRAY, COLOR_PINK} from '../../components/variables/variables';
import usage from '../../components/usage/usage';
import CommandDialog from '../../components/command-dialog/command-dialog';
import ErrorMessage from '../../components/error-message/error-message';
import styles from './single-issue.styles';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import * as issueActions from './single-issue-actions';
import * as issueImageAttachActions from './activity/single-issue-activity__image-attach-actions';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {TabRoute} from '../../flow/Issue';

import type {UserAppearanceProfile} from '../../flow/User';
import {receiveUserAppearanceProfile} from '../../actions/app-actions';

// $FlowFixMe: module throws on type check
import {TabView, TabBar} from 'react-native-tab-view';
import IssueDetails from './single-issue__details';

import ActionsIcon from '../../components/menu/actions-icon';
import BackIcon from '../../components/menu/back-icon';
import IssueActivity from './activity/single-issue__activity';

const CATEGORY_NAME = 'Issue';
const tabRoutes: Array<TabRoute> = [
  {key: 'details', title: 'Details'},
  {key: 'activity', title: 'Activity'},
];


type AdditionalProps = {
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,
};

type SingleIssueProps = SingleIssueState & typeof issueActions & typeof issueImageAttachActions & AdditionalProps;
type TabsState = {
  index: number,
  routes: Array<TabRoute>,
  isTransitionInProgress: boolean
};

class SingeIssueView extends Component<SingleIssueProps, TabsState> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  toolbarNode: Object;
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

      issue, issuePlaceholder, issueLoaded, editMode
    } = this.props;

    const _issue = issue || issuePlaceholder;

    return (
      <IssueDetails
        loadIssue={loadIssue}
        openNestedIssueView={openNestedIssueView}
        attachingImage={attachingImage}
        refreshIssue={refreshIssue}

        issuePermissions={issuePermissions}
        updateIssueFieldValue={updateIssueFieldValue}
        updateProject={updateProject}

        issue={_issue}
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
        renderRefreshControl={this.renderRefreshControl}
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
        renderRefreshControl={this.renderRefreshControl}
      />
    );
  };

  renderTabBar() {
    return props => (
      <TabBar
        {...props}
        indicatorStyle={{backgroundColor: COLOR_PINK}}
        style={styles.tabsBar}
        renderLabel={({route, focused}) => (
          <Text style={{
            ...styles.tabLabel,
            color: focused ? COLOR_PINK : this.isTabChangeEnabled() ? COLOR_DARK : COLOR_FONT_GRAY
          }}>
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

  renderTabs() {
    const window = Dimensions.get('window');
    return (
      <TabView
        testID="issueTabs"
        lazy
        swipeEnabled={this.isTabChangeEnabled()}
        renderLazyPlaceholder={({route}) => (
          <View style={styles.tabLazyPlaceholder}>
            <Text>Loading {route.title}…</Text>
          </View>
        )}
        navigationState={this.state}
        renderScene={this.renderScene}
        initialLayout={{width: window.width, height: window.height}}
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
      return <BackIcon/>;
    }
  }

  renderActionsIcon() {
    if (!this.state.isTransitionInProgress) {
      return <ActionsIcon/>;
    }
  }

  onAttach = () => this.props.attachOrTakeImage(this.context.actionSheet());

  _renderHeader() {
    const {
      issue,
      issuePlaceholder,
      editMode,
      summaryCopy,
      issueLoaded,
      isSavingEditedIssue,
      saveIssueSummaryAndDescriptionChange,
      showIssueActions,
      stopEditingIssue
    } = this.props;

    const issueToShow = issueLoaded ? issue : issuePlaceholder;
    const title = <Text style={styles.headerText} selectable={true} testID="issue-id">
      {issueToShow ? getReadableID(issueToShow) : `Loading...`}
    </Text>;

    if (!editMode) {
      return (
        <Header
          leftButton={this.renderBackIcon()}
          rightButton={this.renderActionsIcon()}
          onRightButtonClick={() => this.state.index === 0 && issueLoaded && showIssueActions(this.context.actionSheet())}
          onBack={this.handleOnBack}
        >
          {title}
        </Header>
      );
    } else {
      const canSave = Boolean(summaryCopy) && !isSavingEditedIssue;
      const saveButton = <Text style={canSave ? null : styles.disabledSaveButton}>Save</Text>;

      return (
        <Header
          leftButton={<Text>Cancel</Text>}
          onBack={stopEditingIssue}
          rightButton={saveButton}
          onRightButtonClick={canSave ? saveIssueSummaryAndDescriptionChange : () => {
          }}
        >
          {title}
        </Header>
      );
    }
  }

  toolbarRef = (instance: ?IssueToolbar) => {
    if (instance) {
      this.toolbarNode = instance;
    }
  };

  _renderToolbar() {
    const {issue, editMode, issuePermissions, startEditingIssue, stopEditingIssue, toggleVote, toggleStar} = this.props;
    const canUpdateGeneralInfo = issuePermissions.canUpdateGeneralInfo(issue);

    return (
      <IssueToolbar
        ref={this.toolbarRef}
        canAttach={issuePermissions.canAddAttachmentTo(issue)}
        attachesCount={issue.attachments.length}
        onAttach={this.onAttach}

        canEdit={canUpdateGeneralInfo}
        onEdit={editMode ? stopEditingIssue : startEditingIssue}

        canVote={issuePermissions.canVote(issue)}
        votes={issue.votes}
        voted={issue.voters.hasVote}
        onVoteToggle={toggleVote}

        canStar={canUpdateGeneralInfo}
        starred={issue.watchers.hasStar}
        onStarToggle={toggleStar}
      />
    );
  }

  _renderRefreshControl(onRefresh: () => any = () => {}) {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      tintColor={COLOR_PINK}
      onRefresh={() => {
        this.props.refreshIssue();
        if (onRefresh) {
          onRefresh();
        } else {
          this.loadIssue();
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

  render() {
    const {
      issueLoaded,
      issueLoadingError,
      refreshIssue,
      showCommandDialog,
    } = this.props;

    const isIssueLoaded = Boolean(issueLoaded && !issueLoadingError);

    return (
      <View style={styles.container} testID="issue-view">
        {this._renderHeader()}

        {isIssueLoaded && this._renderToolbar()}

        {issueLoadingError && <ErrorMessage error={issueLoadingError} onTryAgain={refreshIssue}/>}

        {isIssueLoaded && this.renderTabs()}

        {showCommandDialog && this._renderCommandDialog()}

      </View>
    );
  }
}

const mapStateToProps = (state: { app: Object, singleIssue: SingleIssueState }, ownProps): SingleIssueState & AdditionalProps => {
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
    ...bindActionCreators(issueImageAttachActions, dispatch),
    ...{
      updateUserAppearanceProfile: (userAppearanceProfile: UserAppearanceProfile) => {
        return dispatch(
          receiveUserAppearanceProfile(userAppearanceProfile)
        );
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SingeIssueView);
