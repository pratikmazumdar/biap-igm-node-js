const SSE_CONNECTIONS: any = {};
const SSE_TIMEOUT: any = process.env.SSE_TIMEOUT;

function addSSEConnection(messageId: string, sse: object) {
  console.log("Adding SSE Connection");
  SSE_CONNECTIONS[messageId] = sse;
}

function sendSSEResponse(messageId: string, action: any, response: any) {
  console.log("HERE", SSE_CONNECTIONS, messageId, SSE_TIMEOUT);
  if (!SSE_CONNECTIONS?.[messageId]) {
    setTimeout(() => {
      console.log("Timeout ran", SSE_CONNECTIONS);
      // console.log(SSE_CONNECTIONS)
      SSE_CONNECTIONS?.[messageId]?.send(response, action, messageId);
    }, SSE_TIMEOUT);
  } else {
    SSE_CONNECTIONS?.[messageId]?.send(response, action, messageId);
  }
}

export { addSSEConnection, sendSSEResponse, SSE_CONNECTIONS };
