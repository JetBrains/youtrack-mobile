const issueIdReg = /issue\/([\w-\d]+)/;

export default function(issueUrl) {
  return issueUrl.match(issueIdReg)[1];
}
