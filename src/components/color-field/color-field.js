import React, {View, Text, StyleSheet, PropTypes} from 'react-native';

const SIZE = 22;

const COLORS = [
  {color: '#000',     backgroundColor: 'transparent', borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#cc0000',     borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#cc6600',     borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#339933',     borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#0066cc',     borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#a7007e',     borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#7b35db',     borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#00a1b4',     borderColor: 'transparent'},
  {color: '#FFF',     backgroundColor: '#8c1801',     borderColor: 'transparent'},
  {color: '#000',     backgroundColor: '#f294ff',     borderColor: 'transparent'},
  {color: '#000',     backgroundColor: '#bef624',     borderColor: 'transparent'},
  {color: '#000',     backgroundColor: '#ffc600',     borderColor: 'transparent'},
  {color: '#000',     backgroundColor: '#ffcccc',     borderColor: 'transparent'},
  {color: '#000',     backgroundColor: '#ffea73',     borderColor: 'transparent'},
  {color: '#000',     backgroundColor: '#d9ffc8',     borderColor: 'transparent'},
  {color: '#000',     backgroundColor: '#ccffff',     borderColor: 'transparent'},
  {color: '#64992C',  backgroundColor: 'transparent', borderColor: 'transparent'},
  {color: '#64992C',  backgroundColor: '#ebf4dd',     borderColor: 'transparent'},
  {color: '#cc0000',  backgroundColor: '#f0f2f3',     borderColor: 'transparent'},
  {color: '#cc0000',  backgroundColor: '#ffe3e3',     borderColor: 'transparent'},
  {color: '#cc0000',  backgroundColor: '#ffe3e3',     borderColor: '#cc0000'}
]

export default class ColorField extends React.Component {
  _getColorById(id) {
    return COLORS[id];
  }
  _getBackgroundColor() {
    return this.props.field.color && this._getColorById(this.props.field.color.id).backgroundColor;
  }

  _getForegroundColor() {
    return this.props.field.color && this._getColorById(this.props.field.color.id).color;
  }

  _getBorderColor() {
    return this.props.field.color && this._getColorById(this.props.field.color.id).borderColor;
  }

  _getFieldLetter() {
    return this.props.field.name.substr(0, 1);
  }

  render() {
    return (
      <View style={[styles.wrapper, {backgroundColor: this._getBackgroundColor(), borderColor: this._getBorderColor()}]}>
        <Text style={[styles.text, {color: this._getForegroundColor()}]}>{this._getFieldLetter()}</Text>
      </View>
    );
  }
}

ColorField.propTypes = {
  field: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    borderRadius: 4,
    flex: 1,
    borderWidth: 1,
    justifyContent: 'center'
  },
  text: {
    fontSize: 12,
    textAlign: 'center'
  }
});
