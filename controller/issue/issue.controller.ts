import { Response } from 'express';
import { Request } from 'interfaces/custom';
import IssueService from './issue.service.js';
import { IParamProps, UserDetails } from 'interfaces/issue.js';

const issueService = new IssueService();
class IssueController {
  async createIssue(req: Request, res: Response) {
    const { body: request, user: userDetails } = req;

    const response = await issueService.createIssue(request, userDetails);
    return res.json(response);
  }

  async getIssuesList(req: Request, res: Response) {
    const { query = {}, user }: { query: unknown; user: UserDetails } = req;

    const response = await issueService.getIssuesList(user, query as IParamProps);
    return res.json(response);
  }

  async getIssueByTransactionId(req: Request, res: Response) {
    const { query = {} } = req;

    const response = await issueService.getSingleIssue(query.transactionId as string);
    return res.json(response);
  }

  async onIssue(req: Request, res: Response) {
    const { query } = req;
    const { messageId } = query;

    const issue = await issueService.onIssueOrder(messageId as string);

    return res.json(issue);
  }
}

export default IssueController;
