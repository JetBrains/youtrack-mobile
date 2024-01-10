import {NavigationRootNames} from 'components/navigation';

export enum RootRoutesList {
  AgileBoard = 'AgileBoard',
  Article = 'Article',
  ArticleSingle = 'ArticleSingle',
  Inbox = 'Inbox',
  InboxThreads = 'InboxThreads',
  Issues = 'Issues',
  KnowledgeBase = 'KnowledgeBase',
  Settings = 'Settings',
  Tickets = 'Tickets',
}

enum SecondaryRoutes {
  ArticleCreate = 'ArticleCreate',
  ArticleDraft = 'ArticleDraft',
  AttachmentPreview = 'AttachmentPreview',
  CreateIssue = 'CreateIssue',
  EnterServer = 'EnterServer',
  Home = 'Home',
  Issue = 'Issue',
  LinkedIssues = 'LinkedIssues',
  LinkedIssuesAddLink = 'LinkedIssuesAddLink',
  LogIn = 'LogIn',
  Modal = 'Modal',
  Page = 'Page',
  PageModal = 'PageModal',
  PreviewFile = 'PreviewFile',
  SettingsAppearance = 'SettingsAppearance',
  SettingsFeedbackForm = 'SettingsFeedbackForm',
  Ticket = 'Ticket',
  WikiPage = 'WikiPage',
  Tickets  = 'Tickets',
}

export const defaultRootRoute: NavigationRootNames = RootRoutesList.Issues;

export const routeMap: typeof RootRoutesList & typeof SecondaryRoutes = {...RootRoutesList, ...SecondaryRoutes};
