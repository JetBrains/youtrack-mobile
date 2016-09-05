import {decorateIssueLinks, replaceImageNamesWithUrls, decorateUserNames} from './wiki__raw-text-decorator';

describe('decorateIssueLinks', () => {
  const rawTextWithIds = 'foo barr YTM-14 bar foo';
  const wikifiedText = `foo barr <a href="/issue/YTM-14" class="issue-resolved" target="_self" title="Fake issue summary">YTM-14</a> bar foo`;

  it('should replace single issue ID with special syntax', () => {
    const result = decorateIssueLinks(rawTextWithIds, wikifiedText);

    result.should.equal('foo barr [ytmissue]YTM-14|Fake issue summary[ytmissue] bar foo');
  });

  it('should replace exactly that issue id ant not before or after', () => {
    const raw = 'foo barr http://foo/YTM-14 asd YTM-14 bar foo';
    const wiki = `foo barr http://foo/YTM-14 asd <a href="/issue/YTM-14" class="issue-resolved" target="_self" title="Fake issue summary">YTM-14</a> bar foo`;
    const result = decorateIssueLinks(raw, wiki);

    result.should.equal('foo barr http://foo/YTM-14 asd [ytmissue]YTM-14|Fake issue summary[ytmissue] bar foo');
  });

  it('should not touch ID if no link found', () => {
    const result = decorateIssueLinks(rawTextWithIds, '');

    result.should.equal(rawTextWithIds);
  });

  it('should decorate multiple issue IDs', () => {
    const result = decorateIssueLinks(`foo barr Y-15 bar JT-123`,
      `foo barr 
        <a href="/issue/Y-15" class="issue-resolved" target="_self" title="Fake issue summary">Y-15</a> 
        bar <a href="/issue/JT-123" class="issue-resolved" target="_self" title="Another summary">JT-123</a>`);


    result.should.equal('foo barr [ytmissue]Y-15|Fake issue summary[ytmissue] bar [ytmissue]JT-123|Another summary[ytmissue]');
  });
});


describe('replaceImageNamesWithUrls', () => {
  const rawTextWithIds = 'foo bar !atTach123.png! tes';
  const attachments = [
    {
      name: 'atTach123.png',
      url: 'http://foo.bar/attach.png'
    }, {
      name: 'with spaces .png',
      url: 'http://url.png'
    }, {
      name: 'with Русские symbols.png',
      url: 'http://russian-image.png'
    }, {
      name: 'foo 123.123,123.png',
      url: 'http://dot-image.png'
    }
  ];

  it('should replace images with it\'s URL using urls from attaches', () => {
    const result = replaceImageNamesWithUrls(rawTextWithIds, attachments);

    result.should.equal('foo bar !http://foo.bar/attach.png! tes');
  });

  it('should support images with spaces in name', () => {
    const result = replaceImageNamesWithUrls('foo bar !with spaces .png! tes', attachments);

    result.should.equal('foo bar !http://url.png! tes');
  });

  it('should support images with spaces in name', () => {
    const result = replaceImageNamesWithUrls('foo bar !with Русские symbols.png! tes', attachments);

    result.should.equal('foo bar !http://russian-image.png! tes');
  });

  it('should support images with dots and commas in name', () => {
    const result = replaceImageNamesWithUrls('foo bar !foo 123.123,123.png! tes', attachments);

    result.should.equal('foo bar !http://dot-image.png! tes');
  });
});

describe('decorateUserNames', () => {
  const rawTextWithIds = 'foo barr @userlogin bar foo';
  const wikifiedText = `foo barr <a href="/user/userlogin" title="userlogin">Mr. User Userson</a> bar foo`;

  it('should replace single issue ID with special syntax', () => {
    const result = decorateUserNames(rawTextWithIds, wikifiedText);

    result.should.equal('foo barr [ytmuser]userlogin|Mr. User Userson[ytmuser] bar foo');
  });
});
