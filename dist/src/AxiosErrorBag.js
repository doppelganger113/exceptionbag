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
class AxiosErrorBag extends ErrorBag_1.ErrorBag {
    constructor(msg, status, statusText, source, code, path, method, headers, responseData) {
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
    static isAxiosError(error) {
        return error.isAxiosError;
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
     */
    static fromAxiosError(description, error) {
        var _a;
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
        const exception = new AxiosErrorBag(fullMessage, status, statusText, source, code, path, method, headers, responseData)
            .with(FIELD.Status, status)
            .with(FIELD.StatusText, statusText)
            .with(FIELD.Code, code)
            .with(FIELD.Path, path)
            .with(FIELD.Method, method)
            .with(FIELD.Headers, JSON.stringify(headers))
            .with(FIELD.Source, source)
            .with(FIELD.Data, JSON.stringify(responseData));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        Error.captureStackTrace(exception, AxiosErrorBag.fromAxiosError);
        return exception;
    }
}
exports.AxiosErrorBag = AxiosErrorBag;
//# sourceMappingURL=AxiosErrorBag.js.map