import { ExceptionBag } from './ExceptionBag';
import { AxiosError, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

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
  BaseUrl: 'axios_baseUrl',
  Timeout: 'axios_timeout',
  Path: 'axios_path',
  Method: 'axios_method',
  StatusText: 'axios_statusText',
  Headers: 'axios_headers',
};

/**
 * @description Extension of {@link ExceptionBag} used for wrapping AxiosError and providing specific error data info.
 * To prevent accidentally overwriting **axios metadata** in bag creation will create metadata fields that start with
 * prefix: "axios_".
 *
 * @example
 * try {
 *   // execute axios request
 * } catch(error) {
 *   throw AxiosExceptionBag.from('failed fetching user', error).with('userId', userId);
 * }
 */
export class AxiosExceptionBag extends ExceptionBag {
  public readonly status: number;
  public readonly statusText: string;
  public readonly source: AxiosSource;
  public readonly baseUrl: string;
  public readonly timeout: number;
  public readonly code: string;
  public readonly path: string;
  public readonly method: string;
  public readonly headers: Record<string, string>;

  private readonly responseData: unknown;

  public static isAxiosError(error: unknown): error is AxiosError {
    if (error === undefined || error === null) {
      return false;
    }
    const { isAxiosError } = error as Record<string, boolean | string | number>;

    return Boolean(isAxiosError) || isAxiosError === 'true';
  }

  public constructor(
    msg: string,
    status: number,
    statusText: string,
    source: AxiosSource,
    baseUrl: string,
    timeout: number,
    code: string,
    path: string,
    method: string,
    headers: Record<string, string>,
    responseData: unknown,
  ) {
    super(msg);
    this.name = AxiosExceptionBag.name;
    this.status = status;
    this.statusText = statusText;
    this.source = source;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
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

  private static toHeaders(
    axiosHeaders: RawAxiosResponseHeaders | AxiosResponseHeaders,
  ): Record<string, string> {
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
   * @description Create only if {@link AxiosExceptionBag.isAxiosError} check was performed as you will be sure it
   * was an axios error type.
   *
   * @deprecated Prefer {@link AxiosExceptionBag.from} as it converts to {@link AxiosExceptionBag} if axios, otherwise
   * to {@link ExceptionBag}
   */
  public static fromAxiosError(description: string, error: AxiosError): AxiosExceptionBag {
    const baseUrl: string = error.config?.baseURL || '';
    const timeout: number = error.config?.timeout || 0;
    const code = error.code || '';
    const status = error.response?.status || 0;
    let statusText = '';
    let responseData: unknown;
    let source = AxiosSource.Unknown;
    let path = '';
    let method = '';
    let headers: Record<string, string> = {};

    const fullMessage = `${description}: ${error.message || error.code || 'unknown'}`;

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
      headers = AxiosExceptionBag.toHeaders(error.response.headers);
      path = req?.path || '';
      method = req?.method || '';
    } else if (typeof error.request === 'object') {
      const req = error.request as Record<string, string>;

      source = AxiosSource.Request;
      path = req.path || '';
      method = error.config?.method || '';
    }
    method = method.toUpperCase();

    const exception = new AxiosExceptionBag(
      fullMessage,
      status,
      statusText,
      source,
      baseUrl,
      timeout,
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
      .with(FIELD.BaseUrl, baseUrl)
      .with(FIELD.Timeout, timeout)
      .with(FIELD.Data, JSON.stringify(responseData)) as AxiosExceptionBag;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    Error.captureStackTrace(exception, AxiosExceptionBag.fromAxiosError);
    return exception;
  }

  /**
   * @description Creates {@link AxiosExceptionBag} if it's an axios error, otherwise a plain {@link ExceptionBag}
   */
  public static from(description: string, err?: Error | ExceptionBag | string | number | boolean): ExceptionBag {
    if (AxiosExceptionBag.isAxiosError(err)) {
      return AxiosExceptionBag.fromAxiosError(description, err);
    }

    return ExceptionBag.from(description, err);
  }
}
