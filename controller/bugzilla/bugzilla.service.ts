import { logger } from "../../shared/logger";
import { IssueProps } from "../../interfaces/issue";
import HttpRequest from "../../utils/httpRequest";

class BugzillaService {
  async createIssueInBugzilla(issue: IssueProps) {
    try {
      const payload = {
        product: issue?.order_details?.items?.[0]?.product?.descriptor?.name,
        component: issue?.complainant_info?.person?.name,
        summary: issue?.description?.long_desc,
        alias: issue?.order_details?.id,
        bpp_id: issue?.bppId,
        bpp_name: issue?.order_details?.items?.[0]?.product?.bpp_details?.name,
      };

      const apiCall = new HttpRequest(
        "http://192.168.10.46:8001",
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
}

export default BugzillaService;
