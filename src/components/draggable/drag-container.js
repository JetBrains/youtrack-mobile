/* @flow */
/**
 * Original author: deanmcpherson
 * Modification of https://github.com/deanmcpherson/react-native-drag-drop
 */
import React, {Component} from 'react';
import {
  View,
  PanResponder,
  Modal,
  Easing,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';

import type {ZoneInfo} from './drop-zone';

export const DragContext = React.createContext();

class DragModal extends Component<any, void> {
  render() {
    return (
      <Modal transparent>
        <TouchableWithoutFeedback onPressIn={this.props.drop}>
          <Animated.View style={this.props.location.getLayout()}>
            {this.props.content.children}
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

type Props = {
  onDragStart: Function,
  reportOnDrop: Function,
  onDragEnd: (?Object, Array<ZoneInfo>) => any,
  style?: any,
  children?: any
}

type State = {
  location: Animated.ValueXY,
  draggingComponent: ?Object
}

class DragContainer extends Component<Props, State> {
  containerLayout = null;
  _listener: string;
  _point: ?{x: number, y: number} = null;
  _offset: ?{x: number, y: number} = null;
  _locked: boolean = false;
  _panResponder: PanResponder;

  state = {
    location: new Animated.ValueXY(),
    draggingComponent: null
  };

  dropZones = [];
  draggables = [];

  constructor(props: Props) {
    super(props);

    this._listener = this.state.location.addListener(this._handleDragging);
  }

  componentWillUnmount() {
    if (this._listener) this.state.location.removeListener(this._listener);
  }

  reportOnDrag: Function = () => {};
  reportOnDrop: Function = () => {};

  getDragContext() {
    return {
      dropZones: this.dropZones,
      onInitiateDrag: this.onInitiateDrag,
      container: this.containerLayout,
      dragging: this.state.draggingComponent || null,
      updateZone: this.updateZone,
      removeZone: this.removeZone,
      registerOnDrag: this.registerOnDrag,
      registerOnDrop: this.registerOnDrop
    };
  }

  updateZone = (details: ZoneInfo) => {
    const zone = this.dropZones.find(x => x.ref === details.ref);
    if (!zone) {
      this.dropZones.push(details);
    } else {
      const i = this.dropZones.indexOf(zone);
      this.dropZones.splice(i, 1, details);
    }
  }

  removeZone = (ref: Object) => {
    this.dropZones = this.dropZones.filter(z => z.ref !== ref);
  }

  inZone({x, y}: {x: number, y: number}, zone: ZoneInfo) {
    return (
      zone.x <= x &&
      zone.width + zone.x >= x &&
      zone.y <= y &&
      zone.height + zone.y >= y
    );
  }

  registerOnDrag = (onDrag: Function) => {
    this.reportOnDrag = onDrag;
  };

  registerOnDrop = (onDrop: Function) => {
    this.reportOnDrop = onDrop;
  }

  _addLocationOffset(cornerPoint) {
    if (!this.state.draggingComponent) {
      return cornerPoint;
    }
    const {startPosition} = this.state.draggingComponent;
    return {
      x: cornerPoint.x + startPosition.width / 2,
      y: cornerPoint.y + startPosition.height / 2
    };
  }

  _handleDragging = point => {
    this._point = point;
    if (this._locked || !point) {
      return;
    }

    this.dropZones.forEach(zone => {
      if (this.inZone(point, zone)) {
        zone.onMoveOver(point, zone);
      } else {
        zone.onLeave(point);
      }
    });
  }

  _handleDrop = () => {
    this.reportOnDrop();

    const hitZones = [];
    this.dropZones.forEach(zone => {
      if (!this._point) {
        return;
      }
      if (this.inZone(this._point, zone)) {
        hitZones.push(zone);
        zone.onDrop(this.state.draggingComponent?.data);
      }
    });

    if (this.props.onDragEnd) {
      this.props.onDragEnd(this.state.draggingComponent, hitZones);
    }

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
        this.setState({
          draggingComponent: null
        });
      });
    }

    this.setState({draggingComponent: null});
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

  onInitiateDrag = (ref: Object, children: any, data: Object) => {
    ref.measure((x, y, width, height, pageX, pageY) => {
      if (this._listener) {
        this.state.location.removeListener(this._listener);
      }
      const location = new Animated.ValueXY();
      this._listener = location.addListener(cornerPoint => {
        this._handleDragging(this._addLocationOffset(cornerPoint));

        this.reportOnDrag({
          point: cornerPoint,
          width: this.state.draggingComponent?.startPosition.width,
          height: this.state.draggingComponent?.startPosition.width,
        });
      });
      this._offset = {x: pageX, y: pageY};
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
              x: pageX,
              y: pageY,
              width,
              height
            }
          }
        },
        () => {
          if (this.props.onDragStart){
            this.props.onDragStart(this.state.draggingComponent);
          }
        }
      );
    });
  }

  render() {
    return (
      <DragContext.Provider value={this.getDragContext()}>
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
      </DragContext.Provider>
    );
  }
}

export default DragContainer;
