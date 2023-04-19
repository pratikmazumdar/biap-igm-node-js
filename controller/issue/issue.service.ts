import { PROTOCOL_CONTEXT } from "../../shared/constants";
import ContextFactory from "../../utils/contextFactory";
import BppIssueService from "./bpp.issue.service";
import Issue from "../../database/issue.model";
import { logger } from "../../shared/logger";
import HttpRequest from "../../utils/httpRequest";
import fs from "fs";

const bppIssueService = new BppIssueService();

class IssueService {
  async uploadImage(base64: string) {
    try {
      let matches: any = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
        response: any = {};

      if (matches.length !== 3) {
        throw new Error("Invalid input string");
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], "base64");
      let decodedImg = response;
      let imageBuffer = decodedImg.data;
      let fileName = Date.now().toString() + ".png";

      fs.writeFileSync("./images/" + fileName, imageBuffer, "utf8");
      return fileName;
    } catch (err) {
      console.log("bppIssueService", bppIssueService);
      return err;
    }
  }

  async createIssueInDatabase(issue: any, uid: string) {
    if (issue && uid) {
      const issueData = { ...issue, userId: uid };
      await Issue.create(issueData);
    }
  }

  async createIssueInBugzilla(issue: any) {
    try {
      console.log("issue", issue);
      const data = {
        product: "sahil",
        component: "sahil",
        version: "unspecified",
        summary: "'This is a test bug - please disregard",
        alias: "SomeAlias",
        op_sys: "All",
        rep_platform: "All",
      };
      const apiCall = new HttpRequest(
        "http://192.168.10.46:8000",
        "/create",
        "POST",
        {
          ...data,
        }
      );
      const result = await apiCall.send();
      if (result.status === 201) {
        logger.info("Created issue in Bugzilla");
      }
    } catch (error) {
      logger.info("Error in creating issue in Bugzilla ", error);
    }
  }

  /**
   * Issue
   * @param {Object} issueRequest
   */
  async createIssue(issueRequest: any, userDetails: any) {
    try {
      const { context: requestContext, message = {} } = issueRequest || {};

      const { issue = {} } = message;

      const contextFactory = new ContextFactory();
      const context = contextFactory.create({
        action: PROTOCOL_CONTEXT.ISSUE,
        transactionId: requestContext?.transaction_id,
        bppId: issue?.bppId,
        bpp_uri: issue?.bpp_uri,
        city: requestContext?.city,
        state: requestContext?.state,
      });
      console.log(
        "🚀 ~ file: issue.service.ts:89 ~ IssueService ~ createIssue ~ context:",
        context
      );
      const imageUri: any = [];

      await issue?.description?.images?.map(async (item: any) => {
        const images = await this.uploadImage(item);
        const imageLink = "http://localhost:6969/uploads/" + images;

        await imageUri.push(imageLink);
      });

      issue?.description?.images.splice(
        0,
        issue?.description?.images.length,
        ...imageUri
      );

      // const bppResponse = await bppIssueService.issue(context, issue);

      // if (process.env.BUGZILLA_API_KEY) {
      //   this.createIssueInBugzilla(issue);
      // }
      await this.createIssueInDatabase(issue, userDetails?.decodedToken?.uid);
      logger.info("Created issue in database");
      // return bppResponse;
    } catch (err) {
      throw err;
    }
  }

  async findIssues(user: any, params: any) {
    try {
      let { limit = 10, pageNumber = 1 } = params;

      limit = parseInt(limit);
      let skip = (pageNumber - 1) * limit;

      const issues = await Issue.find({ userId: user.decodedToken.uid })
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

  async getIssuesList(user: any, params: object = {}) {
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
}

export default IssueService;
