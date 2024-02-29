import util from 'util';
import { UUID, randomUUID } from 'crypto';

import { PROTOCOL_CONTEXT } from '../../shared/constants.js';
import ContextFactory from '../../utils/contextFactory.js';
import BppIssueService from './bpp.issue.service.js';
import Issue from '../../database/issue.model.js';
import { logger } from '../../shared/logger.js';
import { transform } from '../../utils/index.js';
import * as bap from '../../interfaces/issue.js';
import BugzillaService from '../crm/crm.service.js';
import { onIssueOrder } from '../../utils/protocolApis.js';
import { addOrUpdateIssueWithtransactionId, getIssueByTransactionId } from '../../utils/dbservice.js';
import * as bpp from '../../interfaces/bpp_issue.js';
import { getEnv } from '../../utils/index.js';

const bppIssueService = new BppIssueService();
const bugzillaService = new BugzillaService();
class IssueService {
  async addComplainantAction(issue: bap.IssueProps, domain: string) {
    const date: Date = new Date();
    const initialComplainantAction = {
      complainant_action: 'OPEN',
      short_desc: 'Complaint created',
      updated_at: date,
      updated_by: {
        org: {
          name: util.format('%s :: %s', getEnv('BAP_ID'), domain),
        },
        contact: issue.complainant_info.contact,
        person: issue.complainant_info.person,
      },
    };
    if (!issue?.issue_actions?.complainant_actions?.length) {
      issue?.issue_actions?.complainant_actions.push(initialComplainantAction);
    }

    const issueId: UUID = randomUUID();
    const issueRequests: bap.IssueProps = {
      ...issue,
      issueId: issueId,
    };

    return issueRequests;
  }

  async createEscalateIssue(transactionId: string, context: bpp.Context, issue: bap.IssueProps) {
    logger.info('Closing issue or escalating it');
    const existingIssue: bap.IssueProps = await getIssueByTransactionId(transactionId);
    const bppResponse: bpp.Response = await bppIssueService.closeOrEscalateIssue(context, {
      ...issue,
      id: existingIssue.issueId,
    });

    if (issue?.issue_type === 'GRIEVANCE') {
      existingIssue['issue_status'] = 'Open';
    } else {
      existingIssue['issue_status'] = 'Close';
    }

    const complainant_actions = issue?.issue_actions?.complainant_actions;
    existingIssue?.issue_actions?.complainant_actions?.splice(
      0,
      issue?.issue_actions?.complainant_actions.length,
      ...complainant_actions,
    );
    await addOrUpdateIssueWithtransactionId(transactionId, existingIssue);
    bugzillaService.updateIssueInCRM(transactionId, issue?.issue_actions, true);
    return bppResponse;
  }

  async createIssue(issueRequest: bap.IssueRequest, userDetails: bap.UserDetails) {
    const { context: requestContext, message }: bap.IssueRequest = issueRequest;

    const issue: bap.IssueProps = message.issue;

    const contextFactory: ContextFactory = new ContextFactory();
    const context = contextFactory.create({
      domain: requestContext?.domain,
      action: PROTOCOL_CONTEXT.ISSUE,
      transactionId: requestContext?.transaction_id,
      bppId: issue?.bppId,
      bpp_uri: issue?.bpp_uri,
      city: requestContext?.city,
      state: requestContext?.state,
    });

    if (issue?.rating) {
      this.createEscalateIssue(requestContext.transaction_id, context, issue);
    }
    // const imageUri: string[] = [];

    // issue?.description?.images?.map(async (item: string) => {
    //   const imageLink = await this.uploadImage(item);
    //   imageUri.push(imageLink);
    // });

    // issue?.description?.images?.splice(
    //   0,
    //   issue?.description?.images.length,
    //   ...imageUri
    // );

    const issueRequests = await this.addComplainantAction(issue, context.domain);

    const bppResponse: bpp.IssueRequest = await bppIssueService.issue(context, issueRequests);

    if (bppResponse?.context) {
      await addOrUpdateIssueWithtransactionId(issue?.issueId, {
        ...issue,
        userId: userDetails?.decodedToken?.uid,
        domain: requestContext?.domain,
        message_id: bppResponse?.context?.message_id,
        transaction_id: bppResponse?.context?.transaction_id,
      });
      logger.info('Created issue in database');
    }

    // bugzillaService.createIssueInCRM(
    //   issueRequests,
    //   requestContext,
    //   issueRequests?.issue_actions
    // );

    // return bppResponse;
  }

  async getIssuesList(user: bap.UserDetails, params: bap.IParamProps) {
    const { limit = 10, pageNumber = 1 } = params;

    const skip = (pageNumber - 1) * limit;

    const issues = await Issue.find({ userId: user.decodedToken.uid })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .orFail();
    const totalCount = await Issue.countDocuments({
      userId: user.decodedToken.uid,
    })
      .lean()
      .orFail();

    return { issues, totalCount };
  }

  /**
   * on issue order
   * @param {Object} messageId
   */
  async onIssueOrder(messageId: string) {
    logger.info('Fetching on_issue from protocol');
    const protocolIssueResponse = await onIssueOrder(messageId);

    if (!(protocolIssueResponse && protocolIssueResponse.length) || protocolIssueResponse?.[0]?.error) {
      const contextFactory = new ContextFactory();
      const context = contextFactory.create({
        messageId: messageId,
        action: PROTOCOL_CONTEXT.ON_ISSUE,
      });

      return {
        context,
        error: {
          message: 'No data found',
        },
      };
    } else {
      const respondent_actions = protocolIssueResponse?.[0]?.message?.issue?.issue_actions?.respondent_actions;

      const issue: bap.IssueProps = await getIssueByTransactionId(protocolIssueResponse?.[0]?.context?.transaction_id);
      issue.issue_actions.respondent_actions = respondent_actions;

      await addOrUpdateIssueWithtransactionId(protocolIssueResponse?.[0]?.context?.transaction_id, issue);

      if (process.env.BUGZILLA_API_KEY || process.env.SELECTED_ISSUE_CRM == 'trudesk') {
        bugzillaService.updateIssueInCRM(protocolIssueResponse?.[0]?.context?.transaction_id, issue.issue_actions);
      }

      return transform(protocolIssueResponse?.[0]);
    }
  }

  /**
   * get issue by transaction id
   * @param {Object} transactionId
   */
  async getSingleIssue(transactionId: string) {
    if (!transactionId) throw new Error('Issue not found with this transaction Id');

    const issue: bap.IssueProps = await getIssueByTransactionId(transactionId);

    if (issue) {
      return { issueExistance: true, issue };
    } else {
      return { issueExistance: false };
    }
  }
}

export default IssueService;
