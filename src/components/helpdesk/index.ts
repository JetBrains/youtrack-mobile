import {Entity} from 'types/Entity';

const isHelpdeskProject = (entity: Entity): boolean => !!entity?.project?.plugins?.helpDeskSettings?.enabled;

export {isHelpdeskProject};
