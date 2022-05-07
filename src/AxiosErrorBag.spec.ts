import axios, { AxiosError } from 'axios';
import { AxiosErrorBag, AxiosSource } from './AxiosErrorBag';
import http from 'http';
import { createDummyServer } from './TestServer';

describe('AxiosErrorBag', () => {
  let server: http.Server;

  beforeAll(() => {
    server = createDummyServer().listen(3011);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('isAxiosError', () => {
    it('should detect if axios error', async () => {
      /* eslint-disable jest/no-conditional-expect */
      expect.assertions(1);
      try {
        await axios.get('http://localhost:3011/tasks?state=bad');
      } catch (error) {
        expect(AxiosErrorBag.isAxiosError(error)).toBeTruthy();
      }
    });
  });

  describe('fromAxiosError', () => {
    it('should properly create AxiosErrorBag from axios response error', async () => {
      /* eslint-disable jest/no-conditional-expect */
      // expect.assertions(12);
      try {
        await axios.get('http://localhost:3011/tasks?state=bad');
      } catch (error) {
        expect(AxiosErrorBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosErrorBag.fromAxiosError('failed fetching tasks', error);
        expect(axiosErr.message).toBe('failed fetching tasks: Request failed with status code 400');

        const bag = axiosErr.getBag();
        expect(bag['axios_code']).toBe('ERR_BAD_REQUEST');
        expect(bag['axios_data']).toBe('{"err":"Bad request"}');
        expect(bag['axios_method']).toBe('GET');
        expect(bag['axios_status']).toBe(400);
        expect(bag['axios_statusText']).toBe('Bad Request');
        expect(bag['axios_path']).toBe('/tasks?state=bad');

        expect(axiosErr.getResponseData<{ err: string }>()).toEqual({ err: 'Bad request' });

        const parsedHeaders = JSON.parse(bag['axios_headers'] as string) as Record<string, string>;
        expect(parsedHeaders['x-powered-by']).toBe('Express');
        expect(parsedHeaders['connection']).toBe('close');
        expect(parsedHeaders['transfer-encoding']).toBe('chunked');
        expect(parsedHeaders['content-type']).toBe('application/json; charset=utf-8');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(axiosErr.path).toBe('/tasks?state=bad');
        expect(axiosErr.method).toBe('GET');
        expect(axiosErr.code).toBe('ERR_BAD_REQUEST');
        expect(axiosErr.source).toBe(AxiosSource.Response);
        expect(axiosErr.statusText).toBe('Bad Request');
        expect(axiosErr.status).toBe(400);
        expect(axiosErr.hasStatus(400)).toBeTruthy();
        expect(axiosErr.getHeader('content-type')).toBe('application/json; charset=utf-8');
        expect(axiosErr.headers['content-type']).toBe('application/json; charset=utf-8');
      }
    });

    it('should properly create AxiosErrorBag from axios request error', async () => {
      /* eslint-disable jest/no-conditional-expect */
      // expect.assertions(12);
      try {
        await axios.get('http://localhost:3013/tasks?state=bad');
      } catch (error) {
        expect(AxiosErrorBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosErrorBag.fromAxiosError('failed fetching tasks', error);
        expect(axiosErr.message).toBe('failed fetching tasks: connect ECONNREFUSED 127.0.0.1:3013');

        const bag = axiosErr.getBag();
        expect(bag['axios_code']).toBe('ECONNREFUSED');
        expect(bag['axios_data']).toBe(undefined);
        expect(bag['axios_method']).toBe('GET');
        expect(bag['axios_status']).toBe(0);
        expect(bag['axios_statusText']).toBe('');
        expect(bag['axios_path']).toBe('');

        expect(axiosErr.getResponseData()).toBe(undefined);

        const parsedHeaders = JSON.parse(bag['axios_headers'] as string) as Record<string, string>;
        expect(parsedHeaders['x-powered-by']).toBe(undefined);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(axiosErr.path).toBe('');
        expect(axiosErr.method).toBe('GET');
        expect(axiosErr.code).toBe('ECONNREFUSED');
        expect(axiosErr.source).toBe(AxiosSource.Request);
        expect(axiosErr.statusText).toBe('');
        expect(axiosErr.status).toBe(0);
        expect(axiosErr.hasStatus(0)).toBeTruthy();
        expect(axiosErr.getHeader('content-type')).toBe('');
        expect(axiosErr.headers['content-type']).toBe(undefined);
      }
    });

    it('should properly create AxiosErrorBag from axios response text error', async () => {
      /* eslint-disable jest/no-conditional-expect */
      // expect.assertions(12);
      try {
        await axios.get('http://localhost:3011/tasks?state=fail');
      } catch (error) {
        expect(AxiosErrorBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosErrorBag.fromAxiosError('failed fetching tasks', error);
        expect(axiosErr.message).toBe('failed fetching tasks: Request failed with status code 500');

        const bag = axiosErr.getBag();
        expect(bag['axios_code']).toBe('ERR_BAD_RESPONSE');
        expect(bag['axios_data']).toBe('"Internal Server Error"');
        expect(bag['axios_method']).toBe('GET');
        expect(bag['axios_status']).toBe(500);
        expect(bag['axios_statusText']).toBe('Internal Server Error');
        expect(bag['axios_path']).toBe('/tasks?state=fail');

        expect(axiosErr.getResponseData<string>()).toEqual('Internal Server Error');

        const parsedHeaders = JSON.parse(bag['axios_headers'] as string) as Record<string, string>;
        expect(parsedHeaders['x-powered-by']).toBe('Express');
        expect(parsedHeaders['connection']).toBe('close');
        expect(parsedHeaders['transfer-encoding']).toBe('chunked');
        expect(parsedHeaders['content-type']).toBe(undefined);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(axiosErr.path).toBe('/tasks?state=fail');
        expect(axiosErr.method).toBe('GET');
        expect(axiosErr.code).toBe('ERR_BAD_RESPONSE');
        expect(axiosErr.source).toBe(AxiosSource.Response);
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
        await axios.get('http://localhost:3011/tasks?state=bad');
      } catch (error) {
        throw AxiosErrorBag.fromAxiosError('this failed', error as AxiosError);
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
      } catch (error) {
        const err = error as AxiosErrorBag;
        expect(err.stack).not.toContain('Function.fromAxiosError');
        expect(err.stack).not.toContain('Function.from');
      }
    });
  });
});
