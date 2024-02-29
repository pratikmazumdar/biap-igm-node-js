import { AxiosResponse } from 'axios';
import { Methods, IssueCRM } from '../../shared/constants.js';

import { logger } from '../../shared/logger.js';
import { Context, IssueProps } from '../../interfaces/issue.js';
import HttpRequest from '../../utils/httpRequest.js';
import { IssueActions } from '../../interfaces/bpp_issue.js';
import { getEnv } from '../../utils/index.js';

class CRMService {
  async createIssueInCRM(issue: IssueProps, requestContext: Context, issue_Actions: IssueActions) {
    try {
      const crm = process.env.SELECTED_ISSUE_CRM || '';
      if (!(crm in IssueCRM)) return;
      logger.info('Connecting to CRM like bugzilla or truedesk');
      const payload = {
        product: issue?.order_details?.items?.[0]?.product?.descriptor?.name,
        issue_desc: issue?.description?.short_desc,
        summary: issue?.description?.long_desc,
        alias: requestContext?.transaction_id || '',
        bpp_id: issue?.bppId,
        bpp_name: issue?.order_details?.items?.[0]?.product?.bpp_details?.name,
        attachments: issue?.description.images || [],
        action: issue_Actions,
      };
      const apiCall = new HttpRequest({
        baseURL: getEnv('CRM_API_URL'),
        url: '/create',
        method: Methods.POST,
        data: payload,
      });
      const result = await apiCall.send();
      if (result.status === 201) {
        logger.info('Created issue in CRM');
        return result.data;
      }
    } catch (error: unknown) {
      logger.info('Error in creating issue in CRM ', (error as AxiosResponse)?.data?.message);
      return error;
    }
  }

  async updateIssueInCRM(transaction_id: string, issue_actions: IssueActions, resolved: boolean = false) {
    try {
      const apiCall = new HttpRequest({
        baseURL: process.env.BUGZILLA_SERVICE_URI,
        url: '/updateBug/'.concat(transaction_id),
        method: Methods.PUT,
        data: {
          status: resolved ? 'RESOLVED' : 'CONFIRMED',
          action: issue_actions,
        },
      });
      const result = await apiCall.send();
      if (result.status === 200) {
        logger.info('Issue updated in Bugzilla');
      }
    } catch (error) {
      logger.info('Error in updating issue in Bugzilla', error);
    }
  }
}

export default CRMService;
