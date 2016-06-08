
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
