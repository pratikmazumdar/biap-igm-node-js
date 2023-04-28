import EventEmitter from "events";
import _ from "lodash";

class SseEvent extends EventEmitter {
  initial: Map<any, any> | Set<any> | _.List<any>;
  options: any;
  constructor(
    initial: Map<any, any> | Set<any> | _.List<any> | null | undefined,
    options = {}
  ) {
    super();

    if (initial) this.initial = initial;
    else this.initial = [];

    if (!_.isEmpty(options)) this.options = { ...options };
    else this.options = { isSerialized: true };

    this.init = this.init.bind(this);
  }

  /**
   * The SSE route handler
   */
  init(
    req: {
      socket: {
        setTimeout: (arg0: number) => void;
        setNoDelay: (arg0: boolean) => void;
        setKeepAlive: (arg0: boolean) => void;
      };
      httpVersion: string;
      on: (arg0: string, arg1: () => void) => void;
    },
    res: {
      statusCode: number;
      setHeader: (arg0: string, arg1: string) => void;
      write: (arg0: string) => void;
    }
  ) {
    let id = 0;

    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true);

    res.statusCode = 200;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.httpVersion !== "2.0") res.setHeader("Connection", "keep-alive");

    if (this.options.isCompressed) res.setHeader("Content-Encoding", "deflate");

    // Increase number of event listeners on init
    this.setMaxListeners(this.getMaxListeners() + 2);

    const dataListener = (data: { id: any; event: any; data: any }) => {
      if (data.id) res.write(`id: ${data.id}\n`);
      else {
        res.write(`id: ${id}\n`);
        id += 1;
      }

      if (data.event) res.write(`event: ${data.event}\n`);

      res.write(`data: ${JSON.stringify(data.data)}\n\n`);
    };

    const serializeListener = (data: any[]) => {
      const serializeSend = data.reduce((all: string, msg: any) => {
        all += `id: ${id}\ndata: ${JSON.stringify(msg)}\n\n`;
        id += 1;
        return all;
      }, "");
      res.write(serializeSend);
    };

    this.on("data", dataListener);

    this.on("serialize", serializeListener);

    if (this.initial) {
      if (this.options?.isSerialized) this.serialize(this.initial);
      else if (!_.isEmpty(this.initial))
        this.send(
          this.initial,
          this.options.initialEvent || false,
          this.options.eventId
        );
    }

    // Remove listeners and reduce the number of max listeners on client disconnect
    req.on("close", () => {
      this.removeListener("data", dataListener);
      this.removeListener("serialize", serializeListener);
      this.setMaxListeners(this.getMaxListeners() - 2);
    });
  }

  /**
   * Update the data initially served by the SSE stream
   * @param {array} data array containing data to be served on new connections
   */
  updateInit(data: any) {
    this.initial = data;
  }

  /**
   * Empty the data initially served by the SSE stream
   */
  dropInit() {
    this.initial = [];
  }

  send(data: any, event?: any, id?: any) {
    this.emit("data", { data, event, id });
  }

  serialize(data: any) {
    if (Array.isArray(data)) {
      this.emit("serialize", data);
    } else {
      this.send(data);
    }
  }
}

export default SseEvent;
