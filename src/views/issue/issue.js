/* @flow */

import React, {PureComponent} from 'react';
import {Text, View, RefreshControl, Dimensions} from 'react-native';

import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

// $FlowFixMe: module throws on type check
import {TabView, TabBar} from 'react-native-tab-view';

import * as issueActions from './issue-actions';
import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import ColorField from '../../components/color-field/color-field';
import CommandDialog from '../../components/command-dialog/command-dialog';
import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IssueActivity from './activity/issue__activity';
import IssueDetails from './issue__details';
import IssueStar from '../../components/issue-actions/issue-star';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import usage from '../../components/usage/usage';
import {attachmentActions} from './issue__attachment-actions-and-types';
import {getApi} from '../../components/api/api__instance';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import {IconBack, IconCheck, IconClose, IconMoreOptions, IconDrag} from '../../components/icon/icon';
import {isIOSPlatform} from '../../util/util';
import {Skeleton} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './issue.styles';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {AnyIssue, TabRoute} from '../../flow/Issue';
import type {Attachment, Tag} from '../../flow/CustomFields';
import type {State as IssueState} from './issue-reducers';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';

const CATEGORY_NAME = 'Issue';
const initialWindowDimentions = Dimensions.get('window');

const tabRoutes: Array<TabRoute> = [
  {key: 'details', title: 'Details'},
  {key: 'activity', title: 'Activity'}
];

const isIOS: boolean = isIOSPlatform();

type AdditionalProps = {
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,

  uploadAttach: (attach: Attachment) => any,
  loadAttachments: () => any,
  hideAddAttachDialog: () => any,
  createAttachActions: () => any,
  removeAttachment: (attach: Attachment) => any,
  isTagsSelectVisible: boolean
};

type IssueProps = IssueState & typeof issueActions & AdditionalProps;
type TabsState = {
  index: number,
  routes: Array<TabRoute>,
  isTransitionInProgress: boolean
};

class Issue extends PureComponent<IssueProps, TabsState> {
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

  componentDidUpdate(prevProps: $Shape<IssueProps>): void {
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
      updateIssueVisibility,

      toggleVisibleAddAttachDialog,
      onTagRemove
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

        onAttach={toggleVisibleAddAttachDialog}
        onTagRemove={onTagRemove}
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

    return props => {
      const uiThemeColors: UIThemeColors = uiTheme.colors;
      return (
        <TabBar
          {...props}
          pressColor={uiThemeColors.$disabled}
          indicatorStyle={{backgroundColor: editMode ? 'transparent' : uiThemeColors.$link}}
          style={[styles.tabsBar, editMode ? {height: 1} : null, {shadowColor: uiThemeColors.$icon}]}
          renderLabel={({route, focused}) => {
            return (
              <Text style={[
                styles.tabLabel,
                focused ? styles.tabLabelActive : null,
                {
                  color: focused && !editMode ? uiThemeColors.$link : (
                    this.isTabChangeEnabled() ? uiThemeColors.$text : uiThemeColors.$disabled
                  )
                }
              ]}>
                {route.title}
              </Text>
            );
          }}
        />
      );
    };
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
    const returned = Router.pop(false, {issueId: this.props?.issue?.id});
    if (!returned) {
      Router.Issues();
    }
  };

  renderBackIcon(uiTheme: UITheme) {
    if (!this.state.isTransitionInProgress) {
      return <IconBack color={uiTheme.colors.$link}/>;
    }
  }

  canStar = (): boolean => {
    const {issue, issuePermissions} = this.props;
    return issue && issuePermissions && issuePermissions.canStar();
  };

  renderActionsIcon(uiTheme: UITheme) {
    if (!this.isIssueLoaded()) {
      return <Skeleton width={24}/>;
    }

    if (!this.state.isTransitionInProgress) {
      return (
        <Text style={styles.iconMore}>
          {isIOS
            ? <IconMoreOptions size={18} color={uiTheme.colors.$link}/>
            : <Text><IconDrag size={18} color={uiTheme.colors.$link}/></Text>
          }
          <Text>{' '}</Text>
        </Text>
      );
    }
  }

  renderStar = (uiTheme: UITheme) => {
    const {issue, toggleStar} = this.props;
    if (this.isIssueLoaded()) {
      return (
        <IssueStar
          style={styles.issueStar}
          canStar={this.canStar()}
          starred={issue.watchers.hasStar}
          onStarToggle={toggleStar}
          uiTheme={uiTheme}
        />
      );
    }

    return <Skeleton width={24}/>;
  };


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
          leftButton={this.renderBackIcon(uiTheme)}
          rightButton={isIssueLoaded ? this.renderActionsIcon(uiTheme) : null}
          extraButton={isIssueLoaded ? this.renderStar(uiTheme) : null}
          onRightButtonClick={() => {
            if (isIssueLoaded) {
              showIssueActions(
                this.context.actionSheet(),
                {
                  canAttach: issuePermissions.canAddAttachmentTo(issue),
                  canEdit: issuePermissions.canUpdateGeneralInfo(issue),
                  canApplyCommand: issuePermissions.canRunCommand(issue),
                  canTag: issuePermissions.canTag(issue)
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
          style={styles.headerLeftButton}
          leftButton={
            <IconClose
              size={21}
              color={isSavingEditedIssue ? uiTheme.colors.$textSecondary : uiTheme.colors.$link}
            />}
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
        issueId={this.props?.issue?.id}
        attach={attachingImage}
        actions={createAttachActions()}
        onCancel={this.cancelAddAttach}
        onAttach={this.addAttachment}
        uiTheme={uiTheme}
      />
    );
  }

  cancelAddAttach = () => {
    const {cancelAddAttach, toggleVisibleAddAttachDialog, attachingImage} = this.props;
    cancelAddAttach(attachingImage);
    toggleVisibleAddAttachDialog(false);
  };

  addAttachment = async (attach: Attachment, onAttachingFinish: () => any) => {
    const {uploadAttach, loadAttachments} = this.props;
    await uploadAttach(attach);
    onAttachingFinish();
    loadAttachments();
  };

  isIssueLoaded = (): boolean => {
    const {issueLoaded, issueLoadingError} = this.props;
    return Boolean(issueLoaded && !issueLoadingError);
  };

  renderTagsSelect() {
    const {selectProps} = this.props;
    return (
      <Select
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

  render() {
    const {
      issueLoadingError,
      showCommandDialog,
      isAttachFileDialogVisible,
      isTagsSelectVisible
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

              {isTagsSelectVisible && this.renderTagsSelect()}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state: { app: Object, issueState: IssueState }, ownProps): IssueState => {
  return {
    issuePermissions: state.app.issuePermissions,
    ...state.issueState,
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

export default connect(mapStateToProps, mapDispatchToProps)(Issue);
