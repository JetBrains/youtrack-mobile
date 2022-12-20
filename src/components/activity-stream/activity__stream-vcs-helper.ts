import {i18n} from '../i18n/i18n';
import {ResourceTypes} from '../api/api__resource-types';
import type {VCSActivity, VcsCommand, VcsProcessor} from 'types/Vcs';
const vcsChangeState = {
  auto: 0,
  attached: 1,
  detached: 3,
  legacy: 3,
};
const HUB_DEFAULT_ERROR: string = i18n(
  'YouTrack was unable to match the VCS user name to a Hub account for an unknown reason. Check your server logs for details.',
);
export const userNotFoundMessageMap: Record<string, string> = {
  TEAMCITY_NO_USER_INFO_PROVIDED: HUB_DEFAULT_ERROR,
  TEAMCITY_NO_USER: HUB_DEFAULT_ERROR,
  TEAMCITY_NO_EMAIL_FOR_THAT_USER: i18n(
    'When integrating TeamCity and YouTrack, the users are matched by their email addresses. TeamCity has not provided any email address of the committer.',
  ),
  TEAMCITY_NO_USER_IN_YOUTRACK_BY_EMAIL: i18n(
    "The author of this commit has not been identified because they haven't specified their email address in their YouTrack profile.",
  ),
  TEAMCITY_USER_IS_NOT_UNIQUE_BY_EMAIL: i18n(
    "When integrating TeamCity and YouTrack, the users are matched by their email addresses. There are two or more different YouTrack users that have the same email address as the commit's author has in TeamCity.",
  ),
  TEAMCITY_ERROR_RETRIEVING_USER: i18n(
    "There was an error retrieving information about the change's author from TeamCity. The most probable reason is that TeamCity user that integration runs on behalf of does not have the required permissions.",
  ),
  UPSOURCE_NO_USER: i18n('No user information provided by Upsource.'),
  HUB_ERROR_RING_INTEGRATION: i18n(
    'YouTrack was unable to match the VCS user name to a Hub account for an unknown reason. Check your server logs for details.',
  ),
  HUB_ERROR_FORCE_SYNC: i18n(
    'YouTrack was unable to match the VCS user name to a Hub account for an unknown reason. Check your server logs for details.',
  ),
  HUB_NULL_USER: i18n(
    'The VCS user name does not match any user in YouTrack. To link future commits, add the VCS user name to the Hub account for this user.',
  ),
  HUB_MULTIPLE_USERS: i18n(
    'The VCS user name matches more than one user in YouTrack. To link future commits, remove the duplicate VCS user names from one or more Hub accounts or merge the duplicates into a single user account.',
  ),
  VCS_NOT_IN_COMMITTERS_GROUP: i18n(
    'The commit author does not belong to the committers group.',
  ),
  INTEGRATION_NOT_AN_ASSIGNEE: i18n(
    'The commit author is not an assignee in the project.',
  ),
  BITBUCKET_NO_USER_INFO_PROVIDED: i18n(
    'YouTrack did not receive user data for this commit author from Bitbucket.',
  ),
  BITBUCKET_NO_USER_FOUND_IN_YOUTRACK: i18n(
    'YouTrack did not find a user that matches the user account in Bitbucket.',
  ),
  BITBUCKET_USER_NOT_UNIQUE: i18n(
    'YouTrack found multiple users with email addresses that match the registered email in Bitbucket.',
  ),
  BITBUCKET_NO_USER_BY_EMAIL: i18n(
    'YouTrack did not receive an email address for the commit author from Bitbucket.',
  ),
  BITBUCKET_NO_RAW_EMAIL: i18n(
    'The commit author has not specified an email address.',
  ),
  BITBUCKET_AUTHORS_DO_NOT_MATCH_DEPRECATED: i18n(
    'The commit author has specified an email address that is associated with a different user account.',
  ),
  GITLAB_NO_USER_INFO_PROVIDED: i18n(
    'YouTrack did not receive user data for this commit author from GitLab.',
  ),
  GITLAB_NO_USER_FOUND_IN_YOUTRACK: i18n(
    'YouTrack did not find a user that matches the user account in GitLab.',
  ),
  GITLAB_USER_NOT_UNIQUE: i18n(
    'YouTrack found multiple users with email addresses that match the registered email in GitLab.',
  ),
  GITLAB_NO_EMAIL: i18n(
    'YouTrack did not receive an email address for the commit author from GitLab.',
  ),
  GITHUB_NO_USER_INFO_PROVIDED: i18n(
    'YouTrack did not receive user data for this commit author from GitHub.',
  ),
  GITHUB_NO_USER_FOUND_IN_YOUTRACK: i18n(
    'YouTrack did not find a user that matches the user account in GitHub.',
  ),
  GITHUB_USER_NOT_UNIQUE: i18n(
    'YouTrack found multiple users with email addresses that match the registered email in GitHub.',
  ),
  GITHUB_NO_EMAIL: i18n(
    'YouTrack did not receive an email address for the commit author from GitHub.',
  ),
};
export const pullRequestState = {
  OPEN: 'OPEN',
  MERGED: 'MERGED',
  DECLINED: 'DECLINED',
};

