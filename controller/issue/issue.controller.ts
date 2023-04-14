import { Response, Request, NextFunction } from "express";
import IssueService from "./issue.service";
import { logger } from "../../shared/logger";

const issueService = new IssueService();
class IssueController {
  /**
   * create issue
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */

  createIssue(req: Request, res: Response, next: NextFunction) {
    const { body: request } = req;
    logger.info(request);

    issueService
      .selectMultipleOrder(request)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
}

export default IssueController;
