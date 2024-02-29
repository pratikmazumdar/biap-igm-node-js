import { Response, Request, NextFunction } from 'express';

import { addSSEConnection } from '../../utils/sse.js';
import SseProtocol from './sseProtocol.service.js';
import ConfigureSse from './configureSse.service.js';
import IssueStatusService from '../../controller/issue_status/issue_status.service.js';
import { logger } from '../../shared/logger.js';

const sseProtocolService = new SseProtocol();
const issueStatusService = new IssueStatusService();
class SseController {
  /**
   * on event
   * @param {*} req HTTP request object
   * @param {*} res HTTP response object
   * @param {*} _next Callback argument to the middleware function
   */
  async onEvent(req: Request, res: Response, _next: NextFunction) {
    const { query = {} } = req;
    const { messageId }: any = query;

    if (messageId && messageId.length) {
      const configureSse = new ConfigureSse(req, res, messageId);
      const initSSE = configureSse.initialize();
      addSSEConnection(messageId, initSSE);
    }
  }

  /**
   * on issue
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  onIssue(req: Request, res: Response, next: NextFunction) {
    const { body: response } = req;

    sseProtocolService
      .onIssue(response)
      .then((result: any) => {
        res.json(result);
      })
      .catch((err: any) => {
        next(err);
      });
  }

  /**
   * on issue_status
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  onStatus(req: Request, res: Response, next: NextFunction) {
    const { body: response } = req;
    const { messageId } = response;

    issueStatusService
      .onIssueStatus(messageId)
      .then(() => {
        logger.info('Updated Issue in Unsolicited Calls');
      })
      .catch((err) => {
        logger.info('Error in Unsolicited calls', JSON.stringify(err));
      });

    sseProtocolService
      .onIssueStatus(response)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }
}

export default SseController;
