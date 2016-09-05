
function decorateIssueLink(issueId, issueSummary) {
  return `[ytmissue]${issueId}|${issueSummary}[ytmissue]`;
}

function decorateUserName(login, username) {
  return `[ytmuser]${login}|${username}[ytmuser]`;
}

export function decorateIssueLinks(rawText, wikifiedText) {
  const issueLinkRegExp = /<a href=".*?issue.*?title="(.*?)".*?>(.*?)<\/a>/ig;

  const issuesMap = new Map();

  function onIssueIdDetected(linkTag, issueSummary, issueId) {
    issuesMap.set(issueId, issueSummary);
  }
  wikifiedText.replace(issueLinkRegExp, onIssueIdDetected);

  issuesMap.forEach((issueSummary, issueId) => {
    rawText = rawText.replace(new RegExp(`(\\s|^)(${issueId})(\\s|$)`, 'g'), (source, prefix, issueId, postfix) => {
      const decorated = decorateIssueLink(issueId, issuesMap.get(issueId));
      return `${prefix || ''}${decorated}${postfix || ''}`;
    });
  });

  return rawText;
}

export function decorateUserNames(rawText, wikifiedText) {
  const userLoginRegexp = /<a href="\/user.*?title="(.*?)">(.*?)<\/a>/ig;

  const issuesMap = new Map();

  function onUserLoginDetected(linkTag, login, username) {
    issuesMap.set(login, username);
  }
  wikifiedText.replace(userLoginRegexp, onUserLoginDetected);

  issuesMap.forEach((username, login) => {
    rawText = rawText.replace(new RegExp(`@${login}`), decorateUserName(login, username));
  });

  return rawText;
}

export function replaceImageNamesWithUrls(source, attachments) {
  const ImageRegExp = /![a-zа-я\d.,\s-]+?\.[a-zA-Z]+?!/ig;

  return source.replace(ImageRegExp, (imageName) => {
    const attach = attachments.filter(a => `!${a.name}!` === imageName)[0];
    if (attach) {
      return `!${attach.url}!`;
    }
    return imageName;
  });
}
