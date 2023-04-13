import React from 'react';

import {getApi} from 'components/api/api__instance';

import {User} from 'types/User';


const loadUserCard = async (userId: string): Promise<User> => {
  return await getApi().user.getUserCard(userId);
};

const useUserCardAsync = (userId: string): User | null => {
  const [user, setUser] = React.useState<User | null>(null);
  const getUser = React.useCallback(async (id: string) => await loadUserCard(id), []);

  React.useEffect(() => {
    getUser(userId).then((usr: User) => {
      setUser(usr);
    });
  }, [getUser, user?.id, userId]);

  return user;
};


export {
  useUserCardAsync,
};

