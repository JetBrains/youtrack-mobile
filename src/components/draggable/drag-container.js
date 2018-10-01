/**
 * Author: deanmcpherson
 * Copied from https://github.com/deanmcpherson/react-native-drag-drop
 */
import React from 'react';
import propTypes from 'prop-types';
import {
  View,
  PanResponder,
  Modal,
  Easing,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';

global.Easing = Easing;

const allOrientations = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right'
];

class DragModal extends React.Component {
  render() {
    return (
      <Modal transparent={true} supportedOrientations={allOrientations}>
        <TouchableWithoutFeedback onPressIn={this.props.drop}>
          <Animated.View style={this.props.location.getLayout()}>
            {this.props.content.children}
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

class DragContainer extends React.Component {
  constructor(props) {
    super(props);
    this.displayName = 'DragContainer';
    this.containerLayout;

    const location = new Animated.ValueXY();

    this.state = {
      location
    };
    this.dropZones = [];
    this.draggables = [];
    this.onDrag = this.onDrag.bind(this);
    this._handleDragging = this._handleDragging.bind(this);
    this._handleDrop = this._handleDrop.bind(this);
    this._listener = location.addListener(this._handleDragging);
    this.updateZone = this.updateZone.bind(this);
    this.removeZone = this.removeZone.bind(this);
  }

  static propTypes = {
    onDragStart: propTypes.func,
    onDragEnd: propTypes.func
  };

  componentWillUnmount() {
    if (this._listener) this.state.location.removeListener(this._listener);
  }

  getDragContext() {
    return {
      dropZones: this.dropZones,
      onDrag: this.onDrag,
      container: this.containerLayout,
      dragging: this.state.draggingComponent,
      updateZone: this.updateZone,
      removeZone: this.removeZone
    };
  }

  getChildContext() {
    return {dragContext: this.getDragContext()};
  }

  static childContextTypes = {
    dragContext: propTypes.any
  };

  updateZone(details) {
    const zone = this.dropZones.find(x => x.ref === details.ref);
    if (!zone) {
      this.dropZones.push(details);
    } else {
      const i = this.dropZones.indexOf(zone);
      this.dropZones.splice(i, 1, details);
    }
  }

  removeZone(ref) {
    const i = this.dropZones.find(x => x.ref === ref);
    if (i !== -1) {
      this.dropZones.splice(i, 1);
    }
  }

  inZone({x, y}, zone) {
    return (
      zone.x <= x &&
      zone.width + zone.x >= x &&
      zone.y <= y &&
      zone.height + zone.y >= y
    );
  }
  _addLocationOffset(point) {
    if (!this.state.draggingComponent) return point;
    return {
      x: point.x + this.state.draggingComponent.startPosition.width / 2,
      y: point.y + this.state.draggingComponent.startPosition.height / 2
    };
  }

  _handleDragging(point) {
    this._point = point;
    if (this._locked || !point) return;
    this.dropZones.forEach(zone => {
      if (this.inZone(point, zone)) {
        zone.onEnter(point);
      } else {
        zone.onLeave(point);
      }
    });
  }

  _handleDrop() {
    const hitZones = [];
    this.dropZones.forEach(zone => {
      if (!this._point) return;
      if (this.inZone(this._point, zone)) {
        hitZones.push(zone);
        zone.onDrop(this.state.draggingComponent.data);
      }
    });
    if (this.props.onDragEnd)
      this.props.onDragEnd(this.state.draggingComponent, hitZones);
    if (
      !hitZones.length &&
      this.state.draggingComponent &&
      this.state.draggingComponent.ref
    ) {
      this._locked = true;
      return Animated.timing(this.state.location, {
        duration: 400,
        easing: Easing.elastic(1),
        toValue: {
          x: 0, //this._offset.x - x,
          y: 0 //his._offset.y - y
        }
      }).start(() => {
        this._locked = false;
        this._handleDragging({x: -100000, y: -100000});
        this.setState({
          draggingComponent: null
        });
      });
    }
    this._handleDragging({x: -100000, y: -100000});
    this.setState({
      draggingComponent: null
    });
  }

  UNSAFE_componentWillMount() {
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: () => {
        if (this.state.draggingComponent) {
          this._handleDrop();
        }
        return false;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        !!this.state.draggingComponent,
      //        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderMove: (...args) =>
        Animated.event([
          null,
          {
            dx: this.state.location.x, // x,y are Animated.Value
            dy: this.state.location.y
          }
        ]).apply(this, args),
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (!this.state.draggingComponent) return;
        //Ensures we exit all of the active drop zones
        this._handleDrop();
      }
    });
  }

  onDrag(ref, children, data) {
    ref.measure((...args) => {
      if (this._listener) this.state.location.removeListener(this._listener);
      const location = new Animated.ValueXY();
      this._listener = location.addListener(args =>
        this._handleDragging(this._addLocationOffset(args))
      );
      this._offset = {x: args[4], y: args[5]};
      location.setOffset(this._offset);

      this.setState(
        {
          location,
          draggingComponent: {
            ref,
            data,
            children: React.Children.map(children, child => {
              return React.cloneElement(child, {dragging: true});
            }),
            startPosition: {
              x: args[4],
              y: args[5],
              width: args[2],
              height: args[3]
            }
          }
        },
        () => {
          if (this.props.onDragStart)
            this.props.onDragStart(this.state.draggingComponent);
        }
      );
    });
  }

  render() {
    return (
      <View
        style={[{flex: 1}, this.props.style]}
        onLayout={e => this.containerLayout = e.nativeEvent.layout}
        {...this._panResponder.panHandlers}
      >
        {this.props.children}
        {this.state.draggingComponent
          ? <DragModal
              content={this.state.draggingComponent}
              location={this.state.location}
              drop={this._handleDrop}
            />
          : null}
      </View>
    );
  }
}

export default DragContainer;
