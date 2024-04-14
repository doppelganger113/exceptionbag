"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const AxiosExceptionBag_1 = require("./AxiosExceptionBag");
const TestServer_1 = require("./TestServer");
describe('AxiosExceptionBag', () => {
    let dummyServer;
    beforeAll(() => {
        dummyServer = (0, TestServer_1.createDummyServer)();
    });
    afterAll(() => {
        dummyServer.close();
    });
    describe('isAxiosError', () => {
        it('should detect if axios error', async () => {
            /* eslint-disable jest/no-conditional-expect */
            expect.assertions(1);
            try {
                await axios_1.default.get(`${dummyServer.url}/tasks?state=bad`);
            }
            catch (error) {
                expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(error)).toBeTruthy();
            }
        });
        it('should not fail on null or undefined errors', () => {
            expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(null)).toBe(false);
            expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(undefined)).toBe(false);
            expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(true)).toBe(false);
            expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError('')).toBe(false);
            expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(0)).toBe(false);
            expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError('true')).toBe(false);
        });
    });
    describe('from', () => {
        // eslint-disable-next-line @typescript-eslint/require-await
        const myFunc1 = async () => {
            try {
                throw new Error('Testing something');
            }
            catch (error) {
                throw AxiosExceptionBag_1.AxiosExceptionBag.from('testing failure', error);
            }
        };
        const myFunc2 = async () => {
            await myFunc1();
        };
        const myFunc3 = async () => {
            await myFunc2();
        };
        it('should create from standard error and wrap', async () => {
            /* eslint-disable jest/no-conditional-expect */
            expect.assertions(2);
            try {
                await myFunc3();
            }
            catch (error) {
                const err = error;
                expect(err.stack).not.toContain('Function.fromAxiosError');
                expect(err.stack).not.toContain('Function.from');
            }
        });
    });
    describe('fromAxiosError', () => {
        it('should properly create AxiosExceptionBag from axios response error', async () => {
            /* eslint-disable jest/no-conditional-expect */
            // expect.assertions(12);
            try {
                const client = axios_1.default.create({ baseURL: 'http://localhost', timeout: 2000 });
                await client.get(`${dummyServer.url}/tasks?state=bad`);
            }
            catch (error) {
                expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(error)).toBeTruthy();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const axiosErr = AxiosExceptionBag_1.AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
                expect(axiosErr.message).toBe('failed fetching tasks: Request failed with status code 400');
                const bag = axiosErr.getBag();
                expect(bag['axios_code']).toBe('ERR_BAD_REQUEST');
                expect(bag['axios_data']).toBe('{"err":"Bad request"}');
                expect(bag['axios_method']).toBe('GET');
                expect(bag['axios_status']).toBe(400);
                expect(bag['axios_statusText']).toBe('Bad Request');
                expect(bag['axios_path']).toBe('/tasks?state=bad');
                expect(bag['axios_baseUrl']).toBe('http://localhost');
                expect(bag['axios_timeout']).toBe(2000);
                expect(axiosErr.getResponseData()).toEqual({ err: 'Bad request' });
                const parsedHeaders = JSON.parse(bag['axios_headers']);
                expect(parsedHeaders['x-powered-by']).toBe('Express');
                expect(parsedHeaders['connection']).toBe('keep-alive');
                expect(parsedHeaders['transfer-encoding']).toBe('chunked');
                expect(parsedHeaders['content-type']).toBe('application/json; charset=utf-8');
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(axiosErr.path).toBe('/tasks?state=bad');
                expect(axiosErr.method).toBe('GET');
                expect(axiosErr.code).toBe('ERR_BAD_REQUEST');
                expect(axiosErr.source).toBe(AxiosExceptionBag_1.AxiosSource.Response);
                expect(axiosErr.baseUrl).toBe('http://localhost');
                expect(axiosErr.timeout).toBe(2000);
                expect(axiosErr.statusText).toBe('Bad Request');
                expect(axiosErr.status).toBe(400);
                expect(axiosErr.hasStatus(400)).toBeTruthy();
                expect(axiosErr.getHeader('content-type')).toBe('application/json; charset=utf-8');
                expect(axiosErr.headers['content-type']).toBe('application/json; charset=utf-8');
            }
        });
        it('should properly create AxiosExceptionBag from axios request error', async () => {
            /* eslint-disable jest/no-conditional-expect */
            // expect.assertions(12);
            try {
                await axios_1.default.get(`${dummyServer.url}/tasks?state=bad`);
            }
            catch (error) {
                expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(error)).toBeTruthy();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const axiosErr = AxiosExceptionBag_1.AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
                expect(axiosErr.message).toBe('failed fetching tasks: Request failed with status code 400');
                const bag = axiosErr.getBag();
                expect(bag['axios_code']).toBe('ERR_BAD_REQUEST');
                expect(bag['axios_data']).toBe(JSON.stringify({ err: 'Bad request' }));
                expect(bag['axios_method']).toBe('GET');
                expect(bag['axios_status']).toBe(400);
                expect(bag['axios_baseUrl']).toBe('');
                expect(bag['axios_timeout']).toBe(0);
                expect(bag['axios_statusText']).toBe('Bad Request');
                expect(bag['axios_path']).toBe('/tasks?state=bad');
                expect(axiosErr.getResponseData()).toEqual({ err: 'Bad request' });
                const parsedHeaders = JSON.parse(bag['axios_headers']);
                expect(parsedHeaders['x-powered-by']).toBe('Express');
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(axiosErr.path).toBe('/tasks?state=bad');
                expect(axiosErr.method).toBe('GET');
                expect(axiosErr.code).toBe('ERR_BAD_REQUEST');
                expect(axiosErr.source).toBe(AxiosExceptionBag_1.AxiosSource.Response);
                expect(axiosErr.baseUrl).toBe('');
                expect(axiosErr.timeout).toBe(0);
                expect(axiosErr.statusText).toBe('Bad Request');
                expect(axiosErr.status).toBe(400);
                expect(axiosErr.hasStatus(400)).toBeTruthy();
                expect(axiosErr.getHeader('content-type')).toBe('application/json; charset=utf-8');
                expect(axiosErr.headers['content-type']).toBe('application/json; charset=utf-8');
            }
        });
        it('should properly create AxiosExceptionBag from axios response text error', async () => {
            /* eslint-disable jest/no-conditional-expect */
            // expect.assertions(12);
            try {
                await axios_1.default.get(`${dummyServer.url}/tasks?state=fail`);
            }
            catch (error) {
                expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(error)).toBeTruthy();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const axiosErr = AxiosExceptionBag_1.AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
                expect(axiosErr.message).toBe('failed fetching tasks: Request failed with status code 500');
                const bag = axiosErr.getBag();
                expect(bag['axios_code']).toBe('ERR_BAD_RESPONSE');
                expect(bag['axios_data']).toBe('"Internal Server Error"');
                expect(bag['axios_method']).toBe('GET');
                expect(bag['axios_status']).toBe(500);
                expect(bag['axios_statusText']).toBe('Internal Server Error');
                expect(bag['axios_path']).toBe('/tasks?state=fail');
                expect(axiosErr.getResponseData()).toEqual('Internal Server Error');
                const parsedHeaders = JSON.parse(bag['axios_headers']);
                expect(parsedHeaders['x-powered-by']).toBe('Express');
                expect(parsedHeaders['connection']).toBe('keep-alive');
                expect(parsedHeaders['transfer-encoding']).toBe('chunked');
                expect(parsedHeaders['content-type']).toBe(undefined);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(axiosErr.path).toBe('/tasks?state=fail');
                expect(axiosErr.method).toBe('GET');
                expect(axiosErr.code).toBe('ERR_BAD_RESPONSE');
                expect(axiosErr.source).toBe(AxiosExceptionBag_1.AxiosSource.Response);
                expect(axiosErr.statusText).toBe('Internal Server Error');
                expect(axiosErr.status).toBe(500);
                expect(axiosErr.hasStatus(500)).toBeTruthy();
                expect(axiosErr.getHeader('content-type')).toBe('');
                expect(axiosErr.getHeader('transfer-encoding')).toBe('chunked');
                expect(axiosErr.headers['content-type']).toBe(undefined);
            }
        });
        const myFunc1 = async () => {
            try {
                await axios_1.default.get(`${dummyServer.url}/tasks?state=bad`);
            }
            catch (error) {
                throw AxiosExceptionBag_1.AxiosExceptionBag.fromAxiosError('this failed', error);
            }
        };
        const myFunc2 = async () => {
            await myFunc1();
        };
        const myFunc3 = async () => {
            await myFunc2();
        };
        it('should have a valid stack trace', async () => {
            /* eslint-disable jest/no-conditional-expect */
            expect.assertions(2);
            try {
                await myFunc3();
            }
            catch (error) {
                const err = error;
                expect(err.stack).not.toContain('Function.fromAxiosError');
                expect(err.stack).not.toContain('Function.from');
            }
        });
    });
});
//# sourceMappingURL=AxiosExceptionBag.spec.js.map