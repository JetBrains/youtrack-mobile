export const NETWORK_PROBLEM_TIPS = [
  'Make sure that your YouTrack installation is accessible over the internet.',
  'If your YouTrack installation is hosted on a web server from a non-standard port (like 80 for HTTP or 443 for HTTPS), include the port number after the URL: youtrack-example.com:PORT',
  'Connections to servers that use self-signed SSL/TLS certificates are not supported.',
];
const YT_SUPPORTED_VERSION = 'YouTrack Mobile requires YouTrack version 2018+.';
module.exports = {
  NETWORK_PROBLEM_TIPS,
  YT_SUPPORTED_VERSION,
};
