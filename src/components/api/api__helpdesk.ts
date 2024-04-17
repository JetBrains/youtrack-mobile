import * as qs from 'qs';

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import issuesFields from './api__issue-fields';
import issueFields from 'components/api/api__issue-fields';

import type {FeedbackFormBlockFieldValue} from 'views/helpdesk-feedback';
import type {FeedbackForm} from 'types/FeedbackForm';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ProjectHelpdesk} from 'types/Project';

const toField = ApiHelper.toField;

export default class HelpDeskFormAPI extends ApiBase {
  async getForm(formId: string): Promise<FeedbackForm> {
    const queryString = toField({
      form: [
        {author: issuesFields.ISSUE_USER_FIELDS},
        {
          blocks: [
            '$type',
            'id',
            'description',
            'ordinal',
            'required',
            'periodFieldPattern',
            'text',
            {
              projectField: [
                '$type',
                'id',
                'emptyFieldText',
                'bundle(id)',
                {
                  field: ['id', 'localizedName', 'name', 'fieldType(isMultiValue,valueType)'],
                },
                {
                  defaultValues: ['id', 'localizedName', 'name'],
                },
              ],
            },
          ],
        },
        'confirmationText',
        'errors',
        'id',
        'isDefault',
        'name',
        {parent: {project: ['id', 'ringId', 'restricted']}},
        'title',
        'useCaptcha',
        'uuid',
      ],
    }).toString();

    const response = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/feedbackForms/${formId}?fields=${queryString}`,
      'GET'
    );
    return response.form;
  }

  async submitForm(
    formId: string,
    body: Record<string, any>,
    files: NormalizedAttachment[] | null,
  ): Promise<{
    id: string;
  }> {
    return await this.submitFormRequest(
      'feedbackForm',
      `${this.youTrackUrl}/api/feedbackForms/${formId}/submit?fields=id`,
      body,
      files
    );
  }

  async getFieldValues(formId: string, blockId: string): Promise<Array<FeedbackFormBlockFieldValue>> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/feedbackForms/${formId}/form/blocks/${blockId}/projectField/bundle/values?sort=true&fields=id,name,localizedName`,
      'GET'
    );
  }

  async getProjects(): Promise<Array<ProjectHelpdesk>> {
    const q = qs.stringify({fields: issueFields.HELPDESK_PROJECT_FIELDS.toString()});
    const projects: ProjectHelpdesk[] = await this.makeAuthorizedRequest(`${this.youTrackProjectUrl}?${q}`);
    return projects.filter(p => !p.archived && p.plugins.helpDeskSettings.enabled);
  }
}
