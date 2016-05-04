import React, {Navigator} from 'react-native';
import {createElement} from 'react';

/**
 * Route singleton
 */
class Router {
  constructor(navigator) {
    this._navigator = null;

    this.routes = {};
  }

  setNavigator(navigator) {
    this._navigator = navigator;
  }

  registerRoute({name, component, props, type, animation}) {
    this.routes[name] = {
      component,
      type,
      props,
      animation
    };

    if (!this[name]) {
      this[name] = (props) => this.navigate(name, props);
    }
  }

  navigate(routeName, props) {
    if (!this._navigator) {
      throw `call setNavigator(navigator) first!`;
    }

    if (!this.routes[routeName]) {
      throw `no such route ${routeName}`;
    }

    const newRoute = this.routes[routeName];
    newRoute.props = Object.assign({}, newRoute.props, props);

    if (newRoute.type === 'replace') {
      return this._navigator.replace(newRoute);
    }
    if (newRoute.type === 'reset') {
      return this._navigator.resetTo(newRoute);
    }

    return this._navigator.push(newRoute);
  }

  pop() {
    if (this._navigator.state.presentedIndex < 1) {
      return false;
    }
    this._navigator.pop();
    return true;
  }

  _getNavigator() {
    return this._navigator;
  }

  renderNavigatorView({initialRoute}) {
    return <Navigator
      initialRoute={initialRoute}
      configureScene={(route) => {
          return route.animation || Navigator.SceneConfigs.FloatFromRight;
        }
      }
      renderScene={(route, navigator) => {
          this.setNavigator(navigator);

          return createElement(route.component, route.props);
        }
      }
    />
  }
}

export default new Router();
