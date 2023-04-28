import { protocolIssueStatus } from "../../utils/protocolApis";

class BppIssueStatusService {
  /**
   * bpp issue status
   * @param {Object} context
   * @param {Object} message
   
   */
  async getIssueStatus(context: any, message: object = {}) {
    try {
      const issueStatusRequest = {
        context: context,
        message: message,
      };

      const response = await protocolIssueStatus(issueStatusRequest);

      return { context: context, message: response.message };
    } catch (err) {
      throw err;
    }
  }
}

export default BppIssueStatusService;
