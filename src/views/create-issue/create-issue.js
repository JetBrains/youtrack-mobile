/* @flow */

import {ScrollView, View, Text, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';

import Header from '../../components/header/header';
import usage from '../../components/usage/usage';
import {getApi} from '../../components/api/api__instance';
import {IconCheck, IconClose, IconPaperClip} from '../../components/icon/icon';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import IssueSummary from '../../components/issue-summary/issue-summary';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as createIssueActions from './create-issue-actions';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import {COLOR_GRAY, COLOR_PINK} from '../../components/variables/variables';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {CreateIssueState} from './create-issue-reducers';
import PropTypes from 'prop-types';

import styles from './create-issue.styles';

const CATEGORY_NAME = 'Create issue view';

type AdditionalProps = {
  issuePermissions: IssuePermissions,
  predefinedDraftId: ?string
};
type Props = CreateIssueState & typeof createIssueActions & AdditionalProps;

class CreateIssue extends Component<Props, void> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };
  fieldsPanel: Object;

  constructor(props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);
  }

  UNSAFE_componentWillMount() {
    this.props.initializeWithDraftOrProject(this.props.predefinedDraftId);
  }

  fieldsPanelRef = (instance: ?CustomFieldsPanel) => {
    if (instance) {
      this.fieldsPanel = instance;
    }
  };

  render() {
    const {
      issuePermissions,
      storeDraftAndGoBack,
      setIssueSummary,
      setIssueDescription,
      createIssue,
      issue,
      attachingImage,
      processing,
      updateFieldValue,
      updateProject,
      removeAttachment,
      showCreateIssueActions
    } = this.props;

    const isAttaching = attachingImage !== null;
    const isProcessing = processing || isAttaching;
    const canCreateIssue = issue.summary && issue?.project?.id && !isProcessing;

    return (
      <View
        testID="createIssue"
        style={styles.container}>
        <Header
          leftButton={<IconClose size={21} color={COLOR_PINK}/>}
          onBack={storeDraftAndGoBack}
          rightButton={<IconCheck size={20} color={canCreateIssue ? COLOR_PINK : COLOR_GRAY}/>}
          onRightButtonClick={() => canCreateIssue && createIssue()}>
          <Text style={styles.title}>New Issue</Text>
        </Header>

        <View style={styles.separator}/>

        <CustomFieldsPanel
          testID="createIssueFields"
          ref={this.fieldsPanelRef}
          api={getApi()}
          issue={issue}
          canEditProject={true}
          autoFocusSelect
          issuePermissions={issuePermissions}
          onUpdate={async (field, value) => await updateFieldValue(field, value)}
          onUpdateProject={async (project) => await updateProject(project)}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <IssueSummary
            testID="createIssueSummary"
            style={styles.issueSummary}
            showSeparator={true}
            summary={issue.summary}
            description={issue.description}
            editable={!processing}
            onSummaryChange={setIssueSummary}
            onDescriptionChange={setIssueDescription}
          />

          {issue?.project?.id && (
            <View
              testID="createIssueAttachments"
              style={styles.attachesContainer}>

              <AttachmentsRow
                testID="createIssueAttachmentRow"
                attachments={issue.attachments}
                attachingImage={attachingImage}
                imageHeaders={getApi().auth.getAuthorizationHeaders()}
                canRemoveAttachment={true}
                onRemoveImage={removeAttachment}
              />

              <View style={styles.attachButtonsContainer}>
                <TouchableOpacity
                  testID="createIssueAttachmentButton"
                  disabled={isProcessing}
                  style={styles.attachButton}
                  onPress={() => showCreateIssueActions(this.context.actionSheet())}
                >
                  <IconPaperClip size={24} color={isProcessing ? COLOR_GRAY : COLOR_PINK}/>
                  <Text style={[styles.attachButtonText, isProcessing ? {color: COLOR_GRAY} : null]}>
                    Add Attachment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.separator}/>
        </ScrollView>

        <KeyboardSpacerIOS/>
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.creation,
    predefinedDraftId: ownProps.predefinedDraftId,
    issuePermissions: state.app.issuePermissions
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(createIssueActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateIssue);
