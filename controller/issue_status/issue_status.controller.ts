import { Response, NextFunction, Request } from "express";
import BadRequestParameterError from "../../lib/error/bad-request-parameter-error";
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

  /**
   * on issue_status
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function

   */
  onIssue_status(req: Request, res: Response, next: NextFunction) {
    const { query } = req;
    const { messageId }: any = query;

    if (messageId && messageId.length)
      issueStatusService
        .onIssueStatus(messageId)
        .then((response: any) => {
          res.json(response);
        })
        .catch((err: any) => {
          next(err);
        });
    else throw new BadRequestParameterError("message Id is mandatory");
  }
}

export default IssueStatusController;
