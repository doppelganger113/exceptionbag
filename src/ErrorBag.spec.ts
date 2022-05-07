import * as http from 'http';
import { createDummyServer } from './TestServer';
import axios from 'axios';
import { ErrorBag } from './ErrorBag';
import { AxiosErrorBag } from './AxiosErrorBag';

describe('ErrorBag', () => {
  let server: http.Server;

  beforeAll(() => {
    server = createDummyServer().listen(3010);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('constructor', () => {
    it('should create in standard way', () => {
      const err = ErrorBag.from('We failed!');
      expect(err.message).toBe('We failed!');
      expect(err.name).toBe('ErrorBag');
      expect(err.stack).toBeTruthy();
      expect(err).toBeInstanceOf(ErrorBag);
    });
  });

  describe('from', () => {
    it('should create from standard error and wrap', () => {
      const err = new Error('something failed');
      const exception = ErrorBag.from('testing failure', err);
      expect(exception).toBeInstanceOf(ErrorBag);
      expect(exception.name).toBe('ErrorBag');
      expect(exception.message).toBe('testing failure: Error something failed');
      expect(exception.getBag()).toEqual({});
    });

    it('should properly wrap ErrorBag', () => {
      const err = ErrorBag.from('something failed').with('userId', 1234).with('name', 'John');

      const exception = ErrorBag.from('testing failure', err).with('name', 'Mary');
      expect(exception).toBeInstanceOf(ErrorBag);
      expect(exception.name).toBe('ErrorBag');
      expect(exception.message).toBe('testing failure: something failed');
      expect(exception.getBag()).toEqual({ userId: 1234, name: 'Mary' });
    });

    it('should properly wrap AxiosErrorBag', async () => {
      /* eslint-disable jest/no-conditional-expect */
      expect.assertions(6);
      try {
        await axios.get('http://localhost:3010/tasks?state=bad');
      } catch (error) {
        expect(AxiosErrorBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosErrorBag.fromAxiosError('failed fetching tasks', error);
        const exception = ErrorBag.from('failed business logic', axiosErr).with('custom', 1111);

        expect(exception.message).toBe(
          'failed business logic: failed fetching tasks: Request failed with status code 400',
        );
        expect(exception.name).toBe('AxiosErrorBag');
        expect(exception.get('custom')).toBe(1111);
        expect(exception).toBeInstanceOf(AxiosErrorBag);
        expect(exception.get('axios_status')).toBe(400);
      }
    });

    it('should wrap custom errors and copy fields', () => {
      class CustomError extends Error {
        private readonly purpose = 'to test';
        public canceled: boolean;
        public timeout: number;

        constructor(msg: string) {
          super(msg);
          this.name = 'CustomError';
          this.timeout = 100;
        }
      }

      const exception = ErrorBag.from('we have failed', new CustomError('custom failure')).with('userId', 1234);

      expect(exception).toBeInstanceOf(ErrorBag);
      expect(exception.isCauseInstanceOf(CustomError)).toBeTruthy();
      expect(exception.getBag()).toEqual({
        purpose: 'to test',
        name: 'CustomError',
        timeout: 100,
        userId: 1234,
      });
    });

    it('should handle unexpected error values accordingly', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const exception = ErrorBag.from('we have failed', null).with('userId', 1234);

      expect(exception.getCause()).toBeUndefined();
      expect(exception.message).toBe('we have failed');
      expect(exception.getBag()).toEqual({ userId: 1234 });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const exception2 = ErrorBag.from('we have failed', 'text error').with('userId', 1234);
      expect(exception2.getCause()).toBe(undefined);
      expect(exception2.message).toBe('we have failed: text error (string)');
      expect(exception2.getBag()).toEqual({ userId: 1234 });
    });

    const assertValidStack = (err: Error): void | never => {
      expect(err.stack).not.toContain('Function.from');
      expect(err.stack).toContain('at myFunc1');
      expect(err.stack).toContain('at myFunc2');
      expect(err.stack).toContain('at myFunc3');
    };

    it('should have a proper stack trace when Error is caught', () => {
      expect.assertions(4);
      try {
        const myFunc1 = () => {
          throw new Error('Testing this');
        };
        const myFunc2 = () => {
          try {
            myFunc1();
          } catch (err) {
            throw ErrorBag.from('wrapping error', err as Error);
          }
        };
        const myFunc3 = () => {
          myFunc2();
        };
        myFunc3();
      } catch (error) {
        assertValidStack(error as Error);
      }
    });

    it('should have a proper stack trace when string Error is caught', () => {
      expect.assertions(3);
      try {
        const myFunc1 = () => {
          throw 'Testing this';
        };
        const myFunc2 = () => {
          try {
            myFunc1();
          } catch (err) {
            throw ErrorBag.from('wrapping error', err as Error);
          }
        };
        const myFunc3 = () => {
          myFunc2();
        };
        myFunc3();
      } catch (error) {
        const err = error as Error;
        expect(err.stack).not.toContain('Function.from');
        expect(err.stack).toContain('at myFunc2');
        expect(err.stack).toContain('at myFunc3');
      }
    });

    it('should have a proper stack trace when ErrorBag Error is caught', () => {
      expect.assertions(4);
      try {
        const myFunc1 = () => {
          throw ErrorBag.from('original error');
        };
        const myFunc2 = () => {
          try {
            myFunc1();
          } catch (err) {
            throw ErrorBag.from('wrapping error', err as Error);
          }
        };
        const myFunc3 = () => {
          myFunc2();
        };
        myFunc3();
      } catch (error) {
        const err = error as Error;
        expect(err.stack).not.toContain('Function.from');
        expect(err.stack).toContain('at myFunc1');
        expect(err.stack).toContain('at myFunc2');
        expect(err.stack).toContain('at myFunc3');
      }
    });
  });
});
