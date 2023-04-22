import _ from "lodash";
import SseEvent from "./sseEvent.service";

class ConfigureSSE {
  req: any;
  res: any;
  messageId: any;
  message: any;
  action: boolean;
  constructor(
    req: any,
    res: any,
    messageId: any,
    action?: boolean,
    message?: any
  ) {
    this.req = req;
    this.res = res;
    this.messageId = messageId;
    this.message = message;
    this.action = action || false;
  }

  initialize() {
    try {
      let message: Map<any, any> | Set<any> | _.List<any> | null | undefined =
        [];

      if (this.message && !_.isEmpty(message)) message = this.message;

      const sse = new SseEvent(message, {
        initialEvent: this.action,
        eventId: this.messageId,
      });

      sse.init(this.req, this.res);

      return sse;
    } catch (err) {
      throw err;
    }
  }
}

export default ConfigureSSE;
