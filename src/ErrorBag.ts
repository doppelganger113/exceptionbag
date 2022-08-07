import { Constructable } from './types';

export type BagValue = string | number | boolean | undefined;

export interface MetaBag {
  [key: string]: BagValue;
}

/**
 * @description Extension of {@link Error} class used for adding additional meta data which can then later be extracted
 * for easier debugging or logging purposes. {@link ErrorBag} also extends the error message in a chain fashion
 * making it much easier to understand what caused the error in the chain.
 *
 * Important thing to note is that, values in the bag can be overwritten in case the custom class has a property named
 * <strong>description</strong> and you add metadata with key <strong>description</strong> the metadata will
 * <strong>overwrite</strong> the property.
 *
 * @example
 *
 *  // Basic creation, similar to new Error('failed saving to the database')
 *  throw ErrorBag.from('failed saving to the database')
 *    .with('userId', userId);
 *
 *  // Wrapping errors
 *  let userId = '123';
 *  try {
 *    // do something that can fail
 *    usersRepository.fetchUser(userId)
 *  } catch(err) {
 *    throw ErrorBag.from('Failed saving user', err)
 *      .with('userId', userId)
 *  }
 */
export class ErrorBag extends Error {
  /**
   * @description Used to wrap basic {@link Error} classes or custom ones into {@link ErrorBag}. If the error is of
   * type {@link ErrorBag} then it is returned with only the message extended with description. Note that in both
   * cases the stack trace will be kept.
   *
   * If you have a custom error class that extends {@link Error} then properties of that new class will be added to the
   * bag.
   *
   * @example
   *  try {
   *    // code that might fail
   *  } catch (error) {
   *    throw ErrorBag.from('failed fetching user from database', error)
   *      .with('userId', userId);
   *  }
   */
  public static from(description: string, err?: Error | ErrorBag | string | number | boolean): ErrorBag {
    if (!err) {
      const exception = new ErrorBag(description);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Error.captureStackTrace(exception, ErrorBag.from);
      return exception;
    }

    if (err instanceof ErrorBag) {
      err.setMessage(`${description}: ${err.message}`);
      return err;
    }

    return ErrorBag.fromError(description, err);
  }

  private static fromError(description: string, err: Error | string | number | boolean): ErrorBag {
    if (typeof err === 'string' || typeof err === 'number' || typeof err === 'boolean') {
      const exception = new ErrorBag(`${description}: ${String(err)} (${typeof err})`);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Error.captureStackTrace(exception, ErrorBag.from);
      return exception;
    }

    const exception = new ErrorBag(`${description}: ${err.name} ${err.message}`, err);
    exception.stack = err.stack;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const customErr = err as Record<string, any>;
    Object.keys(customErr).forEach((key) => {
      const value: unknown = customErr[key];
      if (value === undefined) {
        return;
      }
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        exception.with(key, value);
      } else {
        exception.with(key, JSON.stringify(value));
      }
    });

    return exception;
  }

  public readonly cause?: Error;

  private meta: MetaBag = {};

  public constructor(msg: string, cause?: Error) {
    super(msg);
    this.name = 'ErrorBag';
    this.cause = cause;
  }

  /**
   * @description Set metadata by key/value pair or by passing an object which is spread 1 level deep converting deeper
   * levels to string.
   */
  public with(map: Record<string, unknown> | object): ErrorBag;
  public with(key: string, value: BagValue): ErrorBag;
  public with(firstArg: string | (Record<string, unknown> | object), secondArg?: BagValue): ErrorBag {
    if (typeof firstArg === 'string') {
      return this.withPair(firstArg, secondArg);
    }

    return this.withSpread(firstArg);
  }

  protected withPair(key: string, value: BagValue): ErrorBag {
    this.meta[key] = value;
    return this;
  }

  /**
   * @description Spreads object properties of 1 level and stringifies 2nd level in the metadata store. Note that this
   * also overrides metadata with the same name/key.
   *
   * @deprecated {@link ErrorBag.with} now supports this functionality as well as key/value pair.
   */
  public withSpread(map: Record<string, unknown> | object): ErrorBag {
    if (!map) {
      return this;
    }

    const iterable = map as Record<string, unknown>;

    Object.keys(iterable).forEach((key) => {
      const value = iterable[key];
      if (value === undefined || value === null) {
        return;
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        this.with(key, value);
        return;
      }

      this.with(key, JSON.stringify(value));
    });

    return this;
  }

  /**
   * @description Get metadata value by key.
   */
  public get(key: string): BagValue {
    return this.meta[key];
  }

  /**
   * @description Does metadata have the specified key.
   */
  public has(key: string): boolean {
    return this.meta[key] !== undefined;
  }

  /**
   * @description Key/value store of metadata related to the error.
   */
  public getBag(): MetaBag {
    return this.meta;
  }

  /**
   * @description Check if ErrorBag wraps specified error class.
   */
  public isCauseInstanceOf<C extends Constructable>(clazz: C): boolean {
    if (!this.cause) {
      return false;
    }

    return this.cause instanceof clazz;
  }

  protected setMessage(msg: string): void {
    this.message = msg;
  }
}
