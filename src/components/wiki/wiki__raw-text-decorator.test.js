import {decorateIssueLinks} from './wiki__raw-text-decorator';

describe('IssueLinksDecorator', function () {
  const rawTextWithIds = 'foo barr YTM-14 bar foo'
  const wikifiedText = `foo barr <a href="/issue/YTM-14" class="issue-resolved" target="_self" title="Fake issue summary">YTM-14</a> bar foo`;

  it('should replace single issue ID with special syntax', () => {
    const result = decorateIssueLinks(rawTextWithIds, wikifiedText);

    result.should.equal('foo barr [ytmissue]YTM-14|Fake issue summary[ytmissue] bar foo')
  });

  it('should not touch ID if no link found', () => {
    const result = decorateIssueLinks(rawTextWithIds, '');

    result.should.equal(rawTextWithIds)
  });

  it('should decorate multiple issue IDs', () => {
    const result = decorateIssueLinks(`foo barr Y-15 bar JT-123`,
      `foo barr 
        <a href="/issue/Y-15" class="issue-resolved" target="_self" title="Fake issue summary">Y-15</a> 
        bar <a href="/issue/JT-123" class="issue-resolved" target="_self" title="Another summary">JT-123</a>`);


    result.should.equal('foo barr [ytmissue]Y-15|Fake issue summary[ytmissue] bar [ytmissue]JT-123|Another summary[ytmissue]')
  });
});
