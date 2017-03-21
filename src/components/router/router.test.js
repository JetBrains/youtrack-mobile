import Router from './router';
import sinon from 'sinon';

describe('Router', () => {
  let fakeNavigator;

  beforeEach(() => {
    fakeNavigator = {
      dispatch: sinon.spy()
    };
    Router.setNavigator(fakeNavigator);
  });

  it('should init', () => {
    Router.should.be.defined;
  });

  it('should accept navigator instance', () => {
    Router.setNavigator(fakeNavigator);
    Router._navigator.should.equal(fakeNavigator);
  });

  it('should register route', () => {
    Router.registerRoute({
      name: 'foo',
      component: {barr: 'bar'},
      modal: true,
      props: {some: 'prop'}
    });
    Router.routes.foo.screen.should.be.defined;
    Router.routes.foo.modal.should.be.true;
    Router.routes.foo.props.some.should.equal('prop');
  });

  it('should allow to call route right on Router', () => {
    Router.registerRoute({
      name: 'foo',
      component: {barr: 'bar'},
      animation: 'fake-animation'
    });

    Router.foo();

    fakeNavigator.dispatch.should.have.been.called;
  });

  it('should navigate', () => {
    Router.registerRoute({
      name: 'foo'
    });

    Router.navigate('foo');

    fakeNavigator.dispatch.should.have.been.called;
  });
});