function getProcessorName(type: string): string {
  const processorName: Record<string, string> = {
    TeamCity: 'TeamCity',
    GitLab: 'GitLab',
    Bitbucket: 'Bitbucket',
    GitHub: 'GitHub',
    Upsource: 'Upsource',
    Jenkins: 'Jenkins',
    Gogs: 'Gogs',
    Gitea: 'Gitea',
    Space: 'Space',
  };
  let name: keyof typeof processorName = '';

  switch (type) {
    case ResourceTypes.TEAMCITY_CHANGES_PROCESSOR:
    case 'TeamcityBuildConfMapping':
      name = processorName.TeamCity;
      break;

    case ResourceTypes.GITLAB_MAPPING:
    case 'GitLabChangesProcessor':
      name = processorName.GitLab;
      break;

    case ResourceTypes.GITHUB_MAPPING:
    case 'GithubRepo':
      name = processorName.GitHub;
      break;

    case ResourceTypes.GOGS:
    case 'GogsChangesProcessor':
      name = processorName.Gogs;
      break;

    case ResourceTypes.GITEA:
    case 'GiteaChangesProcessor':
      name = processorName.Gitea;
      break;

    case ResourceTypes.UPSOURCE_PROCESSOR:
    case 'UpsourceChangesProcessor':
      name = processorName.Upsource;
      break;

    case ResourceTypes.JENKINS_SERVER:
    case ResourceTypes.JENKINS_CHANGES_PROCESSOR:
      name = processorName.Jenkins;
      break;

    case ResourceTypes.BITBUCKET:
    case ResourceTypes.BITBUCKET_MAPPING:
      name = processorName.Bitbucket;
      break;

    case ResourceTypes.SPACE_SERVER:
    case ResourceTypes.SPACE_MAPPING:
      name = processorName.Space;
      break;
  }

  return name;
}

function getCommandsWithError(change: VCSActivity) {
  return (change?.commands || []).filter((command: VcsCommand) => {
    return command.hasError === true;
  });
}

function getUserNotFoundErrors(change: VCSActivity): Array<string> {
  if (!change.noHubUserReason || !change.noUserReason) {
    return [];
  }

  const notFoundMessages = []
    .concat(change.noHubUserReason || [])
    .concat(change.noUserReason || []);
  const allMessages = notFoundMessages.map(
    message => userNotFoundMessageMap[message.id],
  );
  return [...new Set(allMessages)];
}

function vcsChangeStateMessage(code: number): string {
  let message: string = '';

  switch (code) {
    case vcsChangeState.attached:
      message = i18n('The change has been manually attached to this issue.');
      break;

    case vcsChangeState.detached:
      message = i18n(
        'The change has been detached from this issue. It is still displayed here because its comment mentions the issue.',
      );
      break;

    case vcsChangeState.legacy:
      message = i18n(
        'The change was processed during the initial data fetching, thus no command has been applied.',
      );
  }

  return message;
}

const getErrorMessages = (change: VCSActivity): Array<string> => {
  const errors: Array<string> = [].concat(getUserNotFoundErrors(change));
  const commandsWithError: Array<string> = getCommandsWithError(change).map(
    (command: VcsCommand) => command.errorText,
  );
  return errors.concat(commandsWithError);
};

const getInfoMessages = (change: VCSActivity): Array<string> => {
  if (typeof change.state !== 'number') {
    return [];
  }

  const vcsChangeCommandMessage = {
    COMMAND_APPLIED: i18n('Command was successfully applied.'),
    COMMAND_NOT_APPLIED: i18n('Could not apply specified command.'),
  };
  const messages: Array<string> = [];
  const stateMessage: string = vcsChangeStateMessage(change.state);

  if (stateMessage) {
    messages.push(stateMessage);
  }

  const commands: Array<VcsCommand> = change?.commands || [];

  if (commands[0]) {
    const commandStateMessage = getCommandsWithError(change)[0]
      ? vcsChangeCommandMessage.COMMAND_NOT_APPLIED
      : vcsChangeCommandMessage.COMMAND_APPLIED;
    messages.push(commandStateMessage);
  }

  return messages;
};

const getVcsPresentation = (change: VCSActivity): string => {
  if (change.idExternal) {
    return `#${change.idExternal}`;
  } else {
    return (change.version || '').substring(0, 8);
  }
};

const getProcessorsUrls = function (change: VCSActivity): Array<VcsProcessor> {
  const changeUrls: Array<string> = (change && change.urls) || [];
  const urlsDistinct: Record<string, boolean> = {};
  return (change?.processors || [])
    .map((processor: VcsProcessor, index: number) => ({
      ...processor,
      label: getProcessorName(processor.$type),
      url: changeUrls[index],
    }))
    .filter((processor: VcsProcessor) => {
      if (!urlsDistinct.hasOwnProperty(processor.url)) {
        urlsDistinct[processor.url] = true;
        return true;
      } else {
        return false;
      }
    });
};

export {
  getErrorMessages,
  getInfoMessages,
  getVcsPresentation,
  getProcessorsUrls,
};
