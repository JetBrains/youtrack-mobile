import Router from './router';
import {routeMap} from '../../app-routes';
describe('Router', () => {
  let navigatorMock;
  beforeEach(() => {
    navigatorMock = {
      dispatch: jest.fn(),
    };
    Router.setNavigator(navigatorMock);
  });
  describe('Singleton', () => {
    beforeEach(() => {
      navigatorMock = {};
    });
    it('should create a Singleton', () => {
      expect(Router).toBeDefined();
    });
    it('should set an instance', () => {
      Router.setNavigator(navigatorMock);
      expect(Router._navigator).toEqual(navigatorMock);
    });
  });
  describe('Routes', () => {
    const routeNameMock = 'foo';
    const componentNameMock = 'bar';
    const propsMock = 'prop';
    it('should register route', () => {
      const modalParamMock = true;
      const propNameMock = 'someProp';
      Router.registerRoute({
        name: routeNameMock,
        component: {
          barr: componentNameMock,
        },
        modal: modalParamMock,
        props: {
          [propNameMock]: propsMock,
        },
      });
      expect(Router.routes.foo.screen).toBeDefined();
      expect(Router.routes.foo.modal).toEqual(modalParamMock);
      expect(Router.routes.foo.props[propNameMock]).toEqual(propsMock);
    });
    describe('Navigation', () => {
      it('should allow to call route', () => {
        Router.registerRoute({
          name: routeNameMock,
          component: {
            barr: componentNameMock,
          },
          animation: 'fake-animation',
        });
        Router.foo();
        expect(navigatorMock.dispatch).toHaveBeenCalled();
      });
      it('should navigate', () => {
        Router.registerRoute({
          name: routeNameMock,
        });
        Router.navigate(routeNameMock);
        expect(navigatorMock.dispatch).toHaveBeenCalled();
      });
      it('should push a new screen when forceNew is set', () => {
        Router.registerRoute({name: routeNameMock});
        Router.navigate(routeNameMock, {forceNew: true});
        expect(navigatorMock.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'Navigation/PUSH',
            routeName: routeNameMock,
          }),
        );
      });
      it('should reset to [root, target] when resetWithRoot is called', () => {
        Router.registerRoute({name: 'rootFoo'});
        Router.registerRoute({name: 'targetBar'});
        Router.resetWithRoot('rootFoo', 'targetBar', {id: 'X-1'});
        expect(navigatorMock.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'Navigation/RESET',
            index: 1,
            actions: [
              expect.objectContaining({routeName: 'rootFoo'}),
              expect.objectContaining({
                routeName: 'targetBar',
                params: expect.objectContaining({id: 'X-1'}),
              }),
            ],
          }),
        );
      });
      describe('while a transition is in progress', () => {
        afterEach(() => {
          Router._isTransitioning = false;
          Router._pendingNavigation = null;
        });
        it('should dispatch a reset navigation (e.g. logout) instead of swallowing it', () => {
          Router.registerRoute({name: routeNameMock, type: 'reset'});
          Router._isTransitioning = true;
          Router.navigate(routeNameMock);
          expect(navigatorMock.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({type: 'Navigation/RESET'}),
          );
        });
        it('should dispatch a forceReset navigation instead of swallowing it', () => {
          Router.registerRoute({name: routeNameMock});
          Router._isTransitioning = true;
          Router.navigate(routeNameMock, {}, {forceReset: true});
          expect(navigatorMock.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({type: 'Navigation/RESET'}),
          );
        });
        it('should dispatch resetWithRoot instead of swallowing it', () => {
          Router.registerRoute({name: 'rootFoo'});
          Router.registerRoute({name: 'targetBar'});
          Router._isTransitioning = true;
          Router.resetWithRoot('rootFoo', 'targetBar');
          expect(navigatorMock.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({type: 'Navigation/RESET'}),
          );
        });
        it('should still queue a non-reset navigate (push) to avoid rapid pushes', () => {
          Router.registerRoute({name: routeNameMock});
          Router._isTransitioning = true;
          Router.navigate(routeNameMock);
          expect(navigatorMock.dispatch).not.toHaveBeenCalled();
          expect(typeof Router._pendingNavigation).toBe('function');
        });
      });
    });
    describe('transition watchdog', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      afterEach(() => {
        Router._isTransitioning = false;
        Router._pendingNavigation = null;
        if (Router._transitionWatchdog) {
          clearTimeout(Router._transitionWatchdog);
          Router._transitionWatchdog = null;
        }
        jest.useRealTimers();
      });
      it('clears a stuck _isTransitioning and flushes pending nav if onTransitionEnd is missed', () => {
        Router.registerRoute({name: routeNameMock});
        // Simulate a transition start that never gets a matching end.
        Router._isTransitioning = true;
        Router._transitionWatchdog = setTimeout(() => Router._endTransition(), 1000);
        // A push arrives mid-transition and is queued.
        Router.navigate(routeNameMock);
        expect(navigatorMock.dispatch).not.toHaveBeenCalled();
        expect(typeof Router._pendingNavigation).toBe('function');
        // The end event never fires; the watchdog fires instead.
        jest.advanceTimersByTime(1000);
        expect(Router._isTransitioning).toBe(false);
        expect(navigatorMock.dispatch).toHaveBeenCalled();
        expect(Router._pendingNavigation).toBeNull();
      });
      it('_endTransition clears the flag, watchdog and flushes pending nav', () => {
        Router.registerRoute({name: routeNameMock});
        Router._isTransitioning = true;
        Router._transitionWatchdog = setTimeout(() => {}, 1000);
        Router._pendingNavigation = jest.fn();
        const pending = Router._pendingNavigation;
        Router._endTransition();
        expect(Router._isTransitioning).toBe(false);
        expect(Router._transitionWatchdog).toBeNull();
        expect(pending).toHaveBeenCalled();
        expect(Router._pendingNavigation).toBeNull();
      });
    });
  });
  describe('Dispatch callbacks', () => {
    let callback;
    beforeEach(() => {
      callback = jest.fn();
      Router.setOnDispatchCallback(callback);
    });
    it('should set on dispatch callback', () => {
      expect(Router.onDispatchCallbacks).toHaveLength(1);
      expect(Router.onDispatchCallbacks[0]).toEqual(callback);
    });
    it('should invoke a callback on dispatch', () => {
      const routeNameMock = 'mainROOT';
      const routeNameMock2 = 'mainROOT';
      const prevRouteNameMock = undefined;
      const options = undefined;
      Router.registerRoute({
        name: routeNameMock,
      });
      Router.registerRoute({
        name: routeNameMock2,
      });
      Router.navigate(routeNameMock);
      expect(callback).toHaveBeenCalledWith(
        routeNameMock,
        prevRouteNameMock,
        options,
      );
    });
  });
  describe('hasNoParentRoute', () => {
    it('should return TRUE if there is only one route left', () => {
      jest.spyOn(Router, 'getRoutes').mockReturnValueOnce([{}]);
      expect(Router.hasNoParentRoute()).toEqual(true);
    });
    it('should return TRUE if prev route is a `Home`', () => {
      jest.spyOn(Router, 'getRoutes').mockReturnValueOnce([
        {
          routeName: routeMap.Home,
        },
        {},
      ]);
      expect(Router.hasNoParentRoute()).toEqual(true);
    });
    it('should return FALSE if prev route is not a `Home`', () => {
      jest.spyOn(Router, 'getRoutes').mockReturnValueOnce([
        {
          routeName: routeMap.Issues,
        },
        {},
      ]);
      expect(Router.hasNoParentRoute()).toEqual(false);
    });
    it('should return FALSE if there are more than one route left', () => {
      jest.spyOn(Router, 'getRoutes').mockReturnValueOnce([{}, {}, {}]);
      expect(Router.hasNoParentRoute()).toEqual(false);
    });
  });
});
