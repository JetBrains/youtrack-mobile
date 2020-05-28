import Router from './router';

describe('Router', () => {
  let navigatorMock;

  beforeEach(() => {
    navigatorMock = {
      dispatch: jest.fn()
    };
    Router.setNavigator(navigatorMock);
  });


  describe('Create', () => {
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
        component: {barr: componentNameMock},
        modal: modalParamMock,
        props: {[propNameMock]: propsMock}
      });

      expect(Router.routes.foo.screen).toBeDefined();
      expect(Router.routes.foo.modal).toEqual(modalParamMock);
      expect(Router.routes.foo.props[propNameMock]).toEqual(propsMock);
    });

    it('should allow to call route right on Router', () => {
      Router.registerRoute({
        name: routeNameMock,
        component: {barr: componentNameMock},
        animation: 'fake-animation'
      });

      Router.foo();

      expect(navigatorMock.dispatch).toHaveBeenCalled();
    });

    it('should navigate', () => {
      Router.registerRoute({
        name: routeNameMock
      });

      Router.navigate(routeNameMock);

      expect(navigatorMock.dispatch).toHaveBeenCalled();
    });
  });

});
