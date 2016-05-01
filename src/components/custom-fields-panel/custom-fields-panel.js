import React, {View, ScrollView, PropTypes} from 'react-native';
import CustomField from '../custom-field/custom-field';
import Select from '../select/select';

import styles from './custom-fields-panel.styles';

export default class CustomFieldsPanel extends React.Component {
  constructor() {
    super();

    this.state = {
      topCoord: 0,
      height: 0,

      select: {
        show: false,
        dataSource: null,
        onSelect: null,
        multi: false,
        selectedItems: []
      }
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.refs.panel.measure( (fx, fy, width, height, px, py) => {
        this.setState({topCoord: py, height: height});
      });
    }, 0);
  }

  onSelectProject() {
    this.setState({
      select: {
        show: true,
        dataSource: this.props.api.getProjects.bind(this.props.api),
        onSelect: project => {
          this.setState({select: {show: false}});
          return this.props.onUpdateProject(project);
        }
      }
    });
  }

  onEditField(field) {
    this.setState({select: {show: false}});
    const isMultiValue = field.projectCustomField.field.fieldType.isMultiValue;
    let selectedItems = isMultiValue ? field.value : [field.value];
    selectedItems = selectedItems.filter(it => it !== null);

    this.setState({
      select: {
        show: true,
        multi: isMultiValue,
        selectedItems: selectedItems,
        emptyValue: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        dataSource: (query) => {
          if (field.hasStateMachine) {
            return this.props.api.getStateMachineEvents(this.props.issueId, field.id)
              .then(items => items.map(it => Object.assign(it, {name: `${it.id} (${it.presentation})`})))
          }
          return this.props.api.getCustomFieldValues(field.projectCustomField.bundle.id, field.projectCustomField.field.fieldType.valueType)
            .then(res => res.aggregatedUsers || res.values);
        },
        onSelect: (value) => {
          this.setState({select: {show: false}});
          return this.props.onUpdate(field, value);
        }
      }
    });
  }

  _renderSelect() {
    const config = this.state.select;
    if (config.show) {
      return <Select
        style={{
          top: -this.state.topCoord,
          bottom: this.state.height
        }}
        height={this.state.topCoord}
        title="Select item"
        api={this.props.api}
        dataSource={config.dataSource}
        onSelect={config.onSelect}
        multi={config.multi}
        selectedItems={config.selectedItems}
        emptyValue={config.emptyValue}
        onCancel={() => this.setState({select: {show: false}})}
        getTitle={(item) => item.fullName || item.name || item.login}
      />;
    }
  }

  render() {
    const issue = this.props.issue;

    return (
      <View ref="panel">
        {this._renderSelect()}

        <ScrollView horizontal={true} style={styles.customFieldsPanel}>
          <CustomField key="Project"
                       disabled={!this.props.canEditProject}
                       onPress={() => this.onSelectProject()}
                       field={{projectCustomField: {field: {name: 'Project'}}, value: {name: issue.project.shortName}}}/>

          {issue.fields.map((field) => <CustomField
            key={field.id}
            field={field}
            onPress={() => this.onEditField(field)}
            disabled={!this.props.issuePermissions.canUpdateField(issue, field)}/>)}
        </ScrollView>
      </View>
    );
  }
}

CustomFieldsPanel.propTypes = {
  api: PropTypes.object.isRequired,
  issue: PropTypes.object.isRequired,
  issuePermissions: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onUpdateProject: PropTypes.func,
  canEditProject: PropTypes.bool
};
