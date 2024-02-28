import HttpRequest from './httpRequest';
import PROTOCOL_API_URLS from '../shared/protocolRoutes';
import { IssueRequest } from '../interfaces/bpp_issue';
import { getEnv } from '../utils';
import { Methods } from '../shared/constants';

/**
 * on Issue
 * @param {String} messageId
 */
const onIssue = async (messageId: string) => {
  const apiCall = new HttpRequest({
    baseURL: getEnv('PROTOCOL_BASE_URL'),
    url: PROTOCOL_API_URLS.ON_ISSUE + '?messageId=' + messageId,
    method: Methods.GET,
  });

  const result = await apiCall.send();
  return result.data;
};

/**
 * Protocol Issue
 * @param {Object} data
 * @returns
 */
const protocolIssue = async (data: IssueRequest) => {
  const apiCall = new HttpRequest({
    baseURL: getEnv('PROTOCOL_BASE_URL'),
    url: PROTOCOL_API_URLS.ISSUE,
    method: Methods.POST,
    data,
  });

  const result = await apiCall.send();
  return result.data;
};
/**
 * Protocol Issue
 * @param {Object} data
 * @returns
 */
const protocolIssueStatus = async (data: any) => {
  const apiCall = new HttpRequest({
    baseURL: getEnv('PROTOCOL_BASE_URL'),
    url: PROTOCOL_API_URLS.ISSUE_STATUS,
    method: Methods.POST,
    data,
  });

  const result = await apiCall.send();
  return result.data;
};

/**
 * on order status
 * @param {String} messageId
 */
const onIssueStatus = async (messageId: string) => {
  const apiCall = new HttpRequest({
    baseURL: getEnv('PROTOCOL_BASE_URL'),
    url: PROTOCOL_API_URLS.RESPONSE,
    method: Methods.GET,
    data: { requestType: 'on_issue_status', messageId },
  });

  const result = await apiCall.send();
  return result.data;
};

const onIssueOrder = async (messageId: string) => {
  const apiCall = new HttpRequest({
    baseURL: getEnv('PROTOCOL_BASE_URL'),
    url: PROTOCOL_API_URLS.RESPONSE,
    method: Methods.GET,
    data: { requestType: 'on_issue', messageId },
  });

  const result = await apiCall.send();
  return result.data;
};

const onIssue_status = async (messageId: any) => {
  const apiCall = new HttpRequest({
    baseURL: getEnv('PROTOCOL_BASE_URL'),
    url: PROTOCOL_API_URLS.RESPONSE,
    method: Methods.GET,
    data: { requestType: 'on_issue_status', messageId },
  });

  const result = await apiCall.send();
  return result.data;
};

export { protocolIssue, onIssue, protocolIssueStatus, onIssueStatus, onIssueOrder, onIssue_status };
