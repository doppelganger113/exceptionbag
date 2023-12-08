"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionBag = void 0;
/**
 * @description Extension of {@link Error} class used for adding additional metadata which can then later be extracted
 * for easier debugging or logging purposes. {@link ExceptionBag} also extends the error message in a chain fashion
 * making it much easier to understand what caused the error in the chain.
 *
 * Important thing to note is that, values in the bag can be overwritten in case the custom class has a property named
 * <strong>description</strong> and you add metadata with key <strong>description</strong> the metadata will
 * <strong>overwrite</strong> the property.
 *
 * @example
 *
 *  // Basic creation, similar to new Error('failed saving to the database')
 *  throw ExceptionBag.from('failed saving to the database')
 *    .with('userId', userId);
 *
 *  // Wrapping errors
 *  let userId = '123';
 *  try {
 *    // do something that can fail
 *    usersRepository.fetchUser(userId)
 *  } catch(err) {
 *    throw ExceptionBag.from('Failed saving user', err)
 *      .with('userId', userId)
 *  }
 */
class ExceptionBag extends Error {
    constructor(msg, cause) {
        super(msg);
        this.meta = {};
        this.name = ExceptionBag.name;
        this.cause = cause;
    }
    /**
     * @description Used to wrap basic {@link Error} classes or custom ones into {@link ExceptionBag}. If the error is of
     * type {@link ExceptionBag} then it is returned with only the message extended with description. Note that in both
     * cases the stack trace will be kept.
     *
     * If you have a custom error class that extends {@link Error} then properties of that new class will be added to the
     * bag.
     *
     * @example
     *  try {
     *    // code that might fail
     *  } catch (error) {
     *    throw ExceptionBag.from('failed fetching user from database', error)
     *      .with('userId', userId);
     *  }
     */
    static from(description, err) {
        if (!err) {
            const exception = new this(description);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            Error.captureStackTrace(exception, ExceptionBag.from);
            return exception;
        }
        if (err instanceof ExceptionBag) {
            err.setMessage(`${description}: ${err.message}`);
            return err;
        }
        return (this && this.fromError(description, err)) || ExceptionBag.from(description, err);
    }
    static fromError(description, err) {
        if (typeof err === 'string' || typeof err === 'number' || typeof err === 'boolean') {
            const msg = `${description}: ${String(err)} (${typeof err})`;
            const exception = this ? new this(msg) : new ExceptionBag(msg);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            Error.captureStackTrace(exception, ExceptionBag.from);
            return exception;
        }
        const msg = `${description}: ${err.name} ${err.message}`;
        const exception = this ? new this(msg, err) : new ExceptionBag(msg, err);
        exception.stack = err.stack;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const customErr = err;
        Object.keys(customErr).forEach((key) => {
            const value = customErr[key];
            if (value === undefined) {
                return;
            }
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                exception.with(key, value);
            }
            else {
                exception.with(key, JSON.stringify(value));
            }
        });
        return exception;
    }
    with(firstArg, secondArg) {
        if (typeof firstArg === 'string') {
            return this.withPair(firstArg, secondArg);
        }
        return this.withSpread(firstArg);
    }
    withPair(key, value) {
        this.meta[key] = value;
        return this;
    }
    /**
     * @description Spreads object properties of 1 level and stringifies 2nd level in the metadata store. Note that this
     * also overrides metadata with the same name/key.
     *
     * @deprecated {@link ExceptionBag.with} now supports this functionality as well as key/value pair.
     */
    withSpread(map) {
        if (!map) {
            return this;
        }
        const iterable = map;
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
    get(key) {
        return this.meta[key];
    }
    /**
     * @description Does metadata have the specified key.
     */
    has(key) {
        return this.meta[key] !== undefined;
    }
    /**
     * @description Key/value store of metadata related to the error.
     */
    getBag() {
        return this.meta;
    }
    /**
     * @description Check if ExceptionBag wraps specified error class.
     */
    isCauseInstanceOf(clazz) {
        if (!this.cause) {
            return false;
        }
        return this.cause instanceof clazz;
    }
    setMessage(msg) {
        this.message = msg;
    }
}
exports.ExceptionBag = ExceptionBag;
//# sourceMappingURL=ExceptionBag.js.map