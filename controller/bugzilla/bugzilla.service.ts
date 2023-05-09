import { logger } from "../../shared/logger";
import { Context, IssueProps } from "../../interfaces/issue";
import HttpRequest from "../../utils/httpRequest";

class BugzillaService {
  async createIssueInBugzilla(issue: IssueProps, requestContext: Context) {
    try {
      const payload = {
        product: issue?.order_details?.items?.[0]?.product?.descriptor?.name,
        component: issue?.complainant_info?.person?.name,
        summary: issue?.description?.long_desc,
        alias: requestContext?.transaction_id || "",
        bpp_id: issue?.bppId,
        bpp_name: issue?.order_details?.items?.[0]?.product?.bpp_details?.name,
        attachments: [],
      };

      const apiCall = new HttpRequest(
        process.env.BUGZILLA_SERVICE_URI,
        "/create",
        "POST",
        {
          ...payload,
        }
      );
      const result = await apiCall.send();
      if (result.status === 201) {
        logger.info("Created issue in Bugzilla");
        return result.data;
      }
    } catch (error: any) {
      logger.info("Error in creating issue in Bugzilla ", error?.data?.message);
      return error;
    }
  }

  async updateIssueInBugzilla(transaction_id: string) {
    try {
      const apiCall = new HttpRequest(
        process.env.BUGZILLA_SERVICE_URI,
        `/updateBug/${transaction_id}`,
        "PUT",
        {
          status: "RESOLVED",
        }
      );
      const result = await apiCall.send();
      if (result.status === 200) {
        logger.info("Issue updated in Bugzilla");
      }
    } catch (error) {
      logger.info("Error in updating issue in Bugzilla", error);
      return error;
    }
  }
}

export default BugzillaService;
