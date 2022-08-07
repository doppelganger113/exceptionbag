import { ErrorBag } from './ErrorBag';
import { AxiosError } from 'axios';
export declare enum AxiosSource {
    Unknown = "Unknown",
    Request = "Request",
    Response = "Response"
}
/**
 * @description Extension of {@link ErrorBag} used for wrapping AxiosError and providing specific error data info.
 * To prevent accidentally overwriting **axios metadata** in bag creation will create metadata fields that start with
 * prefix: "axios_".
 *
 * @example
 * try {
 *   // execute axios request
 * } catch(error) {
 *   throw AxiosErrorBag.from('failed fetching user', error).with('userId', userId);
 * }
 */
export declare class AxiosErrorBag extends ErrorBag {
    readonly status: number;
    readonly statusText: string;
    readonly source: AxiosSource;
    readonly baseUrl: string;
    readonly timeout: number;
    readonly code: string;
    readonly path: string;
    readonly method: string;
    readonly headers: Record<string, string>;
    private readonly responseData;
    static isAxiosError(error: unknown): error is AxiosError;
    constructor(msg: string, status: number, statusText: string, source: AxiosSource, baseUrl: string, timeout: number, code: string, path: string, method: string, headers: Record<string, string>, responseData: unknown);
    hasStatus(status: number): boolean;
    getHeader(key: string): string;
    /**
     * @description Returns response data if any in json or plain text, depending on the result.
     */
    getResponseData<T>(): T | undefined;
    private static toHeaders;
    /**
     * @description Create only if {@link AxiosErrorBag.isAxiosError} check was performed as you will be sure it
     * was an axios error type.
     *
     * @deprecated Prefer {@link AxiosErrorBag.from} as it converts to {@link AxiosErrorBag} if axios, otherwise
     * to {@link ErrorBag}
     */
    static fromAxiosError(description: string, error: AxiosError): AxiosErrorBag;
    /**
     * @description Creates {@link AxiosErrorBag} if it's an axios error, otherwise a plain {@link ErrorBag}
     */
    static from(description: string, err?: Error | ErrorBag | string | number | boolean): ErrorBag;
}
