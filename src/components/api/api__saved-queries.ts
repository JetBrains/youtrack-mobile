import ApiBase from './api__base';
import issueFields from './api__issue-fields';
import UserAPI from './api__user';

import {Folder} from 'types/User';


export default class SavedQueries extends ApiBase {

  async getSavedQueries(pinned: boolean = false): Promise<Folder[]> {
    const queryString: string = UserAPI.createFieldsQuery(issueFields.issueFolder);
    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/savedQueries?${queryString}&pinned=${pinned}`,
    );
  }
}
