import { ExceptionBag } from './ExceptionBag';
import { AxiosError } from 'axios';
export declare enum AxiosSource {
    Unknown = "Unknown",
    Request = "Request",
    Response = "Response"
}
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
export declare class AxiosExceptionBag extends ExceptionBag {
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
     * @description Create only if {@link AxiosExceptionBag.isAxiosError} check was performed as you will be sure it
     * was an axios error type.
     *
     * @deprecated Prefer {@link AxiosExceptionBag.from} as it converts to {@link AxiosExceptionBag} if axios, otherwise
     * to {@link ExceptionBag}
     */
    static fromAxiosError(description: string, error: AxiosError): AxiosExceptionBag;
    /**
     * @description Creates {@link AxiosExceptionBag} if it's an axios error, otherwise a plain {@link ExceptionBag}
     */
    static from(description: string, err?: Error | ExceptionBag | string | number | boolean): ExceptionBag;
}
//# sourceMappingURL=AxiosExceptionBag.d.ts.map