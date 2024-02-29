import { Context } from '../../interfaces/issue.js';
import { protocolIssueStatus } from '../../utils/protocolApis.js';

class BppIssueStatusService {
  /**
   * bpp issue status
   * @param {Object} context
   * @param {Object} message
   
   */
  async getIssueStatus(context: Context, message: object = {}) {
    const issueStatusRequest = {
      context: context,
      message: message,
    };

    const response = await protocolIssueStatus(issueStatusRequest);

    return { context: context, message: response.message };
  }
}

export default BppIssueStatusService;
