import { Response, NextFunction, Request } from "express";
import IssueStatusService from "./issue_status.service";

const issueStatusService = new IssueStatusService();

class IssueStatusController {
  /**
   * issue_status
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  issueStatus(req: Request, res: Response, next: NextFunction) {
    const { body: issue } = req;
    issueStatusService
      .issue_status(issue)
      .then((response) => {
        res.json({ ...response });
      })
      .catch((err) => {
        next(err);
      });
  }
}

export default IssueStatusController;
