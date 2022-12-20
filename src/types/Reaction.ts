import type {User} from './User';
export type Reaction = {
  $type?: string;
  id: string;
  reaction: string;
  author: User;
};