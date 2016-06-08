
function decorateIssueLink(issueId, issueSummary) {
  return `[ytmissue]${issueId}|${issueSummary}[ytmissue]`;
}

export function decorateIssueLinks(rawText, wikifiedText) {
  const issueLinkRegExp = /<a href="\/issue.*?title="(.*?)".*?>(.*?)<\/a>/ig;

  const issuesMap = new Map();

  function onIssueIdDetected(linkTag, issueSummary, issueId) {
    issuesMap.set(issueId, issueSummary);
  }
  wikifiedText.replace(issueLinkRegExp, onIssueIdDetected);

  issuesMap.forEach((issueSummary, issueId) => {
    rawText = rawText.replace(new RegExp(issueId), decorateIssueLink(issueId, issuesMap.get(issueId)));
  })

  return rawText;
}

export function replaceImageNamesWithUrls(source, attachments) {
  const ImageRegExp = /![a-zа-я\d.,\s-]+?\.[a-zA-Z]+?!/ig;

  return source.replace(ImageRegExp, (imageName) => {
    let attach = attachments.filter(a => `!${a.name}!` === imageName)[0];
    if (attach) {
      return `!${attach.url}!`;
    }
    return imageName;
  });
}
