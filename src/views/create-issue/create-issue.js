/* @flow */
import {ScrollView, View, Text, TouchableOpacity, Image, Platform} from 'react-native';
import React, {Component} from 'react';

import styles from './create-issue.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import usage from '../../components/usage/usage';
import {attach, tag, next} from '../../components/icon/icon';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import IssueSummary from '../../components/issue-summary/issue-summary';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as createIssueActions from './create-issue-actions';
import type Api from '../../components/api/api';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {CreateIssueState} from './create-issue-reducers';

export const PROJECT_ID_STORAGE_KEY = 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE';
export const DRAFT_ID_STORAGE_KEY = 'DRAFT_ID_STORAGE_KEY';
const CATEGORY_NAME = 'Create issue view';

type AdditionalProps = {
  api: Api,
  issuePermissions: IssuePermissions,
  predefinedDraftId: ?string
};
type Props = CreateIssueState & typeof createIssueActions & AdditionalProps;

class CreateIssue extends Component<void, Props, void> {
  fieldsPanel: Object;

  constructor(props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);
  }

  componentWillMount() {
    this.props.initializeWithDraftOrProject(this.props.predefinedDraftId);
  }

  renderProjectSelector() {
    const {issue, processing} = this.props;
    const project = issue.project;
    const projectSelected = project.id;
    return (
      <TouchableOpacity
        disabled={processing}
        style={styles.selectProjectButton}
        onPress={() => this.fieldsPanel.onSelectProject()}
      >
        <Text style={styles.selectProjectText}>
          {projectSelected ? project.shortName : 'Select project'}
        </Text>
        <Image style={styles.selectProjectIcon} source={next} resizeMode="contain" />
      </TouchableOpacity>
    );
  }

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
      updateProject
    } = this.props;

    const canCreateIssue = issue.summary && issue.project.id && !processing && !attachingImage;

    const createButton = <Text style={canCreateIssue ? null : styles.disabledCreateButton}>Create</Text>;

    return (
      <View style={styles.container}>
        <Header leftButton={<Text>Cancel</Text>}
                onBack={storeDraftAndGoBack}
                rightButton={createButton}
                onRightButtonClick={() => canCreateIssue && createIssue()}>
          <Text style={issueStyles.headerText}>New Issue</Text>
        </Header>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
          <View>
            {this.renderProjectSelector()}

            <View style={styles.separator} />

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
                  imageHeaders={this.props.api.auth.getAuthorizationHeaders()}
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
            {false && <View style={styles.actionContainer}>
              <Image style={styles.actionIcon} source={tag}/>
              <View style={styles.actionContent}>
                <Text>Add tag</Text>
                <Image style={styles.arrowImage} source={next}></Image>
              </View>
            </View>}
          </View>
        </ScrollView>

        <CustomFieldsPanel
          ref={node => this.fieldsPanel = node}
          api={this.props.api}
          issue={issue}
          canEditProject={true}
          issuePermissions={issuePermissions}
          onUpdate={async (field, value) => await updateFieldValue(field, value)}
          onUpdateProject={async (project) => await updateProject(project)}
        />

        {Platform.OS == 'ios' && <KeyboardSpacer style={{backgroundColor: 'black'}}/>}
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.creation,
    predefinedDraftId: ownProps.predefinedDraftId,
    api: state.app.api,
    issuePermissions: state.app.issuePermissions
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(createIssueActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateIssue);
