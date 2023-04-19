import Issue from "../../database/issue.model";
import { PROTOCOL_CONTEXT } from "../../shared/constants";
import ContextFactory from "../../utils/contextFactory";
import BppIssueStatusService from "./bpp.issue_status.service";

const bppIssueStatusService = new BppIssueStatusService();

class IssueStatusService {
  async getIssueByIssueId(issueId: string) {
    const issue: any = await Issue.find({
      issueId: issueId,
    });

    if (!(issue || issue.length))
      return {
        status: 404,
        name: "NO_RECORD_FOUND_ERROR",
        message: "Record not found",
      };
    else return issue;
  }

  /**
   * status issue
   * @param {Object} order
   */
  async issue_status(order: any) {
    try {
      const { context: requestContext, message } = order;

      const issueDetails = await this.getIssueByIssueId(message?.id);

      const contextFactory = new ContextFactory();
      const context = contextFactory.create({
        action: PROTOCOL_CONTEXT.ISSUE_STATUS,
        transactionId: issueDetails?.transactionId,
        bppId: requestContext?.bpp_id,
        bpp_uri: issueDetails?.bpp_uri,
        cityCode: issueDetails.city,
      });

      return await bppIssueStatusService.getIssueStatus(context, message);
    } catch (err) {
      throw err;
    }
  }
}

export default IssueStatusService;
