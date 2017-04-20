const ISSUES_LIST = 'issue-list';

module.exports = {
  refresh: async () => {
    await element(by.id(ISSUES_LIST)).scrollTo('top');
    await element(by.id(ISSUES_LIST)).swipe('down', 'slow');
  },

  search: async (query) => {
    await element(by.id('query-assist-input')).tap();
    await element(by.id('query-assist-input')).typeText(`${query}\n`);
  }
};
