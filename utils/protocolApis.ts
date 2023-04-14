import HttpRequest from "./httpRequest";
import PROTOCOL_API_URLS from "../shared/protocolRoutes";


/**
 * on confirm order
 * @param {String} messageId 
 */
const onIssue = async (messageId:string) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_ISSUE + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
    return result.data;
};



/**
 * order confirm
 * @param {Object} data
 * @returns
 */
const protocolIssue = async (data: any) => {
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.ISSUE,
    "POST",
    {
      ...data,
    }
  );

  const result = await apiCall.send();
  return result.data;
};

export { protocolIssue, onIssue };
