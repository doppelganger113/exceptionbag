import axios, { AxiosError } from 'axios';
import { AxiosExceptionBag, AxiosSource } from './AxiosExceptionBag';
import { createDummyServer, DummyServer } from './TestServer';

describe('AxiosExceptionBag', () => {
  let dummyServer: DummyServer;

  beforeAll(() => {
    dummyServer = createDummyServer();
  });

  afterAll(() => {
    dummyServer.close();
  });

  describe('isAxiosError', () => {
    it('should detect if axios error', async () => {
      /* eslint-disable jest/no-conditional-expect */
      expect.assertions(1);
      try {
        await axios.get(`${dummyServer.url}/tasks?state=bad`);
      } catch (error) {
        expect(AxiosExceptionBag.isAxiosError(error)).toBeTruthy();
      }
    });
    it('should not fail on null or undefined errors', () => {
      expect(AxiosExceptionBag.isAxiosError(null)).toBe(false);
      expect(AxiosExceptionBag.isAxiosError(undefined)).toBe(false);
      expect(AxiosExceptionBag.isAxiosError(true)).toBe(false);
      expect(AxiosExceptionBag.isAxiosError('')).toBe(false);
      expect(AxiosExceptionBag.isAxiosError(0)).toBe(false);
      expect(AxiosExceptionBag.isAxiosError('true')).toBe(false);
    });
  });

  describe('from', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const myFunc1 = async () => {
      try {
        throw new Error('Testing something');
      } catch (error) {
        throw AxiosExceptionBag.from('testing failure', error as Error);
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
      } catch (error) {
        const err = error as AxiosExceptionBag;
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
        const client = axios.create({ baseURL: 'http://localhost', timeout: 2_000 });
        await client.get(`${dummyServer.url}/tasks?state=bad`);
      } catch (error) {
        expect(AxiosExceptionBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
        expect(axiosErr.message).toBe('failed fetching tasks: Request failed with status code 400');

        const bag = axiosErr.getBag();
        expect(bag['axios_code']).toBe('ERR_BAD_REQUEST');
        expect(bag['axios_data']).toBe('{"err":"Bad request"}');
        expect(bag['axios_method']).toBe('GET');
        expect(bag['axios_status']).toBe(400);
        expect(bag['axios_statusText']).toBe('Bad Request');
        expect(bag['axios_path']).toBe('/tasks?state=bad');
        expect(bag['axios_baseUrl']).toBe('http://localhost');
        expect(bag['axios_timeout']).toBe(2_000);

        expect(axiosErr.getResponseData<{ err: string }>()).toEqual({ err: 'Bad request' });

        const parsedHeaders = JSON.parse(bag['axios_headers'] as string) as Record<string, string>;
        expect(parsedHeaders['x-powered-by']).toBe('Express');
        expect(parsedHeaders['connection']).toBe('keep-alive');
        expect(parsedHeaders['transfer-encoding']).toBe('chunked');
        expect(parsedHeaders['content-type']).toBe('application/json; charset=utf-8');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(axiosErr.path).toBe('/tasks?state=bad');
        expect(axiosErr.method).toBe('GET');
        expect(axiosErr.code).toBe('ERR_BAD_REQUEST');
        expect(axiosErr.source).toBe(AxiosSource.Response);
        expect(axiosErr.baseUrl).toBe('http://localhost');
        expect(axiosErr.timeout).toBe(2_000);
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
        await axios.get(`${dummyServer.url}/tasks?state=bad`);
      } catch (error) {
        expect(AxiosExceptionBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
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

        const parsedHeaders = JSON.parse(bag['axios_headers'] as string) as Record<string, string>;
        expect(parsedHeaders['x-powered-by']).toBe('Express');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(axiosErr.path).toBe('/tasks?state=bad');
        expect(axiosErr.method).toBe('GET');
        expect(axiosErr.code).toBe('ERR_BAD_REQUEST');
        expect(axiosErr.source).toBe(AxiosSource.Response);
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
        await axios.get(`${dummyServer.url}/tasks?state=fail`);
      } catch (error) {
        expect(AxiosExceptionBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
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
        expect(parsedHeaders['connection']).toBe('keep-alive');
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
        await axios.get(`${dummyServer.url}/tasks?state=bad`);
      } catch (error) {
        throw AxiosExceptionBag.fromAxiosError('this failed', error as AxiosError);
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
        const err = error as AxiosExceptionBag;
        expect(err.stack).not.toContain('Function.fromAxiosError');
        expect(err.stack).not.toContain('Function.from');
      }
    });
  });
});
