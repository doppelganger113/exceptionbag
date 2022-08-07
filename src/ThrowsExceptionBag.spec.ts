import { ThrowsExceptionBag } from './ThrowsExceptionBag';
import { InBag } from './decorators';
import { ExceptionBag } from './ExceptionBag';
import { from, lastValueFrom, Observable, throwError } from 'rxjs';

/* eslint-disable jest/no-conditional-expect */
describe('ThrowsExceptionBag', () => {
  class RandomException extends Error {
    public constructor(msg?: string) {
      super(msg);
      this.name = RandomException.name;
    }
  }

  class UnhandledException extends Error {
    public constructor(msg?: string) {
      super(msg);
      this.name = UnhandledException.name;
    }
  }

  class CustomParentException extends Error {
    public constructor(msg?: string) {
      super(msg);
      this.name = CustomParentException.name;
    }
  }

  class CustomHttpException extends CustomParentException {
    public constructor(msg?: string) {
      super(msg);
      this.name = CustomHttpException.name;
    }
  }

  class MyClass {
    @ThrowsExceptionBag()
    async getUser(password: string, @InBag('username') username: string) {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('we have failed fetching user')), 100);
      });
    }

    @ThrowsExceptionBag('failed handling user')
    async handleUser(@InBag('id') id: string, @InBag('value') value?: any) {
      return this.getUser('1234', 'admin');
    }

    @ThrowsExceptionBag({ ignore: CustomHttpException, message: 'bad user handling' })
    async handleUserWithIgnore(@InBag('id') id: string, @InBag('value') value?: any) {
      if (id === '1') {
        throw new CustomHttpException('custom failure');
      }
      return this.getUser('1234', 'admin');
    }

    @ThrowsExceptionBag({ ignore: CustomHttpException, message: 'bad user handling' })
    handleUserWithIgnoreObservable(@InBag('id') id: string): Observable<string> {
      if (id === '1') {
        return throwError(() => new CustomHttpException('custom failure'));
      }

      if (id === '2') {
        return throwError(() => new RandomException('random failure'));
      }

      return from('John');
    }

    @ThrowsExceptionBag({
      ignore: [CustomParentException, RandomException],
      message: 'bad user handling',
    })
    async handleUserWithMultiIgnore(@InBag('id') id: string, @InBag('value') value?: any) {
      if (id === '1') {
        throw new CustomParentException('custom failure');
      }
      if (id === '2') {
        throw new RandomException('random failure');
      }
      if (id === '3') {
        throw new UnhandledException('unhandled failure');
      }
      if (id === '4') {
        throw new Error('standard error');
      }
      return this.getUser('1234', 'admin');
    }
  }

  it('should throw exception bag', async () => {
    try {
      await new MyClass().handleUser('1111');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ExceptionBag);
      const exception = error as ExceptionBag;
      expect(exception.message).toBe(
        'failed handling user: failed MyClass getUser: Error we have failed fetching user',
      );
      expect(exception.getBag()).toEqual({
        id: '1111',
        username: 'admin',
        class: 'MyClass',
      });
    }
  });

  describe('ignoring custom errors', () => {
    it('should ignore specified class', async () => {
      try {
        await new MyClass().handleUserWithIgnore('1');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomParentException);
        const exception = error as CustomParentException;
        expect(exception.message).toBe('custom failure');
      }
    });

    it('should ignore specified classes', async () => {
      try {
        await new MyClass().handleUserWithMultiIgnore('1');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomParentException);
        const exception = error as CustomParentException;
        expect(exception.message).toBe('custom failure');
      }

      try {
        await new MyClass().handleUserWithMultiIgnore('2');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(RandomException);
        const exception = error as RandomException;
        expect(exception.message).toBe('random failure');
      }
    });

    it('should ignore specified class when observable', async () => {
      await expect(lastValueFrom(new MyClass().handleUserWithIgnoreObservable('1'))).rejects.toBeInstanceOf(
        CustomParentException,
      );
    });

    it('should throw ExceptionBag when observable and not custom error', async () => {
      await expect(lastValueFrom(new MyClass().handleUserWithIgnoreObservable('2'))).rejects.toBeInstanceOf(
        ExceptionBag,
      );
    });

    it('should ignore class which is not ignored', async () => {
      try {
        await new MyClass().handleUserWithMultiIgnore('3');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ExceptionBag);
        const exception = error as ExceptionBag;
        expect(exception.message).toBe('bad user handling: UnhandledException unhandled failure');
        expect(exception.getBag()).toEqual({
          class: 'MyClass',
          id: '3',
          name: 'UnhandledException',
        });
      }
    });
  });
});
