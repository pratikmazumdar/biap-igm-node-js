import { protocolIssue } from '../../utils/protocolApis.js';
import { PROTOCOL_CONTEXT } from '../../shared/constants.js';
import { Fulfillment, IssueProps, Item } from '../../interfaces/issue.js';
import { Context, IssueRequest, Response } from '../../interfaces/bpp_issue.js';
import { getEnv } from '../../utils/index.js';
class BppIssueService {
  /**
   * bpp issue
   * @param {Object} context
   * @param {Object} issue
   */
  async issue(context: Context, issue: IssueProps): Promise<IssueRequest> {
    const { issue_actions, order_details, description } = issue;

    const issueRequest: IssueRequest = {
      context: context,
      message: {
        issue: {
          id: issue?.issueId,
          category: issue?.category,
          sub_category: issue?.sub_category,
          complainant_info: issue?.complainant_info,
          order_details: {
            id: order_details?.id,
            state: order_details?.state,
            items:
              order_details?.items.map((item: Item) => {
                return {
                  id: item?.id?.toString(),
                  quantity: item?.quantity?.count,
                };
              }) || [],
            fulfillments: order_details?.fulfillments.map((item: Fulfillment) => {
              return {
                id: item?.id?.toString(),
                state: item?.state?.descriptor?.code,
              };
            }),
            provider_id: order_details?.provider_id,
          },
          description: {
            short_desc: description?.short_desc,
            long_desc: description?.long_desc,
            additional_desc: description?.additional_desc,
            images: description?.images,
          },
          source: {
            network_participant_id: getEnv('BAP_ID'),
            type: 'CONSUMER',
          },
          expected_response_time: {
            duration: getEnv('EXPECTED_RESPONSE_TIME') || 'PT1H',
          },
          expected_resolution_time: {
            duration: getEnv('EXPECTED_RESOLUTION_TIME') || 'P1D',
          },
          status: issue?.status || 'OPEN',
          issue_type: PROTOCOL_CONTEXT?.ISSUE.toUpperCase(),
          issue_actions: issue_actions,
          created_at: issue?.created_at,
          updated_at: new Date(),
        },
      },
    };

    const response: Response = await protocolIssue(issueRequest);
    return { context: context, message: response.message };
  }
  async closeOrEscalateIssue(context: Context, issue: IssueProps) {
    const { issue_actions } = issue;

    const issueRequest: any = {
      context: context,
      message: {
        issue: {
          id: issue?.id,
          status: issue?.status,
          issue_actions: issue_actions,
          rating: issue?.rating,
          created_at: issue?.created_at,
          updated_at: issue?.updated_at,
          issue_type: PROTOCOL_CONTEXT?.ISSUE.toUpperCase(),
        },
      },
    };

    const response: any = await protocolIssue(issueRequest);
    return { context: context, message: response?.message };
  }
}

export default BppIssueService;
