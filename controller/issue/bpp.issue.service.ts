import { v4 as uuidv4 } from "uuid";
import { protocolIssue } from "../../utils/protocolApis";
import { PROTOCOL_CONTEXT } from "../../shared/constants";
class BppIssueService {
  /**
   * bpp issue
   * @param {Object} context
   * @param {Object} issue
   */
  async issue(context: object, issue: any = {}) {
    try {
      const { issue_actions, order_details, description } = issue;

      const date = new Date();
      const issueRequest = {
        context: context,
        message: {
          issue: {
            id: uuidv4(),
            category: issue?.category,
            sub_category: issue?.sub_category,
            complainant_info: issue?.complainant_info,
            order_details: {
              id: order_details?.id,
              state: order_details?.state,
              items:
                order_details?.items.map((item: any) => {
                  return {
                    id: item?.id?.toString(),
                  };
                }) || [],
              fulfillments: order_details?.fulfillments.map((item: any) => {
                return {
                  id: item?.id?.toString(),
                  state: "Order-delivered",
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
              network_participant_id: process.env.BAP_ID,
              issue_source_type: "CONSUMER",
            },
            expected_response_time: {
              duration: process.env.EXPECTED_RESPONSE_TIME,
            },
            expected_resolution_time: {
              duration: process.env.EXPECTED_RESOLUTION_TIME,
            },
            status: "OPEN",
            issue_type: PROTOCOL_CONTEXT?.ISSUE.toUpperCase(),
            issue_actions: issue_actions,
            created_at: date,
            updated_at: date,
          },
        },
      };

      const response: any = await protocolIssue(issueRequest);
      console.log("response", response);
      return { context: context, message: response?.message };
    } catch (err) {
      throw err;
    }
  }
}

export default BppIssueService;
