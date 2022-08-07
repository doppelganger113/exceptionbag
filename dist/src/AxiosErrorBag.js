"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosErrorBag = exports.AxiosSource = void 0;
const ErrorBag_1 = require("./ErrorBag");
var AxiosSource;
(function (AxiosSource) {
    AxiosSource["Unknown"] = "Unknown";
    AxiosSource["Request"] = "Request";
    AxiosSource["Response"] = "Response";
})(AxiosSource = exports.AxiosSource || (exports.AxiosSource = {}));
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
class AxiosErrorBag extends ErrorBag_1.ErrorBag {
    constructor(msg, status, statusText, source, baseUrl, timeout, code, path, method, headers, responseData) {
        super(msg);
        this.name = AxiosErrorBag.name;
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
    static isAxiosError(error) {
        if (error === undefined || error === null) {
            return false;
        }
        const { isAxiosError } = error;
        return Boolean(isAxiosError) || isAxiosError === 'true';
    }
    hasStatus(status) {
        return this.status === status;
    }
    getHeader(key) {
        return this.headers[key] || '';
    }
    /**
     * @description Returns response data if any in json or plain text, depending on the result.
     */
    getResponseData() {
        return this.responseData;
    }
    static toHeaders(axiosHeaders) {
        const keyValueHeaders = {};
        Object.keys(axiosHeaders).forEach((key) => {
            const value = axiosHeaders[key];
            if (value === undefined) {
                return;
            }
            if (typeof value === 'string') {
                keyValueHeaders[key] = value;
            }
            else {
                keyValueHeaders[key] = value ? JSON.stringify(value) : '';
            }
        });
        return keyValueHeaders;
    }
    /**
     * @description Create only if {@link AxiosErrorBag.isAxiosError} check was performed as you will be sure it
     * was an axios error type.
     *
     * @deprecated Prefer {@link AxiosErrorBag.from} as it converts to {@link AxiosErrorBag} if axios, otherwise
     * to {@link ErrorBag}
     */
    static fromAxiosError(description, error) {
        var _a;
        const baseUrl = error.config.baseURL || '';
        const timeout = error.config.timeout || 0;
        const code = error.code || '';
        const status = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 0;
        let statusText = '';
        let responseData;
        let source = AxiosSource.Unknown;
        let path = '';
        let method = '';
        let headers = {};
        const fullMessage = `${description}: ${error.message}`;
        if (typeof error.response === 'object') {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            // console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
            const req = error.request;
            responseData = error.response.data;
            source = AxiosSource.Response;
            statusText = error.response.statusText || '';
            headers = AxiosErrorBag.toHeaders(error.response.headers);
            path = (req === null || req === void 0 ? void 0 : req.path) || '';
            method = (req === null || req === void 0 ? void 0 : req.method) || '';
        }
        else if (typeof error.request === 'object') {
            const req = error.request;
            source = AxiosSource.Request;
            path = req.path || '';
            method = error.config.method || '';
        }
        method = method.toUpperCase();
        const exception = new AxiosErrorBag(fullMessage, status, statusText, source, baseUrl, timeout, code, path, method, headers, responseData)
            .with(FIELD.Status, status)
            .with(FIELD.StatusText, statusText)
            .with(FIELD.Code, code)
            .with(FIELD.Path, path)
            .with(FIELD.Method, method)
            .with(FIELD.Headers, JSON.stringify(headers))
            .with(FIELD.Source, source)
            .with(FIELD.BaseUrl, baseUrl)
            .with(FIELD.Timeout, timeout)
            .with(FIELD.Data, JSON.stringify(responseData));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        Error.captureStackTrace(exception, AxiosErrorBag.fromAxiosError);
        return exception;
    }
    /**
     * @description Creates {@link AxiosErrorBag} if it's an axios error, otherwise a plain {@link ErrorBag}
     */
    static from(description, err) {
        if (AxiosErrorBag.isAxiosError(err)) {
            return AxiosErrorBag.fromAxiosError(description, err);
        }
        return ErrorBag_1.ErrorBag.from(description, err);
    }
}
exports.AxiosErrorBag = AxiosErrorBag;
//# sourceMappingURL=AxiosErrorBag.js.map