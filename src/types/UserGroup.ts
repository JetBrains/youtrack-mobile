export type UserGroup = {
  $type: string;
  allUsersGroup?: boolean;
  icon?: string | null;
  id: string;
  name: string;
  ringId?: string;
  team?: {
    id: string;
    name: string;
  };
  usersCount?: number;
};
