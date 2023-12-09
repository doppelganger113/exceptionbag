import 'reflect-metadata';
import { ExceptionBag } from './ExceptionBag';
import { AxiosExceptionBag } from './AxiosExceptionBag';
import { createDummyServer, DummyServer } from './TestServer';
import axios from 'axios';

class FatalExceptionBag extends ExceptionBag {
  public constructor(msg: string, cause?: Error) {
    super(msg, cause);
    this.name = FatalExceptionBag.name;
  }
}

describe('ExceptionBag', () => {
  let dummyServer: DummyServer;

  beforeAll(() => {
    dummyServer = createDummyServer();
  });

  afterAll(() => {
    dummyServer.close();
  });

  describe('constructor', () => {
    it('should create in standard way', () => {
      const err = ExceptionBag.from('We failed!');
      expect(err.message).toBe('We failed!');
      expect(err.name).toBe('ExceptionBag');
      expect(err.stack).toBeTruthy();
      expect(err).toBeInstanceOf(ExceptionBag);
    });

    it('should allow mapping with key value pairs', () => {
      const err = ExceptionBag.from('We failed!').with('userId', 1234).with('name', 'John').with('isAdmin', true);

      expect(err.get('userId')).toBe(1234);
      expect(err.get('name')).toBe('John');
      expect(err.get('isAdmin')).toBe(true);
    });

    it('should allow mapping with objects', () => {
      const err = ExceptionBag.from('We failed!').with({
        myNumber: NaN,
        userId: 1234,
        name: 'John',
        isAdmin: true,
        person: {
          name: 'Mary',
          age: 25,
        },
      });

      expect(err.get('myNumber')).toBe(NaN);
      expect(err.get('userId')).toBe(1234);
      expect(err.get('name')).toBe('John');
      expect(err.get('isAdmin')).toBe(true);
      expect(JSON.parse(err.get('person') as string)).toEqual({ name: 'Mary', age: 25 });
    });

    it('should handle arrays, even though not preferred', () => {
      const exception = ExceptionBag.from('We failed!').with([{ value: 'whatever' }]);
      expect(JSON.parse(exception.get('0') as string)).toEqual({ value: 'whatever' });
    });
  });

  describe('withSpread', () => {
    it("should spread object and it's properties in the bag", () => {
      const anObject = {
        name: 'John',
        id: '1234',
        nested: {
          address: {
            street: "Saint John's",
          },
          number: 3,
        },
        isAdmin: true,
      };

      const exception = ExceptionBag.from('whatever').withSpread(anObject);

      const { name, id, nested, isAdmin } = exception.getBag();
      expect(name).toBe('John');
      expect(id).toBe('1234');
      expect(isAdmin).toBe(true);
      expect(JSON.parse(nested as string)).toEqual(anObject.nested);
    });

    it('should work with interface and classes', () => {
      interface ICustom {
        name: string;
        id: string;
        isAdmin: boolean;
      }

      class Person {
        name: string;
        id: string;
        isAdmin: boolean;
      }

      const anObject: ICustom = {
        name: 'John',
        id: '1234',
        isAdmin: true,
      };

      const exception = ExceptionBag.from('whatever').withSpread(anObject);
      expect(exception.getBag()).toEqual({
        name: 'John',
        id: '1234',
        isAdmin: true,
      });

      const person = new Person();
      person.isAdmin = true;
      person.id = '1234';
      person.name = 'John';

      const exception2 = ExceptionBag.from('whatever').withSpread(person);
      expect(exception2.getBag()).toEqual({
        name: 'John',
        id: '1234',
        isAdmin: true,
      });
    });

    it('should not do anything on empty map', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(ExceptionBag.from('whatever').withSpread(null).getBag()).toEqual({});
    });
  });

  describe('from', () => {
    it('should create from standard error and wrap', () => {
      const err = new Error('something failed');
      const exception = ExceptionBag.from('testing failure', err);
      expect(exception).toBeInstanceOf(ExceptionBag);
      expect(exception.name).toBe('ExceptionBag');
      expect(exception.message).toBe('testing failure: Error something failed');
      expect(exception.getBag()).toEqual({});
    });

    it('should properly wrap ExceptionBag', () => {
      const err = ExceptionBag.from('something failed').with('userId', 1234).with('name', 'John');

      const exception = ExceptionBag.from('testing failure', err).with('name', 'Mary');
      expect(exception).toBeInstanceOf(ExceptionBag);
      expect(exception.name).toBe('ExceptionBag');
      expect(exception.message).toBe('testing failure: something failed');
      expect(exception.getBag()).toEqual({ userId: 1234, name: 'Mary' });
    });

    it('should properly wrap AxiosExceptionBag', async () => {
      /* eslint-disable jest/no-conditional-expect */
      expect.assertions(6);
      try {
        await axios.get(`${dummyServer.url}/tasks?state=bad`);
      } catch (error) {
        expect(AxiosExceptionBag.isAxiosError(error)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const axiosErr = AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
        const exception = ExceptionBag.from('failed business logic', axiosErr).with('custom', 1111);

        expect(exception.message).toBe(
          'failed business logic: failed fetching tasks: Request failed with status code 400',
        );
        expect(exception.name).toBe('AxiosExceptionBag');
        expect(exception.get('custom')).toBe(1111);
        expect(exception).toBeInstanceOf(AxiosExceptionBag);
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

      const exception = ExceptionBag.from('we have failed', new CustomError('custom failure')).with('userId', 1234);

      expect(exception).toBeInstanceOf(ExceptionBag);
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
      const exception = ExceptionBag.from('we have failed', null).with('userId', 1234);

      expect(exception.cause).toBeUndefined();
      expect(exception.message).toBe('we have failed');
      expect(exception.getBag()).toEqual({ userId: 1234 });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const exception2 = ExceptionBag.from('we have failed', 'text error').with('userId', 1234);
      expect(exception2.cause).toBe(undefined);
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
            throw ExceptionBag.from('wrapping error', err as Error);
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
            throw ExceptionBag.from('wrapping error', err as Error);
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
  });

  describe('custom exception bag class', () => {
    it('should be possible to extend the class and catch the extended instance', () => {
      const exception = FatalExceptionBag.from('new fatal error', new Error('failure')).with({ name: 'John' });
      expect(exception).toBeInstanceOf(FatalExceptionBag);
      expect(exception).toBeInstanceOf(ExceptionBag);
      expect(exception.getBag()).toEqual({ name: 'John' });
    });
  });
});
