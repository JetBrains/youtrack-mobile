import {View, ScrollView, Text, TouchableOpacity, TextInput, findNodeHandle} from 'react-native';
import React, {PropTypes} from 'react';
import CalendarPicker from 'react-native-calendar-picker/CalendarPicker/CalendarPicker';
import CustomField from '../custom-field/custom-field';
import Select from '../select/select';
import Header from '../header/header';
import {COLOR_PINK} from '../../components/variables/variables';

import styles from './custom-fields-panel.styles';

export default class CustomFieldsPanel extends React.Component {
  constructor() {
    super();

    this.state = {
      topCoord: 0,
      height: 0,
      editingField: null,
      isEditingProject: false,

      select: {
        show: false,
        dataSource: null,
        onSelect: null,
        multi: false,
        selectedItems: []
      },

      datePicker: {
        show: false,
        title: null,
        value: null,
        onSelect: () => {
        }
      },

      period: {
        show: false,
        value: null,
        onApply: () => {}
      }
    };
  }

  componentDidMount() {
    setTimeout(() => {
      /**
       * TODO https://github.com/facebook/react-native/issues/4753
       * This container requires because just measure always returns 0 for android
       */
      const container = this.props.containerViewGetter();
      this.refs.panel.measureLayout(findNodeHandle(container),
        (x, y, width, height, pageX, pageY) => {
          this.setState({topCoord: y, height: height});
        }
      );
    }, 0);
  }

  onSelectProject() {
    if (this.state.isEditingProject) {
      return this.closeEditor();
    }

    this.closeEditor();
    this.setState({
      isEditingProject: true,
      select: {
        show: true,
        dataSource: this.props.api.getProjects.bind(this.props.api),
        onSelect: project => {
          this.closeEditor();
          return this.props.onUpdateProject(project);
        }
      }
    });
  }

  closeEditor() {
    return this.setState({
      editingField: null,
      isEditingProject: false,
      datePicker: {show: false},
      select: {show: false},
      period: {show: false}
    });
  }

  editDateField(field) {
    return this.setState({
      datePicker: {
        show: true,
        title: field.projectCustomField.field.name,
        value: field.value ? new Date(field.value) : new Date(),
        emptyValueName: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        onSelect: (date) => {
          this.closeEditor();
          return this.props.onUpdate(field, date ? date.getTime() : null);
        }
      }
    });
  }

  editPeriodField(field) {
    return this.setState({
      period: {
        show: true,
        value: field.value ? field.value.presentation : null,
        onApply: (value) => {
          this.closeEditor();
          return this.props.onUpdate(field, {presentation: value});
        }
      }
    });
  }

  editCustomField(field) {
    const isMultiValue = field.projectCustomField.field.fieldType.isMultiValue;
    let selectedItems;
    if (isMultiValue) {
      selectedItems = field.value;
    } else {
      selectedItems = field.value ? [field.value] : [];
    }

    return this.setState({
      select: {
        show: true,
        multi: isMultiValue,
        selectedItems: selectedItems,
        emptyValue: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        dataSource: (query) => {
          if (field.hasStateMachine) {
            return this.props.api.getStateMachineEvents(this.props.issue.id, field.id)
              .then(items => items.map(it => Object.assign(it, {name: `${it.id} (${it.presentation})`})))
          }
          return this.props.api.getCustomFieldValues(field.projectCustomField.bundle.id, field.projectCustomField.field.fieldType.valueType)
            .then(res => res.aggregatedUsers || res.values);
        },
        onSelect: (value) => {
          this.closeEditor();
          return this.props.onUpdate(field, value);
        }
      }
    });
  }

  onEditField(field) {
    if (field === this.state.editingField) {
      return this.closeEditor();
    }

    this.closeEditor();
    this.setState({editingField: field});

    if (field.projectCustomField.field.fieldType.valueType === 'date') {
      return this.editDateField(field);
    }

    if (field.projectCustomField.field.fieldType.valueType === 'period') {
      return this.editPeriodField(field);
    }

    return this.editCustomField(field);
  }

  _renderSelect() {
    if (!this.state.select.show) {
      return;
    }

    return <Select
      {...this.state.select}
      style={{
          top: -this.state.topCoord,
          bottom: this.state.height
        }}
      height={this.state.topCoord}
      title="Select item"
      api={this.props.api}
      onCancel={() => this.closeEditor()}
      getTitle={(item) => item.fullName || item.name || item.login}
    />;
  }

  _renderDatePicker() {
    if (!this.state.datePicker.show) {
      return;
    }

    return (
      <View style={[styles.editorViewContainer, {
          top: -this.state.topCoord,
          bottom: this.state.height
      }]}>
        <Header
          leftButton={<Text>Cancel</Text>}
          rightButton={<Text></Text>}
          onBack={() => this.closeEditor()}>
          <Text>{this.state.datePicker.title}</Text>
        </Header>
        <View style={styles.calendar}>
          {this.state.datePicker.emptyValueName &&
          <TouchableOpacity onPress={() => this.state.datePicker.onSelect(null)}>
            <Text style={styles.clearDate}>{this.state.datePicker.emptyValueName} (Clear value)</Text>
          </TouchableOpacity>}

          <CalendarPicker
            selectedDate={this.state.datePicker.value}
            startFromMonday={true}
            onDateChange={date => {
              if (this.state.datePicker.value.getMonth() !== date.getMonth()) {
                this.state.datePicker.value = date;
                return this.setState({datePicker: this.state.datePicker});
              }
              return this.state.datePicker.onSelect(date);
            }}
            selectedDayColor={COLOR_PINK}
            selectedDayTextColor="#FFF"/>
        </View>
      </View>
    );
  }

  _renderPeriodInput() {
    if (!this.state.period.show) {
      return;
    }

    return (
      <View style={[styles.editorViewContainer, {
          top: -this.state.topCoord,
          bottom: this.state.height
      }]}>
        <Header
          leftButton={<Text>Cancel</Text>}
          onBack={() => this.closeEditor()}>
          <Text>{this.state.editingField.projectCustomField.field.name}</Text>
        </Header>
        <View>
          <TextInput
            style={styles.periodInput}
            placeholder="1w 1d 1h 1m"
            clearButtonMode="always"
            returnKeyType="done"
            autoCorrect={false}
            autoFocus={true}
            autoCapitalize="none"
            onChangeText={(text) => {
              this.state.period.value = text;
              this.forceUpdate();
            }}
            onSubmitEditing={() => this.state.period.onApply(this.state.period.value)}
            value={this.state.period.value}/>
        </View>
      </View>
    );
  }

  render() {
    const issue = this.props.issue;

    return (
      <View ref="panel">
        {this._renderSelect()}

        {this._renderDatePicker()}

        {this._renderPeriodInput()}

        <ScrollView horizontal={true} style={styles.customFieldsPanel}>
          <CustomField key="Project"
                       disabled={!this.props.canEditProject}
                       onPress={() => this.onSelectProject()}
                       active={this.state.isEditingProject}
                       field={{projectCustomField: {field: {name: 'Project'}}, value: {name: issue.project.shortName}}}/>

          {issue.fields.map((field) => <CustomField
            key={field.id}
            field={field}
            onPress={() => this.onEditField(field)}
            active={this.state.editingField === field}
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
  containerViewGetter: PropTypes.func.isRequired,
  canEditProject: PropTypes.bool
};
