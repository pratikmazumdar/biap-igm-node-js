const SSE_CONNECTIONS: any = {};
const SSE_TIMEOUT: any = process.env.SSE_TIMEOUT;

function addSSEConnection(messageId: string, sse: object) {
  SSE_CONNECTIONS[messageId] = sse;
}

function sendSSEResponse(messageId: string, action: any, response: any) {
  if (!SSE_CONNECTIONS?.[messageId]) {
    setTimeout(() => {
      SSE_CONNECTIONS?.[messageId]?.send(response, action, messageId);
    }, SSE_TIMEOUT);
  } else {
    SSE_CONNECTIONS?.[messageId]?.send(response, action, messageId);
  }
}

export { addSSEConnection, sendSSEResponse, SSE_CONNECTIONS };
