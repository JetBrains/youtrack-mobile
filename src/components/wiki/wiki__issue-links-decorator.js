const issueLinkRegExp = /<a href="\/issue.*?title="(.*?)".*?>(.*?)<\/a>/ig;

function decorateIssue(issueId, issueSummary) {
  return `[ytmissue]${issueId}|${issueSummary}[ytmissue]`;
}

export default function decorateIssueLinks(rawText, wikifiedText) {
  const issuesMap = new Map();

  function onIssueIdDetected(linkTag, issueSummary, issueId) {
    issuesMap.set(issueId, issueSummary);
  }
  wikifiedText.replace(issueLinkRegExp, onIssueIdDetected);

  issuesMap.forEach((issueSummary, issueId) => {
    rawText = rawText.replace(new RegExp(issueId), decorateIssue(issueId, issuesMap.get(issueId)));
  })

  return rawText;
}
