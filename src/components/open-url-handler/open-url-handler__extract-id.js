const issueIdReg = /issue\/([\w-\d]+)/;

export default function(issueUrl) {
  if (!issueUrl) {
    return null;
  }
  const match = issueUrl.match(issueIdReg);
  return match && match[1];
}
