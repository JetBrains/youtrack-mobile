/* @flow */

import {ScrollView, View, Text, TouchableOpacity, Image} from 'react-native';
import React, {Component} from 'react';

import Header from '../../components/header/header';
import usage from '../../components/usage/usage';
import {getApi} from '../../components/api/api__instance';
import {attach, next, IconCheck, IconClose} from '../../components/icon/icon';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import IssueSummary from '../../components/issue-summary/issue-summary';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as createIssueActions from './create-issue-actions';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {CreateIssueState} from './create-issue-reducers';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import {COLOR_GRAY, COLOR_PINK} from '../../components/variables/variables';

import styles from './create-issue.styles';

const CATEGORY_NAME = 'Create issue view';

type AdditionalProps = {
  issuePermissions: IssuePermissions,
  predefinedDraftId: ?string
};
type Props = CreateIssueState & typeof createIssueActions & AdditionalProps;

class CreateIssue extends Component<Props, void> {
  fieldsPanel: Object;

  constructor(props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);
  }

  UNSAFE_componentWillMount() {
    this.props.initializeWithDraftOrProject(this.props.predefinedDraftId);
  }

  renderProjectSelector() {
    const {issue, processing} = this.props;
    const project = issue.project;
    const projectSelected = !!project.id;

    return (
      <TouchableOpacity
        disabled={processing}
        style={styles.selectProjectButton}
        onPress={() => this.fieldsPanel.onSelectProject()}
      >
        <Text style={styles.selectProjectText} numberOfLines={1}>
          {projectSelected
            ? <Text>{project.name} ({project.shortName})</Text>
            : 'Select project'
          }
        </Text>
        <Image style={styles.selectProjectIcon} source={next} resizeMode="contain"/>
      </TouchableOpacity>
    );
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
      attachImage,
      updateFieldValue,
      updateProject,
      removeAttachment
    } = this.props;

    const canCreateIssue = issue.summary && issue.project.id && !processing && !attachingImage;

    return (
      <View style={styles.container}>
        <Header
          leftButton={<IconClose size={28} color={COLOR_PINK}/>}
          onBack={storeDraftAndGoBack}
          rightButton={<IconCheck size={28} color={canCreateIssue ? COLOR_PINK : COLOR_GRAY}/>}
          onRightButtonClick={() => canCreateIssue && createIssue()}>
          <Text style={styles.title}>New Issue</Text>
        </Header>

        <View style={styles.separator}/>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View>
            {this.renderProjectSelector()}


            <IssueSummary
              style={styles.issueSummary}
              showSeparator={true}
              summary={issue.summary}
              description={issue.description}
              editable={!processing}
              onSummaryChange={setIssueSummary}
              onDescriptionChange={setIssueDescription}
            />

            {issue.project.id &&
            <View style={styles.attachesContainer}>

              <AttachmentsRow
                attachments={issue.attachments}
                attachingImage={attachingImage}
                imageHeaders={getApi().auth.getAuthorizationHeaders()}
                onRemoveImage={removeAttachment}
              />

              <View style={styles.attachButtonsContainer}>
                <TouchableOpacity
                  disabled={attachingImage !== null}
                  style={styles.attachButton}
                  onPress={() => attachImage(true)}>
                  <Image style={styles.attachIcon} source={attach} resizeMode="contain"/>
                  <Text style={styles.attachButtonText}>Choose from library...</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={attachingImage !== null}
                  style={styles.attachButton}
                  onPress={() => attachImage(false)}>
                  <Text style={styles.attachButtonText}>Take a picture...</Text>
                </TouchableOpacity>
              </View>
            </View>}

            <View style={styles.separator}/>
          </View>
        </ScrollView>

        <CustomFieldsPanel
          ref={this.fieldsPanelRef}
          api={getApi()}
          issue={issue}
          canEditProject={true}
          autoFocusSelect
          issuePermissions={issuePermissions}
          onUpdate={async (field, value) => await updateFieldValue(field, value)}
          onUpdateProject={async (project) => await updateProject(project)}
        />
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
