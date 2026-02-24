import React from 'react';

import {getApi} from 'components/api/api__instance';

import {YtCurrentUserWithRelatedGroup} from 'types/User';

const useUserCardAsync = (userId: string): YtCurrentUserWithRelatedGroup | null => {
  const [user, setUser] = React.useState<YtCurrentUserWithRelatedGroup | null>(null);

  React.useEffect(() => {
    getApi().user.getUserCard(userId)
      .then((usr: YtCurrentUserWithRelatedGroup) => {
        setUser(usr);
      });
  }, [user?.id, userId]);

  return user;
};

export {useUserCardAsync};
