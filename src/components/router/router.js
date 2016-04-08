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

  registerRoute({name, component, type, animation}) {
    this.routes[name] = {
      component,
      type,
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
    newRoute.props = newRoute.props || props;

    if (newRoute.type === 'replace') {
      return this._navigator.replace(newRoute);
    }
    if (newRoute.type === 'reset') {
      return this._navigator.resetTo(newRoute);
    }

    return this._navigator.push(newRoute);
  }

  pop() {
    return this._navigator.pop();
  }

  _getNavigator() {
    return this._navigator;
  }
}

export default new Router();
