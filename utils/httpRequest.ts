import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { logger } from '../shared/logger';
import { Methods } from '../shared/constants';

class HttpRequest {
  params: AxiosRequestConfig<any>;
  constructor(params: AxiosRequestConfig<any>) {
    this.params = params;
  }

  async send(): Promise<AxiosResponse> {
    const params: AxiosRequestConfig = this.params;
    if (params.method == Methods.POST) {
      params.headers = {
        ...params.headers,
        'Content-Type': 'application/json',
      };
    }

    params.timeout = 180000;
    logger.info('Sending request to server with:', params.data, 'to', params.url);
    if (params.method === Methods.POST) params.data = JSON.stringify(params.data);

    return await axios(params);
  }
}

export default HttpRequest;
