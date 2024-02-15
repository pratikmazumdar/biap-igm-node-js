import { v4 as uuidv4 } from "uuid";
import { PROTOCOL_CONTEXT, TRUDESK } from "../../shared/constants";
import ContextFactory from "../../utils/contextFactory";
import BppIssueService from "./bpp.issue.service";
import Issue from "../../database/issue.model";
import { logger } from "../../shared/logger";
import getSignedUrlForUpload from "../../utils/s3Util";

import {
  IParamProps,
  IssueProps,
  IssueRequest,
  UserDetails,
} from "../../interfaces/issue";
import BugzillaService from "../../controller/bugzilla/bugzilla.service";
import { onIssueOrder } from "../../utils/protocolApis";
import {
  addOrUpdateIssueWithtransactionId,
  getIssueByTransactionId,
} from "../../utils/dbservice";

const bppIssueService = new BppIssueService();
const bugzillaService = new BugzillaService();
class IssueService {
  /**
   *
   * @param {Object} response
   * @returns
   */
  transform(response: { context: any; message: { issue: any } }) {
    return {
      context: response?.context,
      message: {
        issue: {
          ...response?.message?.issue,
        },
      },
    };
  }
  async uploadImage(base64: string) {
    try {
      let matches: string[] | any = base64.match(
        /^data:([A-Za-z-+/]+);base64,(.+)$/
      );
      if (matches.length !== 3) {
        throw new Error("Invalid input string");
      }

      const b64toBlob = (b64Data: any, contentType = "", sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (
          let offset = 0;
          offset < byteCharacters.length;
          offset += sliceSize
        ) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);

          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
      };

      const blob = b64toBlob(base64.split(";base64").pop());
      const resp = await getSignedUrlForUpload({
        path: uuidv4(),
        filetype: "png",
      });

      fetch(resp?.urls, {
        method: "PUT",
        headers: { "Content-Type": "image/*" },
        body: blob,
      });
      return resp?.publicUrl;
    } catch (err) {
      return err;
    }
  }

  async createIssueInDatabase(
    issue: IssueProps,
    uid: string,
    message_id: string,
    transaction_id: string,
    domain: string
  ) {
    const issueReq = {
      ...issue,
      userId: uid,
      domain,
      message_id,
      transaction_id,
    };
    await addOrUpdateIssueWithtransactionId(issue?.issueId, issueReq);
  }

  async addComplainantAction(issue: IssueProps, domain: string) {
    const date = new Date();
    const initialComplainantAction = {
      complainant_action: "OPEN",
      short_desc: "Complaint created",
      updated_at: date,
      updated_by: {
        org: {
          name: process.env.BAP_ID + "::" + domain,
        },
        contact: {
          phone: "6239083807",
          email: "Rishabhnand.singh@ondc.org",
        },
        person: {
          name: "Rishabhnand Singh",
        },
      },
    };
    if (!issue?.issue_actions?.complainant_actions?.length) {
      issue?.issue_actions?.complainant_actions.push(initialComplainantAction);
    }

    const issueId = uuidv4();
    const issueRequests: IssueProps = {
      ...issue,
      issueId: issueId,
    };

    return issueRequests;
  }

  /**
   * Issue
   * @param {Object} issueRequest
   */
  async createIssue(issueRequest: IssueRequest, userDetails: UserDetails) {
    try {
      const { context: requestContext, message }: IssueRequest = issueRequest;

      const issue: IssueProps = message.issue;

      const contextFactory = new ContextFactory();
      const context = contextFactory.create({
        domain: requestContext?.domain,
        action: PROTOCOL_CONTEXT.ISSUE,
        transactionId: requestContext?.transaction_id,
        bppId: issue?.bppId,
        bpp_uri: issue?.bpp_uri,
        city: requestContext?.city,
        state: requestContext?.state,
      });

      if (message?.issue?.rating || message?.issue?.issue_type) {
        const existingIssue: IssueProps = await getIssueByTransactionId(
          requestContext?.transaction_id
        );
        const context = contextFactory.create({
          domain: requestContext?.domain,
          action: PROTOCOL_CONTEXT.ISSUE,
          transactionId: requestContext?.transaction_id,
          bppId: requestContext?.bpp_id || existingIssue.bppId,
          bpp_uri: existingIssue?.bpp_uri,
          city: requestContext?.city,
          state: requestContext?.state,
        });
        const bppResponse: any = await bppIssueService.closeOrEscalateIssue(
          context,
          { ...issue, id: existingIssue.issueId }
        );

        if (message?.issue?.issue_type === "GRIEVANCE") {
          existingIssue["issue_status"] = "Open";
        } else {
          existingIssue["issue_status"] = "Close";
        }
        const complainant_actions = issue?.issue_actions?.complainant_actions;
        existingIssue?.issue_actions?.complainant_actions?.splice(
          0,
          issue?.issue_actions?.complainant_actions.length,
          ...complainant_actions
        );

        await addOrUpdateIssueWithtransactionId(
          requestContext?.transaction_id,
          existingIssue
        );

        bugzillaService.updateIssueInBugzilla(
          requestContext?.transaction_id,
          issue?.issue_actions,
          true
        );

        return bppResponse;
      }
      const imageUri: string[] = [];

      issue?.description?.images?.map(async (item: string) => {
        const imageLink = await this.uploadImage(item);
        imageUri.push(imageLink);
      });

      issue?.description?.images?.splice(
        0,
        issue?.description?.images.length,
        ...imageUri
      );

      const issueRequests = await this.addComplainantAction(
        issue,
        context.domain
      );

      const bppResponse: any = await bppIssueService.issue(
        context,
        issueRequests
      );

      if (bppResponse?.context) {
        await this.createIssueInDatabase(
          issueRequests,
          userDetails?.decodedToken?.uid,
          bppResponse?.context?.message_id,
          bppResponse?.context?.transaction_id,
          requestContext?.domain
        );
        logger.info("Created issue in database");
      }
      if (
        process.env.BUGZILLA_API_KEY ||
        process.env.SELECTED_ISSUE_CRM === TRUDESK
      ) {
        bugzillaService.createIssueInBugzilla(
          issueRequests,
          requestContext,
          issueRequests?.issue_actions
        );
      }
      return bppResponse;
    } catch (err) {
      throw err;
    }
  }

  async findIssues(user: UserDetails, params: IParamProps) {
    try {
      let { limit = 10, pageNumber = 1 } = params;

      let skip = (pageNumber - 1) * limit;

      const issues = await Issue.find({ userId: user.decodedToken.uid })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip);
      const totalCount = await Issue.countDocuments({
        userId: user.decodedToken.uid,
      });

      return { issues, totalCount };
    } catch (err) {
      throw err;
    }
  }

  /**
   * get issues list
   * @param {Object} params
   * @param {Object} user
   */

  async getIssuesList(user: UserDetails, params: IParamProps) {
    try {
      const { issues, totalCount } = await this.findIssues(user, params);
      if (!issues.length) {
        return {
          error: {
            message: "No data found",
            status: "BAP_010",
          },
        };
      } else {
        return {
          totalCount: totalCount,
          issues: [...issues],
        };
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * on issue order
   * @param {Object} messageId
   */
  async onIssueOrder(messageId: string) {
    try {
      const protocolIssueResponse = await onIssueOrder(messageId);

      if (
        !(protocolIssueResponse && protocolIssueResponse.length) ||
        protocolIssueResponse?.[0]?.error
      ) {
        const contextFactory = new ContextFactory();
        const context = contextFactory.create({
          messageId: messageId,
          action: PROTOCOL_CONTEXT.ON_ISSUE,
        });

        return {
          context,
          error: {
            message: "No data found",
          },
        };
      } else {
        const respondent_actions =
          protocolIssueResponse?.[0]?.message?.issue?.issue_actions
            ?.respondent_actions;

        const issue: IssueProps = await getIssueByTransactionId(
          protocolIssueResponse?.[0]?.context?.transaction_id
        );

        issue?.issue_actions?.respondent_actions?.splice(
          0,
          issue?.issue_actions?.respondent_actions.length,
          ...respondent_actions
        );

        await addOrUpdateIssueWithtransactionId(
          protocolIssueResponse?.[0]?.context?.transaction_id,
          issue
        );

        if (
          process.env.BUGZILLA_API_KEY ||
          process.env.SELECTED_ISSUE_CRM == "trudesk"
        ) {
          bugzillaService.updateIssueInBugzilla(
            protocolIssueResponse?.[0]?.context?.transaction_id,
            issue.issue_actions
          );
        }

        return this.transform(protocolIssueResponse?.[0]);
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * get issue by transaction id
   * @param {Object} transactionId
   */
  async getSingleIssue(transactionId: string) {
    try {
      if (!transactionId)
        throw new Error("Issue not found with this transaction Id");

      const issue: IssueProps = await getIssueByTransactionId(transactionId);

      if (issue) {
        return { issueExistance: true, issue };
      } else {
        return { issueExistance: false };
      }
    } catch (err: any) {
      throw err;
    }
  }
}

export default IssueService;
