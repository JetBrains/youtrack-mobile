const issueIdReg = /issue\/([\w-\d]+)/;

export default function(issueUrl) {
  if (!issueUrl) {
    return null;
  }
  return issueUrl.match(issueIdReg)[1];
}
