import { PROTOCOL_CONTEXT } from '../../shared/constants.js';
import { sendSSEResponse } from '../../utils/sse.js';

class SseProtocol {
  async onIssue(response: any) {
    const { messageId } = response;

    sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_ISSUE, response);

    return {
      message: {
        ack: {
          status: 'ACK',
        },
      },
    };
  }

  /**
   * on status
   * @param {Object} response
   */
  async onIssueStatus(response: any) {
    try {
      const { messageId } = response;

      sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_ISSUE_STATUS, response);

      return {
        message: {
          ack: {
            status: 'ACK',
          },
        },
      };
    } catch (err) {
      throw err;
    }
  }
}

export default SseProtocol;
