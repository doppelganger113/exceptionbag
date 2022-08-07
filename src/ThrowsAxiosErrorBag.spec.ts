import { ThrowsAxiosExceptionBag } from './ThrowsAxiosExceptionBag';
import { ExceptionBag } from './ExceptionBag';
import { Observable, throwError, lastValueFrom, tap } from 'rxjs';
import { InBag } from './decorators';
import { createDummyServer, DummyServer } from './TestServer';
import axios, { AxiosResponse } from 'axios';
import { AxiosExceptionBag } from './AxiosExceptionBag';
import { Span } from 'nestjs-otel';

class User {
  name: string;
  age: number;
}

class MyClass {
  public constructor(private readonly client?: any, private readonly url?: string) {}

  @ThrowsAxiosExceptionBag('failed fetching data')
  @Span()
  async getData(@InBag('userId') userId: string, isSuccess = false): Promise<AxiosResponse<object>> {
    const client = axios.create({ baseURL: 'http://localhost', timeout: 2_000 });
    return await client.get(`${this.url || ''}/tasks?state=${isSuccess ? '' : 'bad'}`);
  }

  @ThrowsAxiosExceptionBag('failed fetching data')
  @Span()
  async getDataSuccess(): Promise<object> {
    const { data } = await this.getData('1234', true);
    return data;
  }

  @ThrowsAxiosExceptionBag()
  async getUser(@InBag('userId') userId: string, name: string, @InBag() age: number): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('we have failed')), 100);
    });
  }

  @ThrowsAxiosExceptionBag('failed fetching user')
  async getUserWithMessage(@InBag('userId') userId: string, name: string, @InBag() age: number): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('we have failed')), 100);
    });
  }

  @ThrowsAxiosExceptionBag()
  getUserSync(@InBag('user') user: User): User {
    throw new Error('we have failed sync');
  }

  @ThrowsAxiosExceptionBag()
  getUserObservable(@InBag('userId') userId: string, name: string, @InBag() age: number): Observable<User> {
    return throwError(() => new Error('we have failed observing'));
  }

  @ThrowsAxiosExceptionBag()
  getUserSyncNoItems(user: User): User {
    throw new Error('we have failed sync');
  }

  @ThrowsAxiosExceptionBag()
  getUserSyncNoArguments(): User {
    throw new Error('we have failed sync');
  }
}

/* eslint-disable jest/no-conditional-expect */
describe('ThrowsAxiosExceptionBag', () => {
  let dummyServer: DummyServer;

  beforeAll(() => {
    dummyServer = createDummyServer();
  });

  afterAll(() => {
    dummyServer.close();
  });

  it('should work with @Span decorator', async () => {
    const data: any = await new MyClass(undefined, dummyServer.url).getDataSuccess();
    expect(data).toEqual({ id: 1 });
  });

  it('should fail with axios error', async () => {
    /* eslint-disable jest/no-conditional-expect */
    expect.assertions(3);
    try {
      await new MyClass().getData('unique');
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosExceptionBag);
      const exception = error as AxiosExceptionBag;
      expect(exception.message).toBe('failed fetching data: connect ECONNREFUSED 127.0.0.1:80');
      expect(exception.getBag()).toEqual({
        axios_baseUrl: 'http://localhost',
        axios_code: 'ECONNREFUSED',
        axios_headers: '{}',
        axios_method: 'GET',
        axios_path: '',
        axios_source: 'Request',
        axios_status: 0,
        axios_statusText: '',
        axios_timeout: 2000,
        userId: 'unique',
        axios_data: undefined,
        class: 'MyClass',
      });
    }
  });

  it('should handle sync failure with object argument', () => {
    expect.assertions(4);

    try {
      new MyClass().getUserSync({ age: 30, name: 'Nick' });
    } catch (error) {
      expect(error).toBeTruthy();

      expect(error).toBeInstanceOf(ExceptionBag);
      const exception = error as ExceptionBag;
      expect(exception.message).toBe('failed MyClass getUserSync: Error we have failed sync');
      expect(exception.getBag()).toEqual({
        user: JSON.stringify({ age: 30, name: 'Nick' }),
        class: 'MyClass',
      });
    }
  });

  it('should handle sync failure with no decorators', () => {
    expect.assertions(4);

    try {
      new MyClass().getUserSyncNoItems({ age: 30, name: 'Nick' });
    } catch (error) {
      expect(error).toBeTruthy();

      expect(error).toBeInstanceOf(ExceptionBag);
      const exception = error as ExceptionBag;
      expect(exception.message).toBe('failed MyClass getUserSyncNoItems: Error we have failed sync');
      expect(exception.getBag()).toEqual({
        class: 'MyClass',
      });
    }
  });

  it('should handle sync failure with no arguments', () => {
    expect.assertions(4);

    try {
      new MyClass().getUserSyncNoArguments();
    } catch (error) {
      expect(error).toBeTruthy();

      expect(error).toBeInstanceOf(ExceptionBag);
      const exception = error as ExceptionBag;
      expect(exception.message).toBe('failed MyClass getUserSyncNoArguments: Error we have failed sync');
      expect(exception.getBag()).toEqual({
        class: 'MyClass',
      });
    }
  });

  it('should handle promise failure with custom message', async () => {
    expect.assertions(4);

    try {
      await new MyClass().getUserWithMessage('1234', 'John', 31);
    } catch (error) {
      expect(error).toBeTruthy();

      expect(error).toBeInstanceOf(ExceptionBag);
      const exception = error as ExceptionBag;
      expect(exception.message).toBe('failed fetching user: Error we have failed');
      expect(exception.getBag()).toEqual({
        arg_2: 31,
        userId: '1234',
        class: 'MyClass',
      });
    }
  });

  it('should handle failure with promise', async () => {
    expect.assertions(4);

    try {
      await new MyClass().getUser('1234', 'John', 31);
    } catch (error) {
      expect(error).toBeTruthy();

      expect(error).toBeInstanceOf(ExceptionBag);
      const exception = error as ExceptionBag;
      expect(exception.message).toBe('failed MyClass getUser: Error we have failed');
      expect(exception.getBag()).toEqual({
        arg_2: 31,
        userId: '1234',
        class: 'MyClass',
      });
    }
  });

  it('should handle failure with observable', async () => {
    expect.assertions(5);
    /* eslint-disable jest/no-conditional-expect */
    const myfn = jest.fn();

    try {
      await lastValueFrom(new MyClass().getUserObservable('1234', 'John', 31).pipe(tap(myfn)));
    } catch (error) {
      expect(error).toBeTruthy();
      expect(myfn).not.toHaveBeenCalled();

      expect(error).toBeInstanceOf(ExceptionBag);
      const exception = error as ExceptionBag;
      expect(exception.message).toBe('failed MyClass getUserObservable: Error we have failed observing');
      expect(exception.getBag()).toEqual({
        arg_2: 31,
        userId: '1234',
        class: 'MyClass',
      });
    }
  });
});
