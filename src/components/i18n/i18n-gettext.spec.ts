import gt from './i18n-gettext';
describe('i18n', () => {
  it('should get node-gettext singleton', () => {
    expect(gt).toBeDefined();
    expect(typeof gt.gettext).toEqual('function');
    expect(typeof gt.ngettext).toEqual('function');
  });
});
