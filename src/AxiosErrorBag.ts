import { ErrorBag } from './ErrorBag';
import { AxiosError } from 'axios';

export enum AxiosSource {
  Unknown = 'Unknown',
  Request = 'Request',
  Response = 'Response',
}

const FIELD = {
  Data: 'axios_data',
  Status: 'axios_status',
  Code: 'axios_code',
  Source: 'axios_source',
  Path: 'axios_path',
  Method: 'axios_method',
  StatusText: 'axios_statusText',
  Headers: 'axios_headers',
};

/**
 * @description Extension of {@link ErrorBag} used for wrapping AxiosError and providing specific error data info.
 *
 * @example
 * try {
 *   // execute axios request
 * } catch(error) {
 *   if(AxiosException.isAxiosError(error)) {
 *     throw AxiosException.fromAxiosError('failed fetching user', error).with('userId', userId);
 *   }
 *
 *   throw ErrorBag.from('failed fetching user', error).with('userId', userId);
 * }
 */
export class AxiosErrorBag extends ErrorBag {
  public readonly status: number;
  public readonly statusText: string;
  public readonly source: AxiosSource;
  public readonly code: string;
  public readonly path: string;
  public readonly method: string;
  public readonly headers: Record<string, string>;

  private readonly responseData: unknown;

  public static isAxiosError(error: unknown): error is AxiosError {
    return (error as Record<string, boolean>).isAxiosError;
  }

  public constructor(
    msg: string,
    status: number,
    statusText: string,
    source: AxiosSource,
    code: string,
    path: string,
    method: string,
    headers: Record<string, string>,
    responseData: unknown,
  ) {
    super(msg);
    this.name = 'AxiosErrorBag';
    this.status = status;
    this.statusText = statusText;
    this.source = source;
    this.code = code;
    this.path = path;
    this.method = method;
    this.headers = headers;
    this.responseData = responseData;
  }

  public hasStatus(status: number): boolean {
    return this.status === status;
  }

  public getHeader(key: string): string {
    return this.headers[key] || '';
  }

  /**
   * @description Returns response data if any in json or plain text, depending on the result.
   */
  public getResponseData<T>(): T | undefined {
    return this.responseData as T;
  }

  private static toHeaders(axiosHeaders: Record<string, string>): Record<string, string> {
    const keyValueHeaders: Record<string, string> = {};

    Object.keys(axiosHeaders).forEach((key) => {
      const value: unknown = (axiosHeaders as Record<string, unknown>)[key];
      if (value === undefined) {
        return;
      }
      if (typeof value === 'string') {
        keyValueHeaders[key] = value;
      } else {
        keyValueHeaders[key] = value ? JSON.stringify(value) : '';
      }
    });

    return keyValueHeaders;
  }

  /**
   * @description Create only if {@link AxiosErrorBag.isAxiosError} check was performed as you will be sure it
   * was an axios error type.
   */
  public static fromAxiosError(description: string, error: AxiosError): AxiosErrorBag {
    const code = error.code || '';
    const status = error.response?.status || 0;
    let statusText = '';
    let responseData: unknown;
    let source = AxiosSource.Unknown;
    let path = '';
    let method = '';
    let headers: Record<string, string> = {};

    const fullMessage = `${description}: ${error.message}`;

    if (typeof error.response === 'object') {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
      const req = error.request as Record<string, string>;

      responseData = error.response.data;
      source = AxiosSource.Response;
      statusText = error.response.statusText || '';
      headers = AxiosErrorBag.toHeaders(error.response.headers);
      path = req?.path || '';
      method = req?.method || '';
    } else if (typeof error.request === 'object') {
      const req = error.request as Record<string, string>;

      source = AxiosSource.Request;
      path = req.path || '';
      method = (error.config as Record<string, string>).method || '';
    }
    method = method.toUpperCase();

    const exception = new AxiosErrorBag(
      fullMessage,
      status,
      statusText,
      source,
      code,
      path,
      method,
      headers,
      responseData,
    )
      .with(FIELD.Status, status)
      .with(FIELD.StatusText, statusText)
      .with(FIELD.Code, code)
      .with(FIELD.Path, path)
      .with(FIELD.Method, method)
      .with(FIELD.Headers, JSON.stringify(headers))
      .with(FIELD.Source, source)
      .with(FIELD.Data, JSON.stringify(responseData)) as AxiosErrorBag;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    Error.captureStackTrace(exception, AxiosErrorBag.fromAxiosError);
    return exception;
  }
}
