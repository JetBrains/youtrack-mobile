import {EntityWithProject} from 'types/Entity';

const isHelpdeskProject = (entity: EntityWithProject): boolean => !!entity?.project?.plugins?.helpDeskSettings?.enabled;

export {isHelpdeskProject};
